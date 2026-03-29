import {
  Card,
  CardList,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  State,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const deckCount = player.deck.cards.length;
  const topCards = new CardList();
  topCards.cards = player.deck.cards.splice(0, Math.min(6, deckCount));

  const available = topCards.cards.length;
  let selected: Card[] = [];
  if (available > 0) {
    yield store.prompt(
      state,
      new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_HAND,
        topCards,
        {},
        { min: Math.min(2, available), max: Math.min(2, available), allowCancel: false },
      ),
      cards => {
        selected = cards || [];
        next();
      },
    );
  }

  if (selected.length > 0) {
    topCards.moveCardsTo(selected, player.hand);
  }

  topCards.moveTo(player.discard);
  return state;
}

export class TanXianJiaDeXiangDao extends VariantTrainerCard {
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
