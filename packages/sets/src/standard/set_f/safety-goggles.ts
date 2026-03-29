import { ApplyWeaknessEffect, Effect, State, StoreLike } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class SafetyGoggles extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof ApplyWeaknessEffect && effect.target.trainers.cards.includes(this) && effect.target.isBasic()) {
      effect.ignoreWeakness = true;
    }

    return state;
  }
}
