import {
  CheckHpEffect,
  Effect,
  State,
  StoreLike,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class BraveryCharm extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckHpEffect && effect.target.trainers.cards.includes(this) && effect.target.isBasic()) {
      effect.hp += 50;
    }

    return state;
  }
}
