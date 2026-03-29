import {
  AfterDamageEffect,
  Effect,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class LuckyHelmet extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AfterDamageEffect && effect.target.trainers.cards.includes(this)) {
      const owner = StateUtils.findOwner(state, effect.target);
      if (effect.damage <= 0 || owner.active !== effect.target || effect.player === owner) {
        return state;
      }

      owner.deck.moveTo(owner.hand, 2);
    }

    return state;
  }
}
