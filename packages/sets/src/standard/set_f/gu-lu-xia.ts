import { Effect, State, StoreLike, TrainerEffect } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function hasNoEnergy(player: State['players'][number]): boolean {
  return player.active.energies.cards.length === 0
    && player.bench.every(bench => bench.energies.cards.length === 0);
}

export class GuLuXia extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;
      const drawTarget = hasNoEnergy(player) ? 7 : 5;
      const drawCount = Math.max(0, drawTarget - player.hand.cards.length);
      player.deck.moveTo(player.hand, Math.min(drawCount, player.deck.cards.length));
    }

    return state;
  }
}
