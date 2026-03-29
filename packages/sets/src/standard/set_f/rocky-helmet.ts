import {
  CardTag,
  DealDamageEffect,
  Effect,
  PokemonCard,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function isRuleBox(pokemon: PokemonCard | undefined): boolean {
  if (pokemon === undefined) {
    return false;
  }

  return pokemon.tags.includes(CardTag.POKEMON_EX)
    || pokemon.tags.includes(CardTag.POKEMON_V)
    || pokemon.tags.includes(CardTag.POKEMON_VSTAR)
    || pokemon.tags.includes(CardTag.RADIANT)
    || pokemon.tags.includes(CardTag.TERA)
    || pokemon.tags.includes(CardTag.POKEMON_GX)
    || pokemon.tags.includes(CardTag.POKEMON_LV_X);
}

export class RockyHelmet extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof DealDamageEffect && effect.target.trainers.cards.includes(this)) {
      const owner = StateUtils.findOwner(state, effect.target);
      const pokemon = effect.target.getPokemonCard();
      if (effect.player !== owner && effect.damage > 0 && !isRuleBox(pokemon)) {
        effect.damage = Math.max(0, effect.damage - 30);
      }
    }

    return state;
  }
}
