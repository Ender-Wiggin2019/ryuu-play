import {
  AttackEffect,
  CardType,
  Simulator,
  Stage,
} from '@ptcg/common';

import { ShanDianNiao } from '../../../src/standard/set_f/shan-dian-niao';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('闪电鸟 set_f', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('adds 10 damage to basic Lightning attacks while Electric Emblem is in play', () => {
    const card = new ShanDianNiao();
    const attacker = new TestPokemon();
    attacker.cardTypes = [CardType.LIGHTNING];
    (attacker as any).stage = Stage.BASIC;
    const { player, opponent, state } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [attacker]);
    player.bench[0].pokemons.cards = [card];

    const effect = new AttackEffect(player, opponent, attacker.attacks[0]);
    card.reduceEffect(sim.store, state, effect);

    expect(effect.damage).toBe(20);
  });

  it('keeps 雷电球 at 110 damage', () => {
    const card = new ShanDianNiao();
    const { player, opponent, state } = TestUtils.getAll(sim);

    const effect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(sim.store, state, effect);

    expect(effect.damage).toBe(110);
  });
});
