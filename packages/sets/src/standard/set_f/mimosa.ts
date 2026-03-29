import {
  Card,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  PokemonCard,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect
): IterableIterator<State> {
  const player = effect.player;

  const blocked: number[] = [];
  let pokemonCount = 0;
  player.discard.cards.forEach((card, index) => {
    if (card instanceof PokemonCard) {
      pokemonCount += 1;
    } else {
      blocked.push(index);
    }
  });

  let selected: Card[] = [];
  if (pokemonCount > 0) {
    yield store.prompt(
      state,
      new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_DECK,
        player.discard,
        {},
        { min: 0, max: Math.min(5, pokemonCount), allowCancel: false, blocked }
      ),
      cards => {
        selected = cards || [];
        next();
      }
    );
  }

  if (selected.length > 0) {
    player.discard.moveCardsTo(selected, player.deck);
    const opponent = StateUtils.getOpponent(state, player);
    yield store.prompt(state, new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selected), () =>
      next()
    );
  }

  yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
    next();
  });

  player.deck.moveTo(player.hand, Math.min(3, player.deck.cards.length));
  return state;
}

export class Mimosa extends VariantTrainerCard {
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
