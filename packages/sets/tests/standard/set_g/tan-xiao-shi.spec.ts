import { AttackAction, CardType } from '@ptcg/common';

import { TanXiaoShiG, tanXiaoShiVariants } from '../../../src/standard/set_g/tan-xiao-shi';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('炭小侍 set_g', () => {
  it('exposes both faces in one logic group', () => {
    expect(tanXiaoShiVariants).toHaveLength(2);
    expect(new Set(tanXiaoShiVariants.map(card => card.fullName)).size).toBe(2);
    expect(new Set(tanXiaoShiVariants.map(card => (card.rawData as any).logic_group_key)).size).toBe(1);
    expect((tanXiaoShiVariants[0].rawData as any).variant_group_size).toBe(2);
  });

  it('deals 60 damage with 高温爆破', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new TanXiaoShiG();
    const { opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.FIRE, CardType.FIRE, CardType.FIRE]);
    opponent.active.pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '高温爆破'));

    expect(opponent.active.damage).toBe(60);
  });
});
