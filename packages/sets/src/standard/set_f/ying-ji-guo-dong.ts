import {
  CheckHpEffect,
  Effect,
  EndTurnEffect,
  HealEffect,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class YingJiGuoDong extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof EndTurnEffect) {
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);
      const cardList = StateUtils.findCardList(state, this);
      const owner = StateUtils.findOwner(state, cardList);
      if (pokemonSlot === undefined || !cardList.cards.includes(this) || pokemonSlot.damage === 0) {
        return state;
      }

      const hpEffect = new CheckHpEffect(owner, pokemonSlot);
      state = store.reduceEffect(state, hpEffect);
      const remainingHp = hpEffect.hp - pokemonSlot.damage;
      if (remainingHp > 30) {
        return state;
      }

      state = store.reduceEffect(state, new HealEffect(owner, pokemonSlot, 120));
      cardList.moveCardTo(this, owner.discard);
    }

    return state;
  }
}
