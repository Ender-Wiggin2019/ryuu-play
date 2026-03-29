import {
  AttackAction,
  CardType,
  ChoosePokemonPrompt,
  ResolvePromptAction,
} from '@ptcg/common';

import { RagingBolt } from '../../../src/standard/set_h/raging-bolt';
import { RagingBoltEx } from '../../../src/standard/set_h/raging-bolt-ex';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('worker F set_h batch', () => {
  it('uses Dragon typing and no weakness for 猛雷鼓ex', () => {
    const card = new RagingBoltEx();

    expect(card.cardTypes).toEqual([CardType.DRAGON]);
    expect(card.weakness).toEqual([]);
  });

  it('puts scaled damage on a Benched Pokemon with 猛雷鼓 落雷风暴', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new RagingBolt();
    const { opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.LIGHTNING, CardType.FIGHTING, CardType.COLORLESS]);
    opponent.active.pokemons.cards = [new TestPokemon()];
    opponent.bench[0].pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '落雷风暴'));

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.bench[0]]));

    expect(opponent.active.damage).toBe(0);
    expect(opponent.bench[0].damage).toBe(90);
  });

  it('deals 130 damage with 猛雷鼓 龙之头击', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new RagingBolt();
    const { opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.LIGHTNING, CardType.FIGHTING, CardType.COLORLESS]);
    opponent.active.pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '龙之头击'));

    expect(opponent.active.damage).toBe(130);
  });
});
