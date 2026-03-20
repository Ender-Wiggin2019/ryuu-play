import {
  PlayCardAction,
  PlayerType,
  Simulator,
  SlotType,
} from '@ptcg/common';

import { Iono } from '../../../src/standard/set_g/iono';
import { TestCard } from '../../test-cards/test-card';
import { TestUtils } from '../../test-utils';

describe('Iono set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('puts hands on bottom and then draws by remaining prizes', () => {
    spyOn(Math, 'random').and.returnValue(0);

    const iono = new Iono();
    const playerHandA = new TestCard();
    const playerHandB = new TestCard();
    const opponentHand = new TestCard();

    const playerTopA = new TestCard();
    const playerTopB = new TestCard();
    const playerBottom = new TestCard();

    const opponentTopA = new TestCard();
    const opponentTopB = new TestCard();

    const { player, opponent } = TestUtils.getAll(sim);

    player.hand.cards = [iono, playerHandA, playerHandB];
    opponent.hand.cards = [opponentHand];

    player.deck.cards = [playerTopA, playerTopB, playerBottom];
    opponent.deck.cards = [opponentTopA, opponentTopB];

    player.prizes.forEach((prize, index) => {
      prize.cards = index < 2 ? [new TestCard()] : [];
    });
    opponent.prizes.forEach((prize, index) => {
      prize.cards = index < 1 ? [new TestCard()] : [];
    });

    expect(() => {
      sim.dispatch(
        new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 })
      );
    }).not.toThrow();

    expect(player.hand.cards).toContain(playerTopA);
    expect(player.hand.cards).toContain(playerTopB);
    expect(opponent.hand.cards).toContain(opponentTopA);

    expect(player.deck.cards).toEqual([playerBottom, playerHandB, playerHandA]);
    expect(opponent.deck.cards).toEqual([opponentTopB, opponentHand]);
  });

  it('does not draw if no card was put on deck bottom', () => {
    const iono = new Iono();
    const playerDeckA = new TestCard();
    const playerDeckB = new TestCard();
    const opponentDeckA = new TestCard();

    const { player, opponent } = TestUtils.getAll(sim);

    player.hand.cards = [iono];
    opponent.hand.cards = [];

    player.deck.cards = [playerDeckA, playerDeckB];
    opponent.deck.cards = [opponentDeckA];

    player.prizes.forEach(prize => {
      prize.cards = [new TestCard()];
    });
    opponent.prizes.forEach(prize => {
      prize.cards = [new TestCard()];
    });

    expect(() => {
      sim.dispatch(
        new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 })
      );
    }).not.toThrow();

    expect(player.hand.cards).toEqual([]);
    expect(opponent.hand.cards).toEqual([]);
    expect(player.deck.cards).toEqual([playerDeckA, playerDeckB]);
    expect(opponent.deck.cards).toEqual([opponentDeckA]);
  });
});
