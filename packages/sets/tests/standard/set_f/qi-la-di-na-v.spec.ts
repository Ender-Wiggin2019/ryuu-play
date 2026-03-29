import {
  AttackAction,
  CardType,
  ChooseCardsPrompt,
  ResolvePromptAction,
  Simulator,
} from '@ptcg/common';

import { GiratinaV } from '../../../src/standard/set_f/qi-la-di-na-v';
import { TestCard } from '../../test-cards/test-card';
import { TestUtils } from '../../test-utils';

describe('骑拉帝纳V set_f', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('puts 2 cards from the top of the deck into hand and the rest into the Lost Zone', () => {
    const card = new GiratinaV();
    const topA = new TestCard();
    const topB = new TestCard();
    const topC = new TestCard();
    const topD = new TestCard();
    const remaining = new TestCard();

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.GRASS, CardType.PSYCHIC, CardType.COLORLESS]);
    player.deck.cards = [topA, topB, topC, topD, remaining];

    sim.dispatch(new AttackAction(1, '深渊探求'));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(prompt).toBeTruthy();

    sim.dispatch(new ResolvePromptAction(prompt.id, [topA, topB]));

    expect(player.hand.cards).toEqual([topA, topB]);
    expect(player.lostzone.cards).toEqual([topC, topD]);
    expect(player.deck.cards).toEqual([remaining]);
  });

  it('keeps 撕裂 at 160 damage', () => {
    const card = new GiratinaV();
    const { opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.GRASS, CardType.PSYCHIC, CardType.COLORLESS]);

    sim.dispatch(new AttackAction(1, '撕裂'));

    expect(opponent.active.damage).toBe(160);
  });
});
