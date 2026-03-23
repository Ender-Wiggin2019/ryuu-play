import {
  CardType,
  CheckHpEffect,
  PokemonCard,
  Stage,
} from '@ptcg/common';

import { BraveryCharm } from '../../../src/standard/set_g/bravery-charm';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

class StageOnePokemon extends PokemonCard {
  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Basic Stub';

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 100;

  public weakness = [];

  public retreat = [];

  public set: string = 'TEST';

  public name: string = 'Stage One Pokemon';

  public fullName: string = 'Stage One Pokemon TEST';
}

describe('Bravery Charm set_g', () => {
  it('adds 50 HP when attached to a Basic Pokemon', () => {
    const sim = TestUtils.createTestSimulator();
    const braveryCharm = new BraveryCharm();
    const basicPokemon = new TestPokemon();
    const { state, player } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [basicPokemon]);
    player.active.trainers.cards = [braveryCharm];

    const effect = new CheckHpEffect(player, player.active);
    sim.store.reduceEffect(state, effect);

    expect(effect.hp).toBe(basicPokemon.hp + 50);
  });

  it('does not add HP when attached to a non-Basic Pokemon', () => {
    const sim = TestUtils.createTestSimulator();
    const braveryCharm = new BraveryCharm();
    const stageOnePokemon = new StageOnePokemon();
    const { state, player } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [stageOnePokemon]);
    player.active.trainers.cards = [braveryCharm];

    const effect = new CheckHpEffect(player, player.active);
    sim.store.reduceEffect(state, effect);

    expect(effect.hp).toBe(stageOnePokemon.hp);
  });
});
