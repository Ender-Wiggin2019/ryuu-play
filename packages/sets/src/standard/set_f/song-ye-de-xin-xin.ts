import {
  Card,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const blocked: number[] = [];
  let hasDiscardable = false;

  player.hand.cards.forEach((card, index) => {
    if (card !== effect.trainerCard) {
      hasDiscardable = true;
      return;
    }
    blocked.push(index);
  });

  if (!hasDiscardable) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      player.hand,
      {},
      { min: 1, max: 1, allowCancel: false, blocked }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  player.hand.moveCardsTo(selected, player.discard);
  player.deck.moveTo(player.hand, Math.min(opponent.bench.filter(slot => slot.pokemons.cards.length > 0).length, player.deck.cards.length));

  return state;
}

export class SongYeDeXinXin extends VariantTrainerCard {
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
