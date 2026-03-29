import {
  Effect,
  GameMessage,
  ShowCardsPrompt,
  State,
  StateUtils,
  StoreLike,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const opponentHandCards = opponent.hand.cards.slice();
  const supporterCount = opponentHandCards.filter(card => card instanceof TrainerCard && card.trainerType === TrainerType.SUPPORTER).length;

  yield store.prompt(state, new ShowCardsPrompt(player.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, opponentHandCards), () =>
    next()
  );

  player.deck.moveTo(player.hand, Math.min(supporterCount * 2, player.deck.cards.length));
  return state;
}

export class NieKai extends VariantTrainerCard {
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
