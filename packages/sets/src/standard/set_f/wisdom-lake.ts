import {
  CardType,
  CheckProvidedEnergyEffect,
  DealDamageEffect,
  Effect,
  PokemonSlot,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function hasWaterOrFightingEnergy(store: StoreLike, state: State, target: PokemonSlot): boolean {
  const checkProvidedEnergy = new CheckProvidedEnergyEffect(StateUtils.findOwner(state, target), target);
  store.reduceEffect(state, checkProvidedEnergy);
  return StateUtils.checkEnoughEnergy(checkProvidedEnergy.energyMap, [CardType.WATER])
    || StateUtils.checkEnoughEnergy(checkProvidedEnergy.energyMap, [CardType.FIGHTING]);
}

export class WisdomLake extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.STADIUM;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.STADIUM;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof DealDamageEffect && StateUtils.getStadiumCard(state) === this) {
      if (effect.damage <= 0) {
        return state;
      }

      const owner = StateUtils.findOwner(state, effect.target);
      if (effect.player !== owner && hasWaterOrFightingEnergy(store, state, effect.target)) {
        effect.damage = Math.max(0, effect.damage - 20);
      }
    }

    return state;
  }
}
