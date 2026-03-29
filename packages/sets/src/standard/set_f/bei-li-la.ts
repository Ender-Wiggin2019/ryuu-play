import {
  Effect,
  GameError,
  GameMessage,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const targetHandSize = opponent.hand.cards.length + 1;

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const drawCount = Math.max(0, targetHandSize - player.hand.cards.length);
  player.deck.moveTo(player.hand, Math.min(drawCount, player.deck.cards.length));
  return state;
}

export class BeiLiLa extends VariantTrainerCard {
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
