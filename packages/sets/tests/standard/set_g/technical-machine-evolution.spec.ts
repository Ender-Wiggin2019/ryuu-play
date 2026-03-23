import {
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  PlayerType,
  ResolvePromptAction,
  ShuffleDeckPrompt,
  Simulator,
  SlotType,
  Stage,
  UseTrainerInPlayAction,
} from '@ptcg/common';

import { TechnicalMachineEvolution } from '../../../src/standard/set_g/technical-machine-evolution';
import { TestCard } from '../../test-cards/test-card';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

class BenchABasic extends TestPokemon {
  public stage: Stage = Stage.BASIC;

  public name = 'Bench A';

  public fullName = 'Bench A TEST';
}

class BenchAEvolution extends TestPokemon {
  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Bench A';

  public name = 'Bench A Evo';

  public fullName = 'Bench A Evo TEST';
}

class BenchBBasic extends TestPokemon {
  public stage: Stage = Stage.BASIC;

  public name = 'Bench B';

  public fullName = 'Bench B TEST';
}

class BenchBEvolution extends TestPokemon {
  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Bench B';

  public name = 'Bench B Evo';

  public fullName = 'Bench B Evo TEST';
}

describe('Technical Machine: Evolution set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('shows only matching evolutions and maps each selected target correctly', () => {
    const technicalMachine = new TechnicalMachineEvolution();
    const benchA = new BenchABasic();
    const benchB = new BenchBBasic();
    const evolutionA = new BenchAEvolution();
    const evolutionB = new BenchBEvolution();
    const filler = new TestCard();

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [new TestPokemon()], [CardType.COLORLESS], [technicalMachine]);
    player.bench[0].pokemons.cards = [benchA];
    player.bench[1].pokemons.cards = [benchB];
    player.deck.cards = [filler, evolutionB, evolutionA];

    expect(() => {
      sim.dispatch(
        new UseTrainerInPlayAction(
          1,
          { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 },
          technicalMachine.name
        )
      );
    }).not.toThrow();

    const choosePokemonPrompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(choosePokemonPrompt.id, [player.bench[0], player.bench[1]]));
    }).not.toThrow();

    const firstEvolutionPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(firstEvolutionPrompt.cards.cards).toEqual([evolutionA]);

    expect(() => {
      sim.dispatch(new ResolvePromptAction(firstEvolutionPrompt.id, [evolutionA]));
    }).not.toThrow();

    const secondEvolutionPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(secondEvolutionPrompt.cards.cards).toEqual([evolutionB]);

    expect(() => {
      sim.dispatch(new ResolvePromptAction(secondEvolutionPrompt.id, [evolutionB]));
    }).not.toThrow();

    const shufflePrompt = TestUtils.getLastPrompt(sim) as ShuffleDeckPrompt;
    expect(shufflePrompt).toEqual(jasmine.any(ShuffleDeckPrompt));
    expect(shufflePrompt.result).toBeDefined();

    expect(player.bench[0].pokemons.cards).toContain(evolutionA);
    expect(player.bench[1].pokemons.cards).toContain(evolutionB);
  });
});
