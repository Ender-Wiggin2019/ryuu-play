import {
  CardType,
  CheckAttackCostEffect,
  PokemonCard,
  Simulator,
  Stage,
} from '@ptcg/common';

import { DragapultEx } from '../../../src/standard/set_h/dragapult-ex';
import { SparklingCrystal } from '../../../src/standard/set_h/sparkling-crystal';
import { TestUtils } from '../../test-utils';

class NonTeraPokemon extends PokemonCard {
  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 120;

  public weakness = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Heavy Hit',
      cost: [CardType.FIRE, CardType.COLORLESS],
      damage: '90',
      text: '',
    },
  ];

  public set: string = 'TEST';

  public name: string = 'Non-Tera Pokemon';

  public fullName: string = 'Non-Tera Pokemon TEST';
}

describe('Sparkling Crystal set_h', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('reduces attack cost by 1 when attached to a Tera Pokemon', () => {
    const dragapultEx = new DragapultEx();
    const sparklingCrystal = new SparklingCrystal();

    TestUtils.setActive(sim, [dragapultEx], [], [sparklingCrystal]);

    const { state, player } = TestUtils.getAll(sim);
    const checkAttackCost = new CheckAttackCostEffect(player, dragapultEx.attacks[1]);
    sim.store.reduceEffect(state, checkAttackCost);

    expect(checkAttackCost.cost).toEqual([CardType.PSYCHIC]);
  });

  it('does not reduce attack cost for non-Tera Pokemon', () => {
    const nonTeraPokemon = new NonTeraPokemon();
    const sparklingCrystal = new SparklingCrystal();

    TestUtils.setActive(sim, [nonTeraPokemon], [], [sparklingCrystal]);

    const { state, player } = TestUtils.getAll(sim);
    const checkAttackCost = new CheckAttackCostEffect(player, nonTeraPokemon.attacks[0]);
    sim.store.reduceEffect(state, checkAttackCost);

    expect(checkAttackCost.cost).toEqual([CardType.FIRE, CardType.COLORLESS]);
  });
});
