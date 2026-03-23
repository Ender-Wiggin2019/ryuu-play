import {
  PlayCardAction,
  PlayerType,
  Simulator,
  SlotType,
} from '@ptcg/common';

import { Judge } from '../../../src/standard/set_e/judge';
import { TestCard } from '../../test-cards/test-card';
import { TestUtils } from '../../test-utils';

describe('Judge set_e', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('shuffles both hands into deck and each player draws 4 cards', () => {
    const judge = new Judge();
    const playerHandA = new TestCard();
    const playerHandB = new TestCard();
    const opponentHandA = new TestCard();
    const opponentHandB = new TestCard();

    const p1DeckA = new TestCard();
    const p1DeckB = new TestCard();
    const p1DeckC = new TestCard();
    const p1DeckD = new TestCard();
    const p2DeckA = new TestCard();
    const p2DeckB = new TestCard();
    const p2DeckC = new TestCard();
    const p2DeckD = new TestCard();

    const { player, opponent } = TestUtils.getAll(sim);
    player.hand.cards = [judge, playerHandA, playerHandB];
    opponent.hand.cards = [opponentHandA, opponentHandB];
    player.deck.cards = [p1DeckA, p1DeckB, p1DeckC, p1DeckD];
    opponent.deck.cards = [p2DeckA, p2DeckB, p2DeckC, p2DeckD];

    expect(() => {
      sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    }).not.toThrow();

    expect(player.hand.cards.length).toBe(4);
    expect(opponent.hand.cards.length).toBe(4);
    expect(player.supporter.cards).toContain(judge);
  });
});
