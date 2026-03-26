import {
  AttackAction,
  CardType,
  ChooseAttackPrompt,
  ChoosePokemonPrompt,
  PlayerType,
  ResolvePromptAction,
  SlotType,
  UseAttackEffect,
} from '@ptcg/common';

import { KirliaCs5aC } from '../../../src/standard/set_fgh/kirlia-cs5ac';
import { RaltsCs5aC } from '../../../src/standard/set_fgh/ralts-cs5ac';
import { RaltsCs65C } from '../../../src/standard/set_fgh/ralts-cs65c';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('same-name variants set_fgh', () => {
  it('switches 拉鲁拉丝 with a benched Pokémon after 瞬移破坏', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new RaltsCs5aC();
    const bench = new TestPokemon();

    TestUtils.setActive(sim, [card], [CardType.PSYCHIC]);
    const { player, opponent } = TestUtils.getAll(sim);
    player.bench[0].pokemons.cards = [bench];
    opponent.active.pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '瞬移破坏'));

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [player.bench[0]]));

    expect(player.active.getPokemonCard()).toBe(bench);
    expect(opponent.active.damage).toBe(10);
  });

  it('switches 奇鲁莉安 with a benched Pokémon after 瞬移破坏', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new KirliaCs5aC();
    const bench = new TestPokemon();

    TestUtils.setActive(sim, [card], [CardType.PSYCHIC]);
    const { player, opponent } = TestUtils.getAll(sim);
    player.bench[0].pokemons.cards = [bench];
    opponent.active.pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '瞬移破坏'));

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [player.bench[0]]));

    expect(player.active.getPokemonCard()).toBe(bench);
    expect(opponent.active.damage).toBe(30);
  });

  it('prevents the chosen attack with 拉鲁拉丝 记忆跳越', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new RaltsCs65C();
    const { player, opponent, state } = TestUtils.getAll(sim);
    const attacker = new TestPokemon();

    TestUtils.setActive(sim, [card], [CardType.PSYCHIC]);
    opponent.active.pokemons.cards = [attacker];

    sim.dispatch(new AttackAction(1, '记忆跳越'));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseAttackPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, attacker.attacks[0]));

    const blockedAttack = new UseAttackEffect(opponent, attacker.attacks[0]);
    expect(() => sim.store.reduceEffect(state, blockedAttack)).toThrow();
  });
});
