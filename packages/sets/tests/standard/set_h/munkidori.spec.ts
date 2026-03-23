import {
  CardType,
  ChoosePokemonPrompt,
  MoveDamagePrompt,
  PlayerType,
  ResolvePromptAction,
  Simulator,
  SlotType,
  UseAbilityAction,
} from '@ptcg/common';

import { Munkidori } from '../../../src/standard/set_h/munkidori';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('Munkidori set_h', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('lets you choose how many counters to move with Adrena-Brain', () => {
    const munkidori = new Munkidori();
    const damagedPokemon = new TestPokemon();
    const opponentBench = new TestPokemon();

    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [munkidori], [CardType.DARK]);
    player.bench[0].pokemons.cards = [damagedPokemon];
    player.bench[0].damage = 30;
    opponent.bench[0].pokemons.cards = [opponentBench];

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, 'Adrena-Brain', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.ACTIVE,
        index: 0,
      }));
    }).not.toThrow();

    const sourcePrompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(sourcePrompt.id, [player.bench[0]]));
    }).not.toThrow();

    const targetPrompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(targetPrompt.id, [opponent.bench[0]]));
    }).not.toThrow();

    const movePrompt = TestUtils.getLastPrompt(sim) as MoveDamagePrompt;
    expect(movePrompt).toBeTruthy();
    expect(movePrompt.options.max).toBe(3);

    expect(() => {
      sim.dispatch(new ResolvePromptAction(movePrompt.id, [{
        from: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 },
        to: { player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index: 0 },
      }]));
    }).not.toThrow();

    expect(player.bench[0].damage).toBe(20);
    expect(opponent.bench[0].damage).toBe(10);
  });
});
