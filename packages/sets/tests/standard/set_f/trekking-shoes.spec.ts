import {
  ChooseCardsPrompt,
  PlayCardAction,
  PlayerType,
  ResolvePromptAction,
  Simulator,
  SlotType,
} from '@ptcg/common';

import { TrekkingShoes } from '../../../src/standard/set_f/trekking-shoes';
import { TestCard } from '../../test-cards/test-card';
import { TestUtils } from '../../test-utils';

describe('Trekking Shoes set_f', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('puts top deck card into hand when selected', () => {
    const trekkingShoes = new TrekkingShoes();
    const topDeckCard = new TestCard();

    const { player } = TestUtils.getAll(sim);
    player.hand.cards = [trekkingShoes];
    player.deck.cards = [topDeckCard, new TestCard()];

    expect(() => {
      sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    }).not.toThrow();

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(prompt.id, [topDeckCard]));
    }).not.toThrow();

    expect(player.hand.cards).toContain(topDeckCard);
    expect(player.discard.cards).toContain(trekkingShoes);
  });

  it('discards top deck card and draws one when not selected', () => {
    const trekkingShoes = new TrekkingShoes();
    const topDeckCard = new TestCard();
    const nextDeckCard = new TestCard();

    const { player } = TestUtils.getAll(sim);
    player.hand.cards = [trekkingShoes];
    player.deck.cards = [topDeckCard, nextDeckCard];

    expect(() => {
      sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    }).not.toThrow();

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(prompt.id, null));
    }).not.toThrow();

    expect(player.discard.cards).toContain(topDeckCard);
    expect(player.hand.cards).toContain(nextDeckCard);
  });
});
