import {
  AttackAction,
  AttackEffect,
  CardType,
  DealDamageEffect,
} from '@ptcg/common';

import { HongLianKaiQiExG, hongLianKaiQiExVariants } from '../../../src/standard/set_g/hong-lian-kai-qi-ex';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('红莲铠骑ex set_g', () => {
  it('exposes both faces in one logic group', () => {
    expect(hongLianKaiQiExVariants).toHaveLength(2);
    expect(new Set(hongLianKaiQiExVariants.map(card => card.fullName)).size).toBe(2);
    expect(new Set(hongLianKaiQiExVariants.map(card => (card.rawData as any).logic_group_key)).size).toBe(1);
    expect((hongLianKaiQiExVariants[0].rawData as any).variant_group_size).toBe(2);
  });

  it('reduces incoming attack damage by 80 at full HP', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new HongLianKaiQiExG();
    const { player, opponent, state } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card]);
    opponent.active.pokemons.cards = [new TestPokemon()];

    const attack = new AttackEffect(opponent, player, {
      name: 'test',
      cost: [],
      damage: '100',
      text: '',
    });
    const damage = new DealDamageEffect(attack, 100);
    card.reduceEffect(sim.store, state, damage);

    expect(damage.damage).toBe(20);
  });

  it('scales 灼热火箭炮 with attached Fire Energy', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new HongLianKaiQiExG();
    const { opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.FIRE, CardType.FIRE]);
    opponent.active.pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '灼热火箭炮'));

    expect(opponent.active.damage).toBe(120);
  });
});
