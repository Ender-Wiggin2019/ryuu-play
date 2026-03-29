import { Effect, State, StoreLike, TrainerEffect } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class ShenAoDeHuoBan extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;
      player.deck.moveTo(player.hand, Math.min(3, player.deck.cards.length));
    }

    return state;
  }
}
