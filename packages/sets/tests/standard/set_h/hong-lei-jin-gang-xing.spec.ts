import {
  AttackEffect,
  CardType,
  CheckAttackCostEffect,
  CheckRetreatCostEffect,
  EndTurnEffect,
  Simulator,
} from '@ptcg/common';

import { Arbok } from '../../../src/standard/set_h/arbok';
import { HongLeiJinGangXing } from '../../../src/standard/set_h/hong-lei-jin-gang-xing';
import { TestUtils } from '../../test-utils';

describe('HongLeiJinGangXing set_h', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('鼓击 makes the affected active need one more energy to attack and retreat on the next turn', () => {
    const card = new HongLeiJinGangXing();
    const { state, player, opponent } = TestUtils.getAll(sim);

    sim.store.state.players[0].active.pokemons.cards = [card];
    opponent.active.pokemons.cards = [new Arbok()];

    const attackEffect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(sim.store, state, attackEffect);

    const attackCostEffect = new CheckAttackCostEffect(opponent, opponent.active.getPokemonCard()!.attacks[0]);
    card.reduceEffect(sim.store, state, attackCostEffect);
    expect(attackCostEffect.cost.length).toBe(opponent.active.getPokemonCard()!.attacks[0].cost.length + 1);

    const retreatCostEffect = new CheckRetreatCostEffect(opponent);
    card.reduceEffect(sim.store, state, retreatCostEffect);
    expect(retreatCostEffect.cost.length).toBe(opponent.active.getPokemonCard()!.retreat.length + 1);
  });

  it('removes 鼓击 effect at the end of the affected player turn', () => {
    const card = new HongLeiJinGangXing();
    const { state, player, opponent } = TestUtils.getAll(sim);

    sim.store.state.players[0].active.pokemons.cards = [card];
    opponent.active.pokemons.cards = [new Arbok()];

    const attackEffect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(sim.store, state, attackEffect);

    const endTurnEffect = new EndTurnEffect(opponent);
    card.reduceEffect(sim.store, state, endTurnEffect);

    const retreatCostEffect = new CheckRetreatCostEffect(opponent);
    card.reduceEffect(sim.store, state, retreatCostEffect);
    expect(retreatCostEffect.cost.length).toBe(opponent.active.getPokemonCard()!.retreat.length);
  });

  it('木槌 deals 50 damage to itself', () => {
    const card = new HongLeiJinGangXing();
    const { state, player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.GRASS, CardType.GRASS]);
    opponent.active.pokemons.cards = [new Arbok()];

    const attackEffect = new AttackEffect(player, opponent, card.attacks[1]);
    card.reduceEffect(sim.store, state, attackEffect);

    expect(player.active.damage).toBe(50);
  });
});
