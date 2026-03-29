import {
  Effect,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  player.deck.moveTo(player.hand, Math.min(3, player.deck.cards.length));

  const stadiumCard = StateUtils.getStadiumCard(state);
  if (stadiumCard !== undefined) {
    const owner = StateUtils.findOwner(state, StateUtils.findCardList(state, stadiumCard));
    owner.stadium.moveCardTo(stadiumCard, owner.discard);
  }

  return state;
}

export class GongRen extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
