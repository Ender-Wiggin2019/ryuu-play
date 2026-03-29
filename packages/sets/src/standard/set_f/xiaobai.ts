import {
  Effect,
  GameMessage,
  ShowCardsPrompt,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const playerHandCards = player.hand.cards.filter(card => card !== effect.trainerCard);
  const opponentHandCards = opponent.hand.cards.slice();

  yield store.prompt(state, new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, playerHandCards), () =>
    next()
  );
  yield store.prompt(state, new ShowCardsPrompt(player.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, opponentHandCards), () =>
    next()
  );

  player.deck.moveTo(player.hand, Math.min(3, player.deck.cards.length));
  return state;
}

export class Xiaobai extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

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
