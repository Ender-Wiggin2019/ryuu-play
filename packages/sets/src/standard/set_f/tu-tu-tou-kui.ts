import { AfterDamageEffect, Effect, State, StateUtils, StoreLike } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class TuTuTouKui extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AfterDamageEffect && effect.target.trainers.cards.includes(this)) {
      const owner = StateUtils.findOwner(state, effect.target);
      if (effect.damage > 0 && effect.player !== owner) {
        const attacker = StateUtils.getOpponent(state, owner);
        attacker.active.damage += 20;
      }
    }

    return state;
  }
}
