import {
  AttackAction,
  CardType,
  ChoosePokemonPrompt,
  ResolvePromptAction,
  Simulator,
} from '@ptcg/common';

import { XiCuiNianMeiLongV } from '../../../src/standard/set_f/xi-cui-nian-mei-long-v';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('洗翠 黏美龙V set_f', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('switches the opponent active with 滑溜打滚', () => {
    const card = new XiCuiNianMeiLongV();
    const swappedIn = new TestPokemon();
    const swappedOut = new TestPokemon();

    const { opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.WATER, CardType.METAL]);
    opponent.active.pokemons.cards = [swappedOut];
    opponent.bench[0].pokemons.cards = [swappedIn];

    sim.dispatch(new AttackAction(1, '滑溜打滚'));

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(prompt).toBeTruthy();

    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.bench[0]]));

    expect(opponent.active.getPokemonCard()).toBe(swappedIn);
    expect(opponent.bench[0].getPokemonCard()).toBe(swappedOut);
  });

  it('reduces the next opponent turn attack damage by 30 with 贝壳滚动', () => {
    const card = new XiCuiNianMeiLongV();
    const opponentPokemon = new TestPokemon();
    opponentPokemon.attacks[0].damage = '100';

    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.WATER, CardType.METAL, CardType.COLORLESS]);
    opponent.active.pokemons.cards = [opponentPokemon];

    sim.dispatch(new AttackAction(1, '贝壳滚动'));
    expect(opponent.active.damage).toBe(140);

    sim.dispatch(new AttackAction(2, 'Test attack'));

    expect(player.active.damage).toBe(70);
  });
});
