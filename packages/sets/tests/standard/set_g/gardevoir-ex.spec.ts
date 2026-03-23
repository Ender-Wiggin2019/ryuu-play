import {
  AttachEnergyPrompt,
  PlayerType,
  ResolvePromptAction,
  Simulator,
  SlotType,
  UseAbilityAction,
} from '@ptcg/common';

import { PsychicEnergy } from '../../../src/standard/set_h/psychic-energy';
import { Kirlia } from '../../../src/standard/set_f/kirlia';
import { Ralts } from '../../../src/standard/set_f/ralts';
import { GardevoirEx } from '../../../src/standard/set_g/gardevoir-ex';
import { TestUtils } from '../../test-utils';

describe('Gardevoir ex set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('attaches from discard with Psychic Embrace and blocks a target that would be Knocked Out', () => {
    const gardevoirEx = new GardevoirEx();
    const benchKirlia = new Kirlia();
    const benchRalts = new Ralts();
    const psychicEnergy = new PsychicEnergy();

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [gardevoirEx]);
    player.active.damage = 300;
    player.bench[0].pokemons.cards = [benchKirlia];
    player.bench[1].pokemons.cards = [benchRalts];
    player.discard.cards = [psychicEnergy];

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, 'Psychic Embrace', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.ACTIVE,
        index: 0,
      }));
    }).not.toThrow();

    const prompt = TestUtils.getLastPrompt(sim) as AttachEnergyPrompt;
    expect(prompt).toBeTruthy();
    expect(
      prompt.options.blockedTo.some(target =>
        target.player === PlayerType.BOTTOM_PLAYER && target.slot === SlotType.ACTIVE && target.index === 0
      )
    ).toBe(true);

    expect(() => {
      sim.dispatch(new ResolvePromptAction(prompt.id, [{
        to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 },
        card: psychicEnergy,
      }]));
    }).not.toThrow();

    expect(player.bench[0].energies.cards).toContain(psychicEnergy);
    expect(player.bench[0].damage).toBe(20);
  });

  it('can use Psychic Embrace multiple times during the same turn', () => {
    const gardevoirEx = new GardevoirEx();
    const benchKirlia = new Kirlia();
    const energyA = new PsychicEnergy();
    const energyB = new PsychicEnergy();

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [gardevoirEx]);
    player.bench[0].pokemons.cards = [benchKirlia];
    player.discard.cards = [energyA, energyB];

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, 'Psychic Embrace', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.ACTIVE,
        index: 0,
      }));
    }).not.toThrow();

    const firstPrompt = TestUtils.getLastPrompt(sim) as AttachEnergyPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(firstPrompt.id, [{
        to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 },
        card: energyA,
      }]));
    }).not.toThrow();

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, 'Psychic Embrace', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.ACTIVE,
        index: 0,
      }));
    }).not.toThrow();

    const secondPrompt = TestUtils.getLastPrompt(sim) as AttachEnergyPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(secondPrompt.id, [{
        to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 },
        card: energyB,
      }]));
    }).not.toThrow();

    expect(player.bench[0].energies.cards).toContain(energyA);
    expect(player.bench[0].energies.cards).toContain(energyB);
    expect(player.bench[0].damage).toBe(40);
  });
});
