import { Effect, GamePhase, KnockOutEffect, State, StateUtils, StoreLike, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class FuChouQuanXiang extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof KnockOutEffect && effect.target.trainers.cards.includes(this)) {
      const owner = StateUtils.findOwner(state, effect.target);
      if (state.phase !== GamePhase.ATTACK || effect.player !== owner) {
        return state;
      }

      const attacker = StateUtils.getOpponent(state, owner);
      attacker.active.damage += 40;
    }

    return state;
  }
}
