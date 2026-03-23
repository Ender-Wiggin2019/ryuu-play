import {
  CardType,
  CheckRetreatCostEffect,
  PokemonCard,
  Stage,
} from '@ptcg/common';

import { RescueBoard } from '../../../src/standard/set_h/rescue-board';
import { TestUtils } from '../../test-utils';

class RetreatPokemon extends PokemonCard {
  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 100;

  public weakness = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public set: string = 'TEST';

  public name: string = 'Retreat Pokemon';

  public fullName: string = 'Retreat Pokemon TEST';
}

describe('Rescue Board set_h', () => {
  it('reduces retreat cost by 1 when remaining HP is above 30', () => {
    const sim = TestUtils.createTestSimulator();
    const rescueBoard = new RescueBoard();
    const retreatPokemon = new RetreatPokemon();
    const { state, player } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [retreatPokemon]);
    player.active.trainers.cards = [rescueBoard];
    player.active.damage = 60;

    const checkRetreat = new CheckRetreatCostEffect(player);
    sim.store.reduceEffect(state, checkRetreat);

    expect(checkRetreat.cost).toEqual([CardType.COLORLESS]);
  });

  it('sets retreat cost to 0 when remaining HP is 30 or less', () => {
    const sim = TestUtils.createTestSimulator();
    const rescueBoard = new RescueBoard();
    const retreatPokemon = new RetreatPokemon();
    const { state, player } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [retreatPokemon]);
    player.active.trainers.cards = [rescueBoard];
    player.active.damage = 70;

    const checkRetreat = new CheckRetreatCostEffect(player);
    sim.store.reduceEffect(state, checkRetreat);

    expect(checkRetreat.cost).toEqual([]);
  });
});
