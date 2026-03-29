import {
  AttackAction,
  CardType,
  CoinFlipPrompt,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  SuperType,
  TrainerCard,
  TrainerType,
  ResolvePromptAction,
} from '@ptcg/common';

import { GuoMiChong } from '../../../src/standard/set_h/guo-mi-chong';
import { JiaoJinYu } from '../../../src/standard/set_h/jiao-jin-yu';
import { MianMianPaoFu } from '../../../src/standard/set_h/mian-mian-pao-fu';
import { TestEnergy } from '../../test-cards/test-energy';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

class DummyFestivalGround extends TrainerCard {
  public superType = SuperType.TRAINER;
  public trainerType = TrainerType.STADIUM;
  public set = 'TEST';
  public name = '祭典会场';
  public fullName = '祭典会场 TEST';
  public text = '';
}

describe('festival dance batch set_h', () => {
  it('repeats 朋友环 when 祭典会场 is in play', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new GuoMiChong();
    const { player, opponent } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.active.energies.cards = [new TestEnergy(CardType.GRASS)];
    player.bench[0].pokemons.cards = [new TestPokemon()];
    player.stadium.cards = [new DummyFestivalGround()];
    opponent.active.pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '朋友环'));

    expect(opponent.active.damage).toBe(40);
  });

  it('repeats 潮旋 and discards one energy each time when the coin is heads', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new JiaoJinYu();
    const energyA = new TestEnergy(CardType.COLORLESS);
    const energyB = new TestEnergy(CardType.COLORLESS);
    const { player, opponent } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.active.energies.cards = [new TestEnergy(CardType.COLORLESS), new TestEnergy(CardType.COLORLESS)];
    player.stadium.cards = [new DummyFestivalGround()];
    opponent.active.pokemons.cards = [new TestPokemon()];
    opponent.active.energies.cards = [energyA, energyB];

    sim.dispatch(new AttackAction(1, '潮旋'));

    let prompt = TestUtils.getLastPrompt(sim) as CoinFlipPrompt;
    expect(prompt).toBeTruthy();
    sim.dispatch(new ResolvePromptAction(prompt.id, true));

    prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(prompt).toBeTruthy();
    sim.dispatch(new ResolvePromptAction(prompt.id, [energyA]));

    prompt = TestUtils.getLastPrompt(sim) as CoinFlipPrompt;
    expect(prompt).toBeTruthy();
    sim.dispatch(new ResolvePromptAction(prompt.id, true));

    prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(prompt).toBeTruthy();
    sim.dispatch(new ResolvePromptAction(prompt.id, [energyB]));

    expect(opponent.active.damage).toBe(20);
    expect(opponent.discard.cards).toContain(energyA);
    expect(opponent.discard.cards).toContain(energyB);
  });

  it('repeats 轻轻放置 when 祭典会场 is in play', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new MianMianPaoFu();
    const { player, opponent } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.active.energies.cards = [new TestEnergy(CardType.PSYCHIC)];
    player.stadium.cards = [new DummyFestivalGround()];
    opponent.active.pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '轻轻放置'));

    let prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(prompt).toBeTruthy();
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.active]));

    prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(prompt).toBeTruthy();
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.active]));

    expect(opponent.active.damage).toBe(40);
  });
});
