import { CardType, DealDamageEffect, Effect, PokemonCard, State, StateUtils, StoreLike, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function isMetalPokemon(pokemon: PokemonCard | undefined): boolean {
  return pokemon !== undefined && pokemon.cardTypes.includes(CardType.METAL);
}

export class MetalLab extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.STADIUM;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.STADIUM;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof DealDamageEffect && StateUtils.getStadiumCard(state) === this) {
      const pokemon = effect.target.getPokemonCard();
      const owner = StateUtils.findOwner(state, effect.target);
      if (effect.damage <= 0 || effect.player === owner || !isMetalPokemon(pokemon)) {
        return state;
      }

      effect.damage = Math.max(0, effect.damage - 30);
    }

    return state;
  }
}
