import {
  Card,
  Effect,
  GameError,
  GameMessage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class Roxanne extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    const trainerEffect = effect as any;
    if (trainerEffect.trainerCard === this) {
      const player = trainerEffect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (opponent.getPrizeLeft() > 3) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      const playerHandCards = player.hand.cards.filter((card: Card) => card !== this);
      const opponentHandCards = opponent.hand.cards.slice();

      player.hand.moveCardsToBottom(playerHandCards, player.deck);
      opponent.hand.moveCardsToBottom(opponentHandCards, opponent.deck);

      player.deck.moveTo(player.hand, Math.min(6, player.deck.cards.length));
      opponent.deck.moveTo(opponent.hand, Math.min(2, opponent.deck.cards.length));
    }

    return state;
  }
}
