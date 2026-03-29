import {
  AttackAction,
  AttackEffect,
  CardType,
  ChooseCardsPrompt,
  ResolvePromptAction,
  Simulator,
} from '@ptcg/common';

import { GiratinaVSTAR } from '../../../src/standard/set_f/qi-la-di-na-vstar';
import { TestEnergy } from '../../test-cards/test-energy';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('Giratina VSTAR set_f', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('puts 2 attached Energy cards into the Lost Zone and deals 280 with 放逐冲击', () => {
    const giratinaVSTAR = new GiratinaVSTAR();
    const activeEnergyA = new TestEnergy(CardType.GRASS);
    const activeEnergyB = new TestEnergy(CardType.PSYCHIC);
    const activeEnergyC = new TestEnergy(CardType.COLORLESS);
    const benchEnergy = new TestEnergy(CardType.FIRE);
    const benchPokemon = new TestPokemon();

    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [giratinaVSTAR], [CardType.GRASS, CardType.PSYCHIC, CardType.COLORLESS]);
    player.active.energies.cards = [activeEnergyA, activeEnergyB, activeEnergyC];
    player.bench[0].pokemons.cards = [benchPokemon];
    player.bench[0].energies.cards = [benchEnergy];

    sim.dispatch(new AttackAction(1, '放逐冲击'));
    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(prompt).toBeTruthy();

    sim.dispatch(new ResolvePromptAction(prompt.id, [activeEnergyA, benchEnergy]));

    expect(player.lostzone.cards).toEqual([activeEnergyA, benchEnergy]);
    expect(player.active.energies.cards).toEqual([activeEnergyB, activeEnergyC]);
    expect(player.bench[0].energies.cards).toEqual([]);
    expect(opponent.active.damage).toEqual(280);
  });

  it('rejects 放逐冲击 when fewer than 2 attached Energy cards are available', () => {
    const giratinaVSTAR = new GiratinaVSTAR();
    const activeEnergy = new TestEnergy(CardType.GRASS);
    const { player, opponent, state } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [giratinaVSTAR], [CardType.GRASS, CardType.PSYCHIC, CardType.COLORLESS]);
    player.active.energies.cards = [activeEnergy];
    player.active.pokemons.cards = [giratinaVSTAR];
    opponent.active.pokemons.cards = [new TestPokemon()];

    const effect = new AttackEffect(player, opponent, giratinaVSTAR.attacks[0]);

    expect(() => giratinaVSTAR.reduceEffect(sim.store, state, effect)).toThrow();
  });
});
