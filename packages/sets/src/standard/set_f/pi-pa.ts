import {
  Card,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  TrainerCard,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function getBlocked(cards: Card[]): { blocked: number[]; available: number } {
  const blocked: number[] = [];
  let available = 0;

  cards.forEach((card, index) => {
    if (card instanceof TrainerCard && card.trainerType === TrainerType.ITEM) {
      available += 1;
      return;
    }

    blocked.push(index);
  });

  return { blocked, available };
}

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const { blocked, available } = getBlocked(opponent.hand.cards);

  if (available === 0) {
    return state;
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      opponent.hand,
      {},
      { min: 0, max: Math.min(2, available), allowCancel: false, blocked },
    ),
    cards => {
      selected = cards || [];
      next();
    },
  );

  if (selected.length > 0) {
    opponent.hand.moveCardsTo(selected, opponent.discard);
  }

  return state;
}

export class PiPa extends VariantTrainerCard {
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
