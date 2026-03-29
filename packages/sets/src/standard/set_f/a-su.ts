import { Effect, State, StateUtils, StoreLike, TrainerEffect } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class ASu extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;
      const drawCount = StateUtils.getStadiumCard(state) !== undefined ? 4 : 2;
      player.deck.moveTo(player.hand, Math.min(drawCount, player.deck.cards.length));
    }

    return state;
  }
}
