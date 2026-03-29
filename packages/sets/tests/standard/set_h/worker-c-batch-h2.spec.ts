import {
  AttackAction,
  AddSpecialConditionsEffect,
  AttackEffect,
  CardType,
  CoinFlipPrompt,
  Simulator,
  SpecialCondition,
  PutDamageEffect,
} from '@ptcg/common';

import { ChongGunNi } from '../../../src/standard/set_h/chong-gun-ni';
import { ChongJiaSheng } from '../../../src/standard/set_h/chong-jia-sheng';
import { KenGuoChong } from '../../../src/standard/set_h/ken-guo-chong';
import { MuMuXiao } from '../../../src/standard/set_h/mu-mu-xiao';
import { TestCard } from '../../test-cards/test-card';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('worker C batch set_h round 2', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('draws 1 card with 木木枭 叼', () => {
    const card = new MuMuXiao();
    const drawn = new TestCard();
    const { state, player, opponent } = TestUtils.getAll(sim);

    player.deck.cards = [drawn];
    player.active.pokemons.cards = [card];

    const effect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(sim.store, state, effect);

    expect(player.hand.cards).toEqual([drawn]);
    expect(player.deck.cards).toEqual([]);
  });

  it('adds 20 damage on heads with 啃果虫 滚动攻击', () => {
    const card = new KenGuoChong();
    const { state, player, opponent } = TestUtils.getAll(sim);

    const store = {
      prompt: (promptState: typeof state, _prompt: unknown, callback: (result: boolean) => void) => {
        const prompts = Array.isArray(_prompt) ? _prompt : [_prompt];
        expect(prompts[0] instanceof CoinFlipPrompt).toBeTrue();
        callback(true);
        return promptState;
      },
    } as any;

    const effect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(store, state, effect);

    expect(effect.damage).toBe(30);
  });

  it('damages itself with 虫滚泥 小小莽撞', () => {
    const card = new ChongGunNi();
    const { state, player, opponent } = TestUtils.getAll(sim);

    state.turn = 2;
    TestUtils.setActive(sim, [card], [CardType.GRASS]);
    TestUtils.setDefending(sim, [new TestPokemon()]);

    sim.dispatch(new AttackAction(1, '小小莽撞'));

    expect(opponent.active.damage).toBe(30);
    expect(player.active.damage).toBe(10);
  });

  it('blocks attack damage and effects to Benched Pokemon with 虫甲圣 球形护盾', () => {
    const card = new ChongJiaSheng();
    const attacker = new TestPokemon();
    const benchTarget = new TestPokemon();
    const { state, player, opponent } = TestUtils.getAll(sim);

    player.bench[0].pokemons.cards = [card];
    player.bench[1].pokemons.cards = [benchTarget];
    opponent.active.pokemons.cards = [attacker];

    const attackEffect = new AttackEffect(opponent, player, attacker.attacks[0]);
    const damageEffect = new PutDamageEffect(attackEffect, 40);
    damageEffect.target = player.bench[1];
    card.reduceEffect(sim.store, state, damageEffect);

    expect(damageEffect.preventDefault).toBeTrue();
    expect(player.bench[1].damage).toBe(0);

    const statusEffect = new AddSpecialConditionsEffect(attackEffect, [SpecialCondition.ASLEEP]);
    statusEffect.target = player.bench[1];
    card.reduceEffect(sim.store, state, statusEffect);

    expect(statusEffect.preventDefault).toBeTrue();
    expect(player.bench[1].specialConditions).not.toContain(SpecialCondition.ASLEEP);
  });
});
