import {
  ChoosePokemonPrompt,
  PlayCardAction,
  PlayerType,
  ResolvePromptAction,
  SlotType,
} from '@ptcg/common';

import { ShuaiJiaoYingRen } from '../../../src/standard/set_f/shuai-jiao-ying-ren';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('摔角鹰人 set_f', () => {
  it('places 1 damage counter on up to 2 opponent Benched Pokemon with 飞身入场', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new ShuaiJiaoYingRen();
    const { player, opponent } = TestUtils.getAll(sim);

    player.hand.cards = [card];
    opponent.bench[0].pokemons.cards = [new TestPokemon()];
    opponent.bench[1].pokemons.cards = [new TestPokemon()];

    sim.dispatch(new PlayCardAction(1, 0, {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.BENCH,
      index: 0,
    }));

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(prompt).toBeTruthy();
    expect(prompt.options.max).toBe(2);

    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.bench[0], opponent.bench[1]]));

    expect(player.bench[0].getPokemonCard()).toBe(card);
    expect(opponent.bench[0].damage).toBe(10);
    expect(opponent.bench[1].damage).toBe(10);
  });
});
