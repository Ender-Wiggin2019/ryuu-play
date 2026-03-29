import {
  Card,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const discardCount = Math.max(0, opponent.hand.cards.length - 3);

  if (discardCount === 0) {
    return state;
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      opponent.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      opponent.hand,
      {},
      { min: discardCount, max: discardCount, allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length > 0) {
    opponent.hand.moveCardsTo(selected, opponent.discard);
  }

  return state;
}

export class KuSuoLuoSiQiDeQiTu extends VariantTrainerCard {
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
