import { DealDamageEffect, Effect, Stage, State, StateUtils, StoreLike, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class PracticeStudio extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.STADIUM;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.STADIUM;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof DealDamageEffect && StateUtils.getStadiumCard(state) === this) {
      const source = effect.source.getPokemonCard();
      const opponent = StateUtils.getOpponent(state, effect.player);
      if (effect.target !== opponent.active || effect.damage <= 0 || source?.stage !== Stage.STAGE_1) {
        return state;
      }

      effect.damage += 10;
    }

    return state;
  }
}
