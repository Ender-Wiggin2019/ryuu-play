import {
  Card,
  ChooseCardsPrompt,
  Effect,
  GameError,
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
  effect: TrainerEffect
): IterableIterator<State> {
  const player = effect.player;

  effect.preventDefault = true;

  if (player.hand.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.hand,
      {},
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  const cardToKeep = selected[0];
  const cardsToDiscard = player.hand.cards.filter(card => card !== cardToKeep);
  player.hand.moveCardsTo(cardsToDiscard, player.discard);
  player.deck.moveTo(player.hand, Math.min(4, player.deck.cards.length));

  return state;
}

export class MaJiaMu extends VariantTrainerCard {
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
