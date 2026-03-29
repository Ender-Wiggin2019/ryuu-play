import {
  AfterDamageEffect,
  CardTag,
  CheckHpEffect,
  Effect,
  PutCountersEffect,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function isPokemonV(card: any): boolean {
  return card !== undefined && Array.isArray(card.tags) && card.tags.includes(CardTag.POKEMON_V);
}

export class ZaiHuoXiang extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AfterDamageEffect && effect.target.trainers.cards.includes(this)) {
      const owner = StateUtils.findOwner(state, effect.target);
      const targetCard = effect.target.getPokemonCard();
      if (owner === undefined || targetCard === undefined) {
        return state;
      }

      if (effect.attackEffect.player === owner) {
        return state;
      }

      const checkHpEffect = new CheckHpEffect(owner, effect.target);
      store.reduceEffect(state, checkHpEffect);

      if (!isPokemonV(targetCard) || effect.target.damage !== effect.damage || effect.target.damage < checkHpEffect.hp) {
        return state;
      }

      const putCountersEffect = new PutCountersEffect(effect.attackEffect, 80);
      putCountersEffect.target = effect.attackEffect.player.active;
      state = store.reduceEffect(state, putCountersEffect);
    }

    return state;
  }
}
