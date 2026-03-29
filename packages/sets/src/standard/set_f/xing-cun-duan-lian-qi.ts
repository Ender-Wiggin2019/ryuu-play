import {
  CheckHpEffect,
  Effect,
  GamePhase,
  PutDamageEffect,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class XingCunDuanLianQi extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PutDamageEffect && effect.target.trainers.cards.includes(this)) {
      const owner = StateUtils.findOwner(state, effect.target);
      if (state.phase !== GamePhase.ATTACK || effect.player === owner) {
        return state;
      }

      const hpEffect = new CheckHpEffect(owner, effect.target);
      state = store.reduceEffect(state, hpEffect);

      if (effect.target.damage !== 0 || effect.damage < hpEffect.hp) {
        return state;
      }

      effect.damage = Math.max(0, hpEffect.hp - 10);
      const cardList = StateUtils.findCardList(state, this);
      cardList.moveCardTo(this, owner.discard);
    }

    return state;
  }
}
