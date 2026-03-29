import {
  AttackAction,
  AttackEffect,
  CardType,
  PowerType,
  Simulator,
  Stage,
} from '@ptcg/common';

import { JuQianTangLang } from '../../../src/standard/set_g/ju-qian-tang-lang';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

class AbilityPokemon extends TestPokemon {
  public stage = Stage.BASIC;
  public cardTypes = [CardType.GRASS];
  public powers = [
    {
      name: 'Ability',
      powerType: PowerType.ABILITY,
      text: '',
    },
  ];
}

describe('巨钳螳螂 set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('adds 50 damage for each opposing Pokemon with an ability', () => {
    const card = new JuQianTangLang();
    const { opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.METAL]);
    opponent.active.pokemons.cards = [new AbilityPokemon()];
    opponent.bench[0].pokemons.cards = [new AbilityPokemon()];
    opponent.bench[1].pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '惩罚巨钳'));

    expect(opponent.active.damage).toBe(110);
  });

  it('keeps 居合劈 at 70 damage', () => {
    const card = new JuQianTangLang();
    const { player, opponent, state } = TestUtils.getAll(sim);

    const effect = new AttackEffect(player, opponent, card.attacks[1]);
    card.reduceEffect(sim.store, state, effect);

    expect(effect.damage).toBe(70);
  });
});
