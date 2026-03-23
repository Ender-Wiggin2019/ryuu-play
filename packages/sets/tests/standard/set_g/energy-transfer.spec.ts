import {
  CardTransfer,
  CardType,
  EnergyCard,
  EnergyType,
  MoveEnergyPrompt,
  PlayCardAction,
  PlayerType,
  ResolvePromptAction,
  Simulator,
  SlotType,
} from '@ptcg/common';

import { EnergyTransfer } from '../../../src/standard/set_g/energy-transfer';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

class DummyBasicEnergy extends EnergyCard {
  public provides: CardType[] = [CardType.GRASS];

  public energyType: EnergyType = EnergyType.BASIC;

  public set: string = 'TEST';

  public name: string = 'Dummy Basic Energy';

  public fullName: string = 'Dummy Basic Energy TEST';
}

describe('Energy Transfer set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('moves a Basic Energy to another Pokemon', () => {
    const energyTransfer = new EnergyTransfer();
    const energy = new DummyBasicEnergy();

    const { player } = TestUtils.getAll(sim);
    player.hand.cards = [energyTransfer];
    player.active.energies.cards = [energy];
    player.bench[0].pokemons.cards = [new TestPokemon()];

    expect(() => {
      sim.dispatch(
        new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 })
      );
    }).not.toThrow();

    const prompt = TestUtils.getLastPrompt(sim) as MoveEnergyPrompt;
    const transfer: CardTransfer = {
      from: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 },
      to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 },
      card: energy,
    };

    expect(() => {
      sim.dispatch(new ResolvePromptAction(prompt.id, [transfer]));
    }).not.toThrow();

    expect(player.active.energies.cards).not.toContain(energy);
    expect(player.bench[0].energies.cards).toContain(energy);
    expect(player.discard.cards).toContain(energyTransfer);
  });
});
