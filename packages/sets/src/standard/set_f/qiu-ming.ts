import {
  Effect,
  GameError,
  GameMessage,
  ShuffleDeckPrompt,
  SpecialCondition,
  State,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = state.players[state.activePlayer === 0 ? 1 : 0];

  if (!opponent.active.specialConditions.includes(SpecialCondition.POISONED)) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  player.hand.moveTo(player.deck);

  yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
    next();
  });

  player.deck.moveTo(player.hand, Math.min(7, player.deck.cards.length));
  return state;
}

export class QiuMing extends VariantTrainerCard {
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
