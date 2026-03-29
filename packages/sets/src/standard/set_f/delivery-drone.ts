import {
  CoinFlipPrompt,
  Effect,
  GameError,
  GameMessage,
  State,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { searchCardsToHand } from '../../common/utils/search-cards-to-hand';
import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  effect.preventDefault = true;

  let heads = 0;
  for (let i = 0; i < 2; i++) {
    let flip = false;
    yield store.prompt(state, new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP), result => {
      flip = result === true;
      next();
    });
    if (flip) {
      heads += 1;
    }
  }

  if (heads < 2) {
    player.hand.moveCardTo(effect.trainerCard, player.discard);
    return state;
  }

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  yield* searchCardsToHand(
    next,
    store,
    state,
    player,
    player.deck,
    {},
    {
      min: 1,
      max: 1,
      allowCancel: false,
      showToOpponent: false,
      shuffleAfterSearch: true
    }
  );

  player.hand.moveCardTo(effect.trainerCard, player.discard);
  return state;
}

export class DeliveryDrone extends VariantTrainerCard {
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
