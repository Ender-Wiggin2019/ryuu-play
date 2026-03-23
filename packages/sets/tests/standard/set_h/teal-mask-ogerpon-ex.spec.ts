import {
  AttackAction,
  CardTag,
  CardType,
  Simulator,
} from '@ptcg/common';

import { TealMaskOgerponEx } from '../../../src/standard/set_h/teal-mask-ogerpon-ex';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('Teal Mask Ogerpon ex set_h', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('has Tera tag', () => {
    const tealMaskOgerponEx = new TealMaskOgerponEx();
    expect(tealMaskOgerponEx.tags).toContain(CardTag.TERA);
  });

  it('adds 30 damage for each Energy attached to both Active Pokemon', () => {
    const tealMaskOgerponEx = new TealMaskOgerponEx();
    const defendingPokemon = new TestPokemon();

    const { opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [tealMaskOgerponEx], [CardType.GRASS, CardType.GRASS, CardType.COLORLESS]);
    TestUtils.setDefending(sim, [defendingPokemon], [CardType.WATER, CardType.WATER]);

    sim.dispatch(new AttackAction(1, 'Myriad Leaf Shower'));

    expect(opponent.active.damage).toEqual(180);
  });
});
