import {
  DealDamageEffect,
  Effect,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function isStage1Pokemon(pokemon: PokemonCard | undefined): boolean {
  return pokemon !== undefined && pokemon.stage === Stage.STAGE_1;
}

export class BindingBand extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof DealDamageEffect && effect.target.trainers.cards.includes(this)) {
      const owner = StateUtils.findOwner(state, effect.target);
      const pokemon = effect.target.getPokemonCard();
      if (effect.player !== owner && effect.damage > 0 && isStage1Pokemon(pokemon)) {
        effect.damage = Math.max(0, effect.damage - 30);
      }
    }

    return state;
  }
}
