import {
  Effect,
  EndTurnEffect,
  GamePhase,
  KnockOutEffect,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const drawCount = player.marker.hasMarker('CYNTHIAS_AMBITION_MARKER')
    ? 8
    : 5;

  player.deck.moveTo(player.hand, Math.min(drawCount, player.deck.cards.length));
  return state;
}

export class CynthiasAmbition extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;
  public readonly CYNTHIAS_AMBITION_MARKER = 'CYNTHIAS_AMBITION_MARKER';

  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof KnockOutEffect) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      const duringTurn = [GamePhase.PLAYER_TURN, GamePhase.ATTACK].includes(state.phase);

      if (!duringTurn || state.players[state.activePlayer] !== opponent) {
        return state;
      }

      const cardList = StateUtils.findCardList(state, this);
      const owner = StateUtils.findOwner(state, cardList);
      if (owner === player) {
        effect.player.marker.addMarker(this.CYNTHIAS_AMBITION_MARKER, this);
      }
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.CYNTHIAS_AMBITION_MARKER);
    }

    return state;
  }
}
