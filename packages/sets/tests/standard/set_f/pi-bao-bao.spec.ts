import { AttackAction } from '@ptcg/common';

import { PiBaoBao } from '../../../src/standard/set_f/pi-bao-bao';
import { TestCard } from '../../test-cards/test-card';
import { TestUtils } from '../../test-utils';

describe('皮宝宝 set_f', () => {
  it('draws until the hand has 7 cards with 握握抽取', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new PiBaoBao();
    const { player } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card]);
    player.hand.cards = [new TestCard(), new TestCard()];

    sim.dispatch(new AttackAction(1, '握握抽取'));

    expect(player.hand.cards.length).toBe(7);
  });
});
