import {
  Card,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  PlayerType,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const names = new Set<string>();

  opponent.forEachPokemon(PlayerType.TOP_PLAYER, (_slot, card) => {
    if (card instanceof PokemonCard) {
      names.add(card.name);
    }
  });

  const blocked: number[] = [];
  let validCount = 0;
  player.deck.cards.forEach((card, index) => {
    if (card instanceof PokemonCard && names.has(card.name)) {
      validCount += 1;
    } else {
      blocked.push(index);
    }
  });

  if (validCount === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  effect.preventDefault = true;

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.deck,
      {},
      { min: 1, max: 1, allowCancel: true, blocked }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  player.hand.moveCardTo(effect.trainerCard, player.discard);
  player.deck.moveCardsTo(selected, player.hand);

  yield store.prompt(
    state,
    new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selected),
    () => next()
  );

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class SweetBall extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
