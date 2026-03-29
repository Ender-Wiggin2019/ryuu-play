import {
  Effect,
  EnergyCard,
  EnergyType,
  EndTurnEffect,
  GameError,
  GameMessage,
  GamePhase,
  KnockOutEffect,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerEffect,
} from '@ptcg/common';

import { searchCardsToHand } from '../../common/utils/search-cards-to-hand';
import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, self: EncouragementLetter, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  if (!player.marker.hasMarker(self.ENCOURAGEMENT_MARKER, self)) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  effect.preventDefault = true;

  const basicEnergyCount = player.deck.cards.filter(c => c instanceof EnergyCard && c.energyType === EnergyType.BASIC).length;

  yield* searchCardsToHand(
    next,
    store,
    state,
    player,
    player.deck,
    { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
    {
      min: 0,
      max: Math.min(3, basicEnergyCount),
      allowCancel: true,
      showToOpponent: true,
      shuffleAfterSearch: true
    }
  );

  player.hand.moveCardTo(effect.trainerCard, player.discard);
  return state;
}

export class EncouragementLetter extends VariantTrainerCard {
  public readonly ENCOURAGEMENT_MARKER = 'ENCOURAGEMENT_MARKER';

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
      const duringTurn = [GamePhase.PLAYER_TURN, GamePhase.ATTACK].includes(state.phase);

      if (!duringTurn || state.players[state.activePlayer] !== attacker) {
        return state;
      }

      const cardList = StateUtils.findCardList(state, this);
      const owner = StateUtils.findOwner(state, cardList);
      if (owner === victim) {
        victim.marker.addMarker(this.ENCOURAGEMENT_MARKER, this);
      }
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.ENCOURAGEMENT_MARKER, this);
    }

    return state;
  }
}
