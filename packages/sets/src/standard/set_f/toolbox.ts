import {
  CardList,
  Effect,
  GameError,
  GameMessage,
  ShuffleDeckPrompt,
  State,
  StoreLike,
  SuperType,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { searchCardsToHand } from '../../common/utils/search-cards-to-hand';
import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  effect.preventDefault = true;

  const topCards = new CardList();
  topCards.cards = player.deck.cards.splice(0, Math.min(7, player.deck.cards.length));

  yield* searchCardsToHand(
    next,
    store,
    state,
    player,
    topCards,
    { superType: SuperType.TRAINER, trainerType: TrainerType.TOOL },
    {
      min: 0,
      max: topCards.cards.length,
      allowCancel: true,
      showToOpponent: true,
      shuffleAfterSearch: false
    }
  );

  player.hand.moveCardTo(effect.trainerCard, player.discard);
  topCards.moveTo(player.deck);

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class Toolbox extends VariantTrainerCard {
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
