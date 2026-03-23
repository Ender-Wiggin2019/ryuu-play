import {
  ChoosePokemonPrompt,
  PlayCardAction,
  PlayerType,
  ResolvePromptAction,
  Simulator,
  SlotType,
} from '@ptcg/common';

import { PrimeCatcher } from '../../../src/standard/set_h/prime-catcher';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('Prime Catcher set_h', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('switches opponent active, then switches your active', () => {
    const primeCatcher = new PrimeCatcher();
    const playerBenchPokemon = new TestPokemon();
    const opponentBenchPokemon = new TestPokemon();

    const { player, opponent } = TestUtils.getAll(sim);
    const previousPlayerActive = player.active;
    const previousOpponentActive = opponent.active;

    player.hand.cards = [primeCatcher];
    player.bench[0].pokemons.cards = [playerBenchPokemon];
    opponent.bench[0].pokemons.cards = [opponentBenchPokemon];

    expect(() => {
      sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    }).not.toThrow();

    const opponentPrompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(opponentPrompt.id, [opponent.bench[0]]));
    }).not.toThrow();

    const playerPrompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(playerPrompt.id, [player.bench[0]]));
    }).not.toThrow();

    expect(opponent.active.pokemons.cards).toContain(opponentBenchPokemon);
    expect(opponent.bench[0].pokemons.cards).toEqual(previousOpponentActive.pokemons.cards);
    expect(player.active.pokemons.cards).toContain(playerBenchPokemon);
    expect(player.bench[0].pokemons.cards).toEqual(previousPlayerActive.pokemons.cards);
  });
});
