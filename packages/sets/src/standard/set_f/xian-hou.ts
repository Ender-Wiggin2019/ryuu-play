import { Effect, GameError, GameMessage, ShuffleDeckPrompt, State, StoreLike, SuperType, TrainerEffect, TrainerType } from '@ptcg/common';

import { searchCardsToHand } from '../../common/utils/search-cards-to-hand';
import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.hand.cards.length !== 1) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  if (player.deck.cards.length > 0) {
    yield* searchCardsToHand(
      next,
      store,
      state,
      player,
      player.deck,
      { superType: SuperType.POKEMON },
      {
        min: 0,
        max: Math.min(2, player.deck.cards.length),
        allowCancel: false,
        showToOpponent: true,
        shuffleAfterSearch: false,
      }
    );

    if (player.deck.cards.length > 0) {
      yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
        player.deck.applyOrder(order);
        next();
      });
    }
  }

  if (player.hand.cards.includes(effect.trainerCard)) {
    player.hand.moveCardTo(effect.trainerCard, player.discard);
  }

  return state;
}

export class XianHou extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

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
