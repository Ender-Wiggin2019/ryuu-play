import {
  AttackAction,
  CardType,
  ChoosePokemonPrompt,
  PlayerType,
  PutDamagePrompt,
  ResolvePromptAction,
  Simulator,
  SlotType,
} from '@ptcg/common';

import { Manaphy } from '../../../src/standard/set_f/manaphy';
import { RadiantGreninja } from '../../../src/standard/set-sword-and-shield/radiant-greninja';
import { DragapultEx } from '../../../src/standard/set_h/dragapult-ex';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('Manaphy set_f', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('prevents Moonlight Shuriken damage to Benched Pokemon', () => {
    const radiantGreninja = new RadiantGreninja();
    const manaphy = new Manaphy();
    const benchedTarget = new TestPokemon();

    const { opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [radiantGreninja], [CardType.WATER, CardType.WATER, CardType.COLORLESS]);
    opponent.bench[0].pokemons.cards = [manaphy];
    opponent.bench[1].pokemons.cards = [benchedTarget];

    sim.dispatch(new AttackAction(1, 'Moonlight Shuriken'));

    const choosePokemonPrompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(choosePokemonPrompt).toBeTruthy();
    expect(() => {
      sim.dispatch(new ResolvePromptAction(choosePokemonPrompt.id, [opponent.active, opponent.bench[1]]));
    }).not.toThrow();

    expect(opponent.active.damage).toBe(90);
    expect(opponent.bench[1].damage).toBe(0);
  });

  it('does not prevent Phantom Dive damage counters on Benched Pokemon', () => {
    const dragapultEx = new DragapultEx();
    const manaphy = new Manaphy();
    const benchedTarget = new TestPokemon();

    const { opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [dragapultEx], [CardType.FIRE, CardType.PSYCHIC]);
    opponent.bench[0].pokemons.cards = [manaphy];
    opponent.bench[1].pokemons.cards = [benchedTarget];

    sim.dispatch(new AttackAction(1, 'Phantom Dive'));

    const putDamagePrompt = TestUtils.getLastPrompt(sim) as PutDamagePrompt;
    expect(putDamagePrompt).toBeTruthy();
    expect(() => {
      sim.dispatch(new ResolvePromptAction(putDamagePrompt.id, [
        { target: { player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index: 1 }, damage: 60 },
      ]));
    }).not.toThrow();

    expect(opponent.active.damage).toBe(200);
    expect(opponent.bench[1].damage).toBe(60);
  });
});
