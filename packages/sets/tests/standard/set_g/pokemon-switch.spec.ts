import {
  ChoosePokemonPrompt,
  PlayCardAction,
  PlayerType,
  ResolvePromptAction,
  Simulator,
  SlotType,
} from '@ptcg/common';

import { PokemonSwitch } from '../../../src/standard/set_g/pokemon-switch';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('Pokemon Switch set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('switches your Active Pokemon with a Benched Pokemon', () => {
    const pokemonSwitch = new PokemonSwitch();
    const benchPokemon = new TestPokemon();

    const { player } = TestUtils.getAll(sim);
    const previousActive = player.active;
    player.hand.cards = [pokemonSwitch];
    player.bench[0].pokemons.cards = [benchPokemon];

    expect(() => {
      sim.dispatch(
        new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 })
      );
    }).not.toThrow();

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(prompt.id, [player.bench[0]]));
    }).not.toThrow();

    expect(player.active.pokemons.cards).toContain(benchPokemon);
    expect(player.bench[0].pokemons.cards).toEqual(previousActive.pokemons.cards);
    expect(player.discard.cards).toContain(pokemonSwitch);
  });
});
