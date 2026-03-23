import {
  ChoosePokemonPrompt,
  PlayCardAction,
  PlayerType,
  ResolvePromptAction,
  Simulator,
  SlotType,
} from '@ptcg/common';

import { CounterCatcher } from '../../../src/standard/set_g/counter-catcher';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('Counter Catcher set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('switches in an opponent Benched Pokemon when player has more Prize cards left', () => {
    const counterCatcher = new CounterCatcher();
    const opponentBenchPokemon = new TestPokemon();

    const { player, opponent } = TestUtils.getAll(sim);
    const previousActive = opponent.active;
    player.hand.cards = [counterCatcher];
    opponent.bench[0].pokemons.cards = [opponentBenchPokemon];

    player.prizes[0].cards = [];
    player.prizes[1].cards = [];
    player.prizes[2].cards = [];
    opponent.prizes[0].cards = [];
    opponent.prizes[1].cards = [];
    opponent.prizes[2].cards = [];
    opponent.prizes[3].cards = [];

    expect(() => {
      sim.dispatch(
        new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 })
      );
    }).not.toThrow();

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.bench[0]]));
    }).not.toThrow();

    expect(opponent.active.pokemons.cards).toContain(opponentBenchPokemon);
    expect(opponent.bench[0].pokemons.cards).toEqual(previousActive.pokemons.cards);
    expect(player.discard.cards).toContain(counterCatcher);
  });
});
