import {
  CardList,
  Effect,
  ShuffleDeckPrompt,
  State,
  StoreLike,
  SuperType,
  TrainerEffect,
} from '@ptcg/common';

import { searchCardsToHand } from '../../common/utils/search-cards-to-hand';
import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  effect.preventDefault = true;

  const bottomCards = new CardList();
  bottomCards.cards = player.deck.cards.splice(
    Math.max(0, player.deck.cards.length - 7),
    Math.min(7, player.deck.cards.length)
  );

  yield* searchCardsToHand(
    next,
    store,
    state,
    player,
    bottomCards,
    { superType: SuperType.POKEMON },
    {
      min: 0,
      max: 1,
      allowCancel: true,
      showToOpponent: true,
      shuffleAfterSearch: false
    }
  );

  player.hand.moveCardTo(effect.trainerCard, player.discard);
  bottomCards.moveTo(player.deck);

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class DarkBall extends VariantTrainerCard {
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
