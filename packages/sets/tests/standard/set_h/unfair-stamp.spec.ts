import {
  PlayCardAction,
  PlayerType,
  Simulator,
  SlotType,
} from '@ptcg/common';

import { UnfairStamp } from '../../../src/standard/set_h/unfair-stamp';
import { TestCard } from '../../test-cards/test-card';
import { TestUtils } from '../../test-utils';

describe('Unfair Stamp set_h', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('can be played after your Pokemon were Knocked Out during the opponent turn', () => {
    const unfairStamp = new UnfairStamp();
    const { player, opponent } = TestUtils.getAll(sim);

    const playerDeckA = new TestCard();
    const playerDeckB = new TestCard();
    const playerDeckC = new TestCard();
    const playerDeckD = new TestCard();
    const playerDeckE = new TestCard();
    const opponentDeckA = new TestCard();
    const opponentDeckB = new TestCard();

    const playerHandA = new TestCard();
    const playerHandB = new TestCard();
    const opponentHandA = new TestCard();
    const opponentHandB = new TestCard();

    player.hand.cards = [unfairStamp, playerHandA, playerHandB];
    opponent.hand.cards = [opponentHandA, opponentHandB];

    player.deck.cards = [playerDeckA, playerDeckB, playerDeckC, playerDeckD, playerDeckE];
    opponent.deck.cards = [opponentDeckA, opponentDeckB];

    player.marker.addMarker(unfairStamp.KNOCKED_OUT_LAST_TURN_MARKER, unfairStamp);

    expect(() => {
      sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    }).not.toThrow();

    expect(player.hand.cards.length).toBe(5);
    expect(opponent.hand.cards.length).toBe(2);
    expect(player.discard.cards).toContain(unfairStamp);
  });
});
