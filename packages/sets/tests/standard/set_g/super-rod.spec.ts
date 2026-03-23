import {
  CardType,
  ChooseCardsPrompt,
  EnergyCard,
  EnergyType,
  PlayCardAction,
  PlayerType,
  PokemonCard,
  ResolvePromptAction,
  ShowCardsPrompt,
  Simulator,
  SlotType,
  Stage,
} from '@ptcg/common';

import { SuperRod } from '../../../src/standard/set_g/super-rod';
import { TestCard } from '../../test-cards/test-card';
import { TestUtils } from '../../test-utils';

class DummyBasicPokemon extends PokemonCard {
  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 60;

  public weakness = [];

  public retreat = [];

  public set: string = 'TEST';

  public name: string = 'Dummy Basic Pokemon';

  public fullName: string = 'Dummy Basic Pokemon TEST';
}

class DummyBasicEnergy extends EnergyCard {
  public provides: CardType[] = [CardType.GRASS];

  public energyType: EnergyType = EnergyType.BASIC;

  public set: string = 'TEST';

  public name: string = 'Dummy Basic Energy';

  public fullName: string = 'Dummy Basic Energy TEST';
}

describe('Super Rod set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('shuffles selected Pokemon and Basic Energy cards from discard into deck', () => {
    const superRod = new SuperRod();
    const pokemon = new DummyBasicPokemon();
    const energy = new DummyBasicEnergy();
    const filler = new TestCard();

    const { player } = TestUtils.getAll(sim);
    player.hand.cards = [superRod];
    player.discard.cards = [pokemon, energy, filler];

    expect(() => {
      sim.dispatch(
        new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 })
      );
    }).not.toThrow();

    const choosePrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(choosePrompt.id, [pokemon, energy]));
    }).not.toThrow();

    const showPrompt = TestUtils.getLastPrompt(sim) as ShowCardsPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(showPrompt.id, true));
    }).not.toThrow();

    expect(player.deck.cards).toContain(pokemon);
    expect(player.deck.cards).toContain(energy);
    expect(player.discard.cards).toContain(superRod);
    expect(player.discard.cards).toContain(filler);
  });
});
