import {
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  KnockOutEffect,
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
  self: UnfairStamp,
  effect: TrainerEffect
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  if (!player.marker.hasMarker(self.UNFAIR_STAMP_MARKER, self)) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  player.marker.removeMarker(self.UNFAIR_STAMP_MARKER, self);
  effect.preventDefault = true;

  const playerCards = player.hand.cards.filter(card => card !== effect.trainerCard);
  const opponentCards = opponent.hand.cards.slice();

  player.hand.moveCardsTo(playerCards, player.deck);
  opponent.hand.moveCardsTo(opponentCards, opponent.deck);

  yield store.prompt(
    state,
    [new ShuffleDeckPrompt(player.id), new ShuffleDeckPrompt(opponent.id)],
    order => {
      player.deck.applyOrder(order[0]);
      opponent.deck.applyOrder(order[1]);
      next();
    }
  );

  player.deck.moveTo(player.hand, 5);
  opponent.deck.moveTo(opponent.hand, 2);
  player.hand.moveCardTo(effect.trainerCard, player.discard);
  return state;
}

export class UnfairStamp extends VariantTrainerCard {
  public readonly UNFAIR_STAMP_MARKER = 'UNFAIR_STAMP_MARKER';

  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    if (effect instanceof KnockOutEffect) {
      const victim = effect.player;
      const attacker = StateUtils.getOpponent(state, victim);
      const cardList = StateUtils.findCardList(state, this);
      const owner = StateUtils.findOwner(state, cardList);

      if (owner === victim && state.players[state.activePlayer] === attacker) {
        victim.marker.addMarker(this.UNFAIR_STAMP_MARKER, this);
      }
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.UNFAIR_STAMP_MARKER, this);
    }

    return state;
  }
}
