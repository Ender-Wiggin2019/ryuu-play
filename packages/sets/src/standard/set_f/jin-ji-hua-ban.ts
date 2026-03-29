import { CheckRetreatCostEffect, Effect, State, StoreLike, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class JinJiHuaBan extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckRetreatCostEffect && effect.player.active.trainers.cards.includes(this)) {
      const pokemonCard = effect.player.active.getPokemonCard();
      if (pokemonCard === undefined) {
        return state;
      }

      const remainingHp = pokemonCard.hp - effect.player.active.damage;
      if (remainingHp <= 30) {
        effect.cost = [];
      } else if (effect.cost.length > 0) {
        effect.cost = effect.cost.slice(1);
      }
    }

    return state;
  }
}
