import {
  CardTag,
  CheckAttackCostEffect,
  CheckProvidedEnergyEffect,
  Effect,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class SparklingCrystal extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckAttackCostEffect && effect.player.active.trainers.cards.includes(this)) {
      const pokemon = effect.player.active.getPokemonCard();
      if (!pokemon?.tags.includes(CardTag.TERA) || effect.cost.length === 0) {
        return state;
      }

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(effect.player);
      store.reduceEffect(state, checkProvidedEnergy);

      let bestIndex = 0;
      for (let index = 0; index < effect.cost.length; index++) {
        const reducedCost = effect.cost.slice();
        reducedCost.splice(index, 1);
        if (StateUtils.checkEnoughEnergy(checkProvidedEnergy.energyMap, reducedCost)) {
          bestIndex = index;
          break;
        }
      }

      effect.cost.splice(bestIndex, 1);
    }

    return state;
  }
}
