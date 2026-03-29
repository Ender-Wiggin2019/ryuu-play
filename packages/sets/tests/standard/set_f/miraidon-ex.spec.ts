import {
  AttackAction,
  CardType,
  ChooseCardsPrompt,
  PlayerType,
  ResolvePromptAction,
  SlotType,
  Stage,
  UseAbilityAction,
} from '@ptcg/common';

import { MiraidonEx } from '../../../src/standard/set_f/miraidon-ex';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

class LightningBasicTestPokemon extends TestPokemon {
  public stage = Stage.BASIC;
  public cardTypes = [CardType.LIGHTNING];
}

describe('密勒顿ex set_f', () => {
  it('benches up to two Lightning Basic Pokemon with 串联装置', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new MiraidonEx();
    const targetA = new LightningBasicTestPokemon();
    const targetB = new LightningBasicTestPokemon();
    const offType = new TestPokemon();
    const { player } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.deck.cards = [targetA, offType, targetB];

    sim.dispatch(new UseAbilityAction(1, '串联装置', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [targetA, targetB]));

    expect(player.bench[0].getPokemonCard()).toBe(targetA);
    expect(player.bench[1].getPokemonCard()).toBe(targetB);
    expect(player.deck.cards).toContain(offType);
  });

  it('locks 光子引爆 on the next own turn', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new MiraidonEx();
    const { opponent, state } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.LIGHTNING, CardType.LIGHTNING, CardType.COLORLESS]);
    opponent.active.pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '光子引爆'));
    expect(opponent.active.damage).toBe(220);

    state.turn += 1;
    expect(() => sim.dispatch(new AttackAction(1, '光子引爆'))).toThrow();
  });
});
