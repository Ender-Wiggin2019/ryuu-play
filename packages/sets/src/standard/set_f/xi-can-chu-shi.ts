import { Effect, HealEffect, State, StoreLike, TrainerEffect } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function playCard(store: StoreLike, state: State, effect: TrainerEffect): State {
  const player = effect.player;
  const healEffect = new HealEffect(player, player.active, Math.min(70, player.active.damage));
  store.reduceEffect(state, healEffect);
  return state;
}

export class XiCanChuShi extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      return playCard(store, state, effect);
    }

    return state;
  }
}
