import { EnergyType, Effect, State, StoreLike, TrainerEffect, SuperType } from '@ptcg/common';

import { searchCardsToHand } from '../../common/utils/search-cards-to-hand';
import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect
): IterableIterator<State> {
  const player = effect.player;

  effect.preventDefault = true;

  yield* searchCardsToHand(
    next,
    store,
    state,
    player,
    player.deck,
    { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
    {
      min: 0,
      max: 4,
      allowCancel: true,
      showToOpponent: true,
      shuffleAfterSearch: true,
    }
  );

  return state;
}

export class QianJinXiaoJie extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
