import {
  AttackAction,
  AttackEffect,
  CardType,
  CheckAttackCostEffect,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  PlayerType,
  RetreatEffect,
  ResolvePromptAction,
  SelectPrompt,
  Simulator,
  SlotType,
  UseAbilityAction,
} from '@ptcg/common';

import { TestCard } from '../../test-cards/test-card';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';
import { GuiJiaoLuV } from '../../../src/standard/set_f/gui-jiao-lu-v';
import { LuoJiYaV } from '../../../src/standard/set_f/luo-ji-ya-v';
import { LuoJiYaVSTAR } from '../../../src/standard/set_f/luo-ji-ya-vstar';
import { NuYingGeEx } from '../../../src/standard/set_f/nu-ying-ge-ex';
import { YueYueXiongHeYueEx } from '../../../src/standard/set_f/yue-yue-xiong-he-yue-ex';

describe('set_f pokemon impl6', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('moves attached Energy to 诡角鹿V when it is switched in from the Bench', async () => {
    const guiJiaoLuV = new GuiJiaoLuV();
    const energyA = TestUtils.makeEnergies([CardType.COLORLESS])[0];
    const energyB = TestUtils.makeEnergies([CardType.FIRE])[0];
    const { state, player } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [new TestPokemon()];
    player.active.energies.cards = [energyA];
    player.bench[0].pokemons.cards = [guiJiaoLuV];
    player.bench[1].pokemons.cards = [new TestPokemon()];
    player.bench[1].energies.cards = [energyB];

    const effect = new RetreatEffect(player, 0);
    const store = {
      prompt: (promptState: typeof state, _prompt: unknown, callback: (result: any) => void) => {
        setImmediate(() => callback([energyA, energyB]));
        return promptState;
      },
    } as any;

    guiJiaoLuV.reduceEffect(store, state, effect);
    await new Promise(resolve => setImmediate(resolve));

    expect(player.bench[0].energies.cards).toEqual([energyA, energyB]);
  });

  it('does 40 damage per Energy attached with 屏障猛攻', () => {
    const guiJiaoLuV = new GuiJiaoLuV();
    const { state, player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [guiJiaoLuV], [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS]);

    const effect = new AttackEffect(player, opponent, guiJiaoLuV.attacks[0]);
    guiJiaoLuV.reduceEffect(sim.store, state, effect);

    expect(effect.damage).toEqual(120);
  });

  it('discards a hand card and draws three with 洛奇亚V read wind', () => {
    const lugiaV = new LuoJiYaV();
    const handA = new TestCard();
    const handB = new TestCard();
    const drawA = new TestCard();
    const drawB = new TestCard();
    const drawC = new TestCard();

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [lugiaV], [CardType.COLORLESS]);
    player.hand.cards = [handA, handB];
    player.deck.cards = [drawA, drawB, drawC];

    sim.dispatch(new AttackAction(1, '读风'));
    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [handB]));

    expect(player.discard.cards).toContain(handB);
    expect(player.hand.cards).toEqual(jasmine.arrayContaining([drawA, drawB, drawC]));
  });

  it('optionally discards the stadium with 洛奇亚V cyclone dive', () => {
    const lugiaV = new LuoJiYaV();
    const stadium = new TestCard();

    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [lugiaV], [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS]);
    player.stadium.cards = [stadium];

    sim.dispatch(new AttackAction(1, '气旋俯冲'));
    const prompt = TestUtils.getLastPrompt(sim) as SelectPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, 1));

    expect(player.stadium.cards.length).toEqual(0);
    expect(player.discard.cards).toContain(stadium);
    expect(opponent.active.damage).toEqual(130);
  });

  it('optionally discards the stadium with 洛奇亚VSTAR storm dive', () => {
    const lugiaVSTAR = new LuoJiYaVSTAR();
    const stadium = new TestCard();

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [lugiaVSTAR], [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS]);
    player.stadium.cards = [stadium];

    sim.dispatch(new AttackAction(1, '风暴俯冲'));
    const prompt = TestUtils.getLastPrompt(sim) as SelectPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, 1));

    expect(player.stadium.cards.length).toEqual(0);
    expect(player.discard.cards).toContain(stadium);
  });

  it('puts up to two non-rule Colorless Pokemon from discard onto the Bench with 召唤之星', () => {
    const lugiaVSTAR = new LuoJiYaVSTAR();
    const colorlessA = new TestPokemon();
    colorlessA.cardTypes = [CardType.COLORLESS];
    const colorlessB = new TestPokemon();
    colorlessB.cardTypes = [CardType.COLORLESS];
    const ruleBox = new TestPokemon();
    ruleBox.cardTypes = [CardType.COLORLESS];
    (ruleBox as any).tags = ['EX'];

    const { player } = TestUtils.getAll(sim);
    player.active.pokemons.cards = [lugiaVSTAR];
    player.discard.cards = [colorlessA, colorlessB, ruleBox];

    sim.dispatch(new UseAbilityAction(1, '召唤之星', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [colorlessA, colorlessB]));

    expect(player.bench[0].getPokemonCard()).toBe(colorlessA);
    expect(player.bench[1].getPokemonCard()).toBe(colorlessB);
    expect(player.discard.cards).toContain(ruleBox);
  });

  it('discards hand and draws six with 怒鹦哥ex, and blocks reuse this turn', () => {
    const parrot = new NuYingGeEx();
    const handCards = [new TestCard(), new TestCard(), new TestCard()];
    const deckCards = TestUtils.makeTestCards(6);

    const { player } = TestUtils.getAll(sim);
    player.bench[0].pokemons.cards = [parrot];
    player.hand.cards = [...handCards];
    player.deck.cards = [...deckCards];

    sim.dispatch(new UseAbilityAction(1, '英武重抽', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.BENCH,
      index: 0,
    }));

    expect(player.discard.cards).toEqual(jasmine.arrayContaining(handCards));
    expect(player.hand.cards.length).toEqual(6);

    expect(() => sim.dispatch(new UseAbilityAction(1, '英武重抽', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.BENCH,
      index: 0,
    }))).toThrow();
  });

  it('attaches up to two basic Energy cards from discard with 鼓足干劲', () => {
    const parrot = new NuYingGeEx();
    const energyA = TestUtils.makeEnergies([CardType.FIRE])[0];
    const energyB = TestUtils.makeEnergies([CardType.WATER])[0];
    const target = new TestPokemon();

    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [parrot], [CardType.COLORLESS]);
    player.discard.cards = [energyA, energyB];
    player.bench[0].pokemons.cards = [target];

    sim.dispatch(new AttackAction(1, '鼓足干劲'));
    const energyPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(energyPrompt.id, [energyA, energyB]));
    const pokemonPrompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(pokemonPrompt.id, [player.bench[0]]));

    expect(player.bench[0].energies.cards).toEqual([energyA, energyB]);
    expect(opponent.active.damage).toEqual(20);
  });

  it('reduces Blood Moon cost by the prizes the opponent has taken', () => {
    const moonBear = new YueYueXiongHeYueEx();
    const { player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [moonBear], [CardType.COLORLESS, CardType.COLORLESS]);
    opponent.prizes[0].cards = [];
    opponent.prizes[1].cards = [];
    opponent.prizes[2].cards = [];

    const costEffect = new CheckAttackCostEffect(player, moonBear.attacks[0]);
    moonBear.reduceEffect(sim.store, sim.store.state, costEffect);

    expect(costEffect.cost.length).toEqual(2);
  });
});
