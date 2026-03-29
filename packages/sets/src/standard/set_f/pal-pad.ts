import {
  Card,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  State,
  StateUtils,
  StoreLike,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const blocked: number[] = [];
  let supporterCount = 0;
  player.discard.cards.forEach((card, index) => {
    if (card instanceof TrainerCard && card.trainerType === TrainerType.SUPPORTER) {
      supporterCount += 1;
    } else {
      blocked.push(index);
    }
  });

  if (supporterCount === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  effect.preventDefault = true;

  let selected: Card[] = [];
  const max = Math.min(2, supporterCount);
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DECK,
      player.discard,
      {},
      { min: 1, max, allowCancel: true, blocked }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  player.hand.moveCardTo(effect.trainerCard, player.discard);
  player.discard.moveCardsTo(selected, player.deck);

  yield store.prompt(
    state,
    new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selected),
    () => next()
  );

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class PalPad extends VariantTrainerCard {
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
