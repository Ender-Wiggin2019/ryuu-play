import {
  AttackAction,
  CardType,
  ChooseCardsPrompt,
  ResolvePromptAction,
  SlotType,
  SpecialCondition,
  UseAbilityAction,
  PlayerType,
} from '@ptcg/common';

import { HongLianKaiQiG, hongLianKaiQiVariants } from '../../../src/standard/set_g/hong-lian-kai-qi';
import { TestEnergy } from '../../test-cards/test-energy';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('红莲铠骑 set_g', () => {
  it('exposes seven unique faces with a shared logic group', () => {
    expect(hongLianKaiQiVariants).toHaveLength(7);
    expect(new Set(hongLianKaiQiVariants.map(card => card.fullName)).size).toBe(7);
    expect(new Set(hongLianKaiQiVariants.map(card => (card.rawData as any).logic_group_key)).size).toBe(1);
    expect((hongLianKaiQiVariants[0].rawData as any).variant_group_size).toBe(7);
  });

  it('moves a Fire Energy from the Bench with 送火', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new HongLianKaiQiG();
    const fireEnergy = new TestEnergy(CardType.FIRE);
    const { player } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card]);
    player.bench[0].pokemons.cards = [new TestPokemon()];
    player.bench[0].energies.cards = [fireEnergy];

    sim.dispatch(new UseAbilityAction(1, '送火', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(prompt).toBeTruthy();

    sim.dispatch(new ResolvePromptAction(prompt.id, [fireEnergy]));

    expect(player.active.energies.cards).toContain(fireEnergy);
    expect(player.bench[0].energies.cards).toHaveLength(0);
  });

  it('burns the defending Pokémon with 火焰加农炮', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new HongLianKaiQiG();
    const { opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.FIRE, CardType.FIRE, CardType.FIRE]);
    opponent.active.pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '火焰加农炮'));

    expect(opponent.active.damage).toBe(90);
    expect(opponent.active.specialConditions).toContain(SpecialCondition.BURNED);
  });
});
