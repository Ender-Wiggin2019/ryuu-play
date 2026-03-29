import {
  DealDamageEffect,
  Effect,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class DefianceVest extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof DealDamageEffect && effect.target.trainers.cards.includes(this)) {
      const owner = StateUtils.findOwner(state, effect.target);
      if (owner.getPrizeLeft() > effect.player.getPrizeLeft() && effect.damage > 0) {
        effect.damage = Math.max(0, effect.damage - 40);
      }
    }

    return state;
  }
}
