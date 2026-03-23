import {
  ChoosePokemonPrompt,
  PlayCardAction,
  PlayerType,
  ResolvePromptAction,
  Simulator,
  SlotType,
} from '@ptcg/common';

import { SwitchCart } from '../../../src/standard/set_f/switch-cart';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('Switch Cart set_f', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('switches active basic pokemon and heals 30 from switched out pokemon', () => {
    const switchCart = new SwitchCart();
    const benchPokemon = new TestPokemon();

    const { player } = TestUtils.getAll(sim);
    const previousActive = player.active;
    player.active.damage = 50;
    player.hand.cards = [switchCart];
    player.bench[0].pokemons.cards = [benchPokemon];

    expect(() => {
      sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    }).not.toThrow();

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(prompt.id, [player.bench[0]]));
    }).not.toThrow();

    expect(player.active.pokemons.cards).toContain(benchPokemon);
    expect(previousActive.damage).toBe(20);
    expect(player.discard.cards).toContain(switchCart);
  });
});
