import {
  CardTag,
  DealDamageEffect,
  Effect,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function isPokemonEx(card: any): boolean {
  return card !== undefined && Array.isArray(card.tags) && card.tags.includes(CardTag.POKEMON_EX);
}

export class JiXianYaoDai extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof DealDamageEffect && effect.source.trainers.cards.includes(this)) {
      const opponent = StateUtils.getOpponent(state, effect.player);
      const targetCard = effect.target.getPokemonCard();
      if (effect.damage > 0 && effect.target === opponent.active && isPokemonEx(targetCard)) {
        effect.damage += 50;
      }
    }

    return state;
  }
}
