import {
  AddSpecialConditionsEffect,
  AttackAction,
  AttackEffect,
  CardType,
  ChoosePokemonPrompt,
  DealDamageEffect,
  ResolvePromptAction,
  SpecialCondition,
} from '@ptcg/common';

import { CornerstoneMaskOgerponEx } from '../../../src/standard/set_h/cornerstone-mask-ogerpon-ex';
import { ChouChouYu } from '../../../src/standard/set_h/chou-chou-yu';
import { MeiNaSiEx } from '../../../src/standard/set_h/mei-na-si-ex';
import { PoKongYanEx } from '../../../src/standard/set_h/po-kong-yan-ex';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('worker C batch set_h', () => {
  it('switches itself with a Benched Pokemon using 丑丑鱼跃起逃脱', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new ChouChouYu();
    const benchPokemon = new TestPokemon();
    const { player } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.COLORLESS]);
    player.bench[0].pokemons.cards = [benchPokemon];

    sim.dispatch(new AttackAction(1, '跃起逃脱'));

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [player.bench[0]]));

    expect(player.active.getPokemonCard()).toBe(benchPokemon);
    expect(player.bench[0].getPokemonCard()).toBe(card);
  });

  it('blocks damage and effects from Tera Pokemon with 美纳斯ex璀璨鳞片', () => {
    const sim = TestUtils.createTestSimulator();
    const milotic = new MeiNaSiEx();
    const teraAttacker = new CornerstoneMaskOgerponEx();
    const { player, opponent, state } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [milotic];
    opponent.active.pokemons.cards = [teraAttacker];

    const attackEffect = new AttackEffect(opponent, player, teraAttacker.attacks[0]);
    const damageEffect = new DealDamageEffect(attackEffect, 140);
    damageEffect.target = player.active;
    milotic.reduceEffect(sim.store, state, damageEffect);

    expect(damageEffect.preventDefault).toBe(true);

    const statusEffect = new AddSpecialConditionsEffect(attackEffect, [SpecialCondition.ASLEEP]);
    statusEffect.target = player.active;
    milotic.reduceEffect(sim.store, state, statusEffect);

    expect(statusEffect.preventDefault).toBe(true);
  });

  it('cannot use 破空焰ex烈火猛冲 again until it leaves the Active Spot', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new PoKongYanEx();

    TestUtils.setActive(sim, [card], [CardType.FIRE, CardType.FIRE, CardType.COLORLESS]);

    sim.dispatch(new AttackAction(1, '烈火猛冲'));
    expect(TestUtils.getAll(sim).opponent.active.damage).toBe(260);

    expect(() => sim.dispatch(new AttackAction(1, '烈火猛冲'))).toThrow();
  });
});
