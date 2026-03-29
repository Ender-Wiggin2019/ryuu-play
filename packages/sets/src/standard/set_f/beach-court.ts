import { CardType, CheckRetreatCostEffect, Effect, Stage, State, StateUtils, StoreLike, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class BeachCourt extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.STADIUM;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.STADIUM;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckRetreatCostEffect && StateUtils.getStadiumCard(state) === this) {
      const pokemon = effect.player.active.getPokemonCard();
      if (pokemon !== undefined && pokemon.stage === Stage.BASIC) {
        const index = effect.cost.indexOf(CardType.COLORLESS);
        if (index !== -1) {
          effect.cost.splice(index, 1);
        }
      }
    }

    return state;
  }
}
