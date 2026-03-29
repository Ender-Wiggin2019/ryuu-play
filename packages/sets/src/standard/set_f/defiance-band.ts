import { DealDamageEffect, Effect, State, StateUtils, StoreLike } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class DefianceBand extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof DealDamageEffect && effect.source.trainers.cards.includes(this)) {
      const opponent = StateUtils.getOpponent(state, effect.player);
      if (effect.player.getPrizeLeft() > opponent.getPrizeLeft() && effect.damage > 0 && effect.target === opponent.active) {
        effect.damage += 30;
      }
    }

    return state;
  }
}
