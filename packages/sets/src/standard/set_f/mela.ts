import {
  Card,
  ChooseEnergyPrompt,
  ChoosePokemonPrompt,
  Effect,
  EndTurnEffect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  GamePhase,
  KnockOutEffect,
  PlayerType,
  SlotType,
  State,
  StateUtils,
  StoreLike,
  CardType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  self: Mela,
  effect: Effect
): IterableIterator<State> {
  const trainerEffect = effect as any;
  const player = trainerEffect.player;

  if (!player.marker.hasMarker(self.MELA_MARKER)) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const energyMap = player.discard.cards
    .filter((card: Card) => card instanceof EnergyCard && card.energyType === EnergyType.BASIC && card.name.includes('火'))
    .map((card: any) => ({ card, provides: card.provides }));

  if (energyMap.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selected = [] as any[];
  yield store.prompt(
    state,
    new ChooseEnergyPrompt(
      player.id,
      GameMessage.ATTACH_ENERGY_TO_ACTIVE,
      energyMap,
      [CardType.FIRE],
      { allowCancel: false }
    ),
    result => {
      selected = result || [];
      next();
    }
  );

  let targets: any[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.ATTACH_ENERGY_TO_ACTIVE,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { allowCancel: false }
    ),
    result => {
      targets = result || [];
      next();
    }
  );

  if (selected.length > 0 && targets.length > 0) {
    const cards = selected.map(item => item.card);
    player.discard.moveCardsTo(cards, targets[0].energies);
  }

  const drawCount = Math.max(0, 6 - player.hand.cards.length);
  player.deck.moveTo(player.hand, Math.min(drawCount, player.deck.cards.length));
  return state;
}

export class Mela extends VariantTrainerCard {
  public readonly MELA_MARKER = 'MELA_MARKER';

  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    const trainerEffect = effect as any;
    if (trainerEffect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
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
        effect.player.marker.addMarker(this.MELA_MARKER, this);
      }
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.MELA_MARKER);
    }

    return state;
  }
}
