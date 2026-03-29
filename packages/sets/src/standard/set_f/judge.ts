import {
  Effect,
  ShuffleDeckPrompt,
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
  const playerCards = player.hand.cards.filter(card => card !== effect.trainerCard);

  player.hand.moveCardsTo(playerCards, player.deck);
  opponent.hand.moveTo(opponent.deck);

  yield store.prompt(state, [new ShuffleDeckPrompt(player.id), new ShuffleDeckPrompt(opponent.id)], order => {
    player.deck.applyOrder(order[0]);
    opponent.deck.applyOrder(order[1]);
    next();
  });

  player.deck.moveTo(player.hand, 4);
  opponent.deck.moveTo(opponent.hand, 4);

  return state;
}

export class Judge extends VariantTrainerCard {
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
