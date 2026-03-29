import { CardTag, DealDamageEffect, Effect, State, StateUtils, StoreLike } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function isPokemonV(target: any): boolean {
  const pokemon = target.getPokemonCard?.();
  if (pokemon === undefined) {
    return false;
  }

  return pokemon.tags.includes(CardTag.POKEMON_V) || pokemon.tags.includes(CardTag.POKEMON_VSTAR);
}

export class ChoiceBelt extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof DealDamageEffect && effect.source.trainers.cards.includes(this)) {
      const opponent = StateUtils.getOpponent(state, effect.player);
      if (effect.damage > 0 && effect.target === opponent.active && isPokemonV(effect.target)) {
        effect.damage += 30;
      }
    }

    return state;
  }
}
