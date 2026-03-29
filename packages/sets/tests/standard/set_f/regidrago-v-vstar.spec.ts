import {
  AttackAction,
  CardType,
  ChooseAttackPrompt,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  ResolvePromptAction,
} from '@ptcg/common';

import { RegidragoV } from '../../../src/standard/set_f/regidrago-v';
import { RegidragoVSTAR } from '../../../src/standard/set_f/regidrago-vstar';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('Regidrago V / VSTAR', () => {
  it('mills three cards and attaches all milled Energy with 天之呐喊', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new RegidragoV();
    const energyA = TestUtils.makeEnergies([CardType.GRASS])[0];
    const energyB = TestUtils.makeEnergies([CardType.FIRE])[0];
    const nonEnergy = new TestPokemon();
    const { player } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.COLORLESS]);
    player.deck.cards = [energyA, nonEnergy, energyB];

    sim.dispatch(new AttackAction(1, '天之呐喊'));

    expect(player.active.energies.cards).toContain(energyA);
    expect(player.active.energies.cards).toContain(energyB);
    expect(player.active.energies.cards.length).toBe(3);
    expect(player.discard.cards).toContain(nonEnergy);
    expect(player.deck.cards.length).toBe(0);
  });

  it('damages the active and one benched Pokemon with 巨龙镭射', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new RegidragoV();
    const benchTarget = new TestPokemon();
    const { player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.GRASS, CardType.GRASS, CardType.FIRE]);
    opponent.bench[0].pokemons.cards = [benchTarget];

    sim.dispatch(new AttackAction(1, '巨龙镭射'));

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.bench[0]]));

    expect(opponent.active.damage).toBe(130);
    expect(opponent.bench[0].damage).toBe(30);
    expect(player.discard.cards).not.toContain(benchTarget);
  });

  it('copies 雷吉铎拉戈V 的 巨龙镭射 from discard with 巨龙无双', () => {
    const sim = TestUtils.createTestSimulator();
    const vstar = new RegidragoVSTAR();
    const source = new RegidragoV();
    const benchTarget = new TestPokemon();
    const { player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [vstar], [CardType.GRASS, CardType.GRASS, CardType.FIRE]);
    player.discard.cards = [source];
    opponent.bench[0].pokemons.cards = [benchTarget];

    sim.dispatch(new AttackAction(1, '巨龙无双'));

    const cardsPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(cardsPrompt.id, [source]));

    const attackPrompt = TestUtils.getLastPrompt(sim) as ChooseAttackPrompt;
    sim.dispatch(new ResolvePromptAction(attackPrompt.id, source.attacks[1]));

    const targetPrompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(targetPrompt.id, [opponent.bench[0]]));

    expect(opponent.active.damage).toBe(130);
    expect(opponent.bench[0].damage).toBe(30);
  });
});
