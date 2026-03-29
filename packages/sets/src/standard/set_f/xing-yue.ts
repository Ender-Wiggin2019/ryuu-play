import {
  Card,
  CoinFlipPrompt,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  ShowCardsPrompt,
  State,
  StateUtils,
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
  const opponent = StateUtils.getOpponent(state, player);
  let heads = 0;

  effect.preventDefault = true;

  for (let i = 0; i < 2; i++) {
    yield store.prompt(state, [new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)], result => {
      if (result) {
        heads += 1;
      }
      next();
    });
  }

  const max = Math.min(heads, player.discard.cards.length);
  const selectedCards: Card[] = [];

  if (max > 0) {
    yield store.prompt(
      state,
      new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_HAND,
        player.discard,
        {},
        { min: 0, max, allowCancel: true }
      ),
      cards => {
        selectedCards.push(...(cards || []));
        next();
      }
    );
  }

  if (selectedCards.length > 0) {
    yield store.prompt(
      state,
      new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selectedCards),
      () => next()
    );
    player.discard.moveCardsToTop(selectedCards, player.deck);
  }

  return state;
}

export class XingYue extends VariantTrainerCard {
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
