import { EndTurnEffect, Effect, HealEffect, State, StoreLike, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class Leftovers extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof EndTurnEffect && effect.player.active.trainers.cards.includes(this)) {
      const owner = effect.player;
      const pokemon = owner.active.getPokemonCard();
      if (pokemon === undefined) {
        return state;
      }

      const healEffect = new HealEffect(owner, owner.active, 20);
      state = store.reduceEffect(state, healEffect);
    }

    return state;
  }
}
