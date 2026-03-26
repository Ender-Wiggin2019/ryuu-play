import {
  AttackAction,
  AttackEffect,
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  MoveDeckCardsToDiscardEffect,
  PlayCardAction,
  PlayerType,
  PutDamageEffect,
  ResolvePromptAction,
  SelectPrompt,
  Simulator,
  SlotType,
  UseAbilityAction,
} from '@ptcg/common';

import { Eviolite } from '../../../src/standard/set-diamond-and-pearl/eviolite';
import { Leon } from '../../../src/standard/set-sword-and-shield/leon';
import { Annihilape } from '../../../src/standard/set_fgh/annihilape';
import { BoBo } from '../../../src/standard/set_fgh/bo-bo';
import { BoBoCsv4C } from '../../../src/standard/set_fgh/bo-bo-csv4c';
import { DaBiNiaoEx } from '../../../src/standard/set_fgh/da-bi-niao-ex';
import { DaBiNiaoV } from '../../../src/standard/set_fgh/da-bi-niao-v';
import { DaWeiLi } from '../../../src/standard/set_fgh/da-wei-li';
import { DaWeiLiCs5bC, DaWeiLiCs5bCCommon } from '../../../src/standard/set_fgh/da-wei-li-cs5bc';
import { DaWeiLiCs5aC, DaWeiLiCs5aCRareSparkle, DaWeiLiCszc, DaWeiLiCsve1C2, DaWeiLiCsve2pC2, DaWeiLiPromo3 } from '../../../src/standard/set_fgh/da-wei-li-variants';
import { DaYaLi } from '../../../src/standard/set_fgh/da-ya-li';
import { DaYaLiCs5aC } from '../../../src/standard/set_fgh/da-ya-li-cs5ac';
import { Drifloon } from '../../../src/standard/set_fgh/drifloon';
import { GardevoirEx } from '../../../src/standard/set_fgh/gardevoir-ex';
import { GuangHuiJiaHeRenWa } from '../../../src/standard/set_fgh/guang-hui-jia-he-ren-wa';
import { GuangHuiPenHuoLong } from '../../../src/standard/set_fgh/guang-hui-pen-huo-long';
import { GuiJiaoLuV } from '../../../src/standard/set_fgh/gui-jiao-lu-v';
import { HongMingYueEx } from '../../../src/standard/set_fgh/hong-ming-yue-ex';
import { HouJiaoWei } from '../../../src/standard/set_fgh/hou-jiao-wei';
import { HouJiaoWeiG } from '../../../src/standard/set_fgh/hou-jiao-wei-g';
import { HuoKongLong } from '../../../src/standard/set_fgh/huo-kong-long';
import { Kirlia } from '../../../src/standard/set_fgh/kirlia';
import { KirliaCs5aC } from '../../../src/standard/set_fgh/kirlia-cs5ac';
import { KirliaCsv2C } from '../../../src/standard/set_fgh/kirlia-csv2c';
import { setFgh } from '../../../src/standard/set_fgh';
import { LumineonV } from '../../../src/standard/set_fgh/lumineon-v';
import { Manaphy } from '../../../src/standard/set_fgh/manaphy';
import { RadiantAlakazam } from '../../../src/standard/set_fgh/radiant-alakazam';
import { IronHandsEx } from '../../../src/standard/set_fgh/iron-hands-ex';
import { LuoJiYaV } from '../../../src/standard/set_fgh/luo-ji-ya-v';
import { LuoJiYaVSTAR } from '../../../src/standard/set_fgh/luo-ji-ya-vstar';
import { MiraidonEx } from '../../../src/standard/set_fgh/miraidon-ex';
import { NuYingGeEx } from '../../../src/standard/set_fgh/nu-ying-ge-ex';
import { PenHuoLongEx } from '../../../src/standard/set_fgh/pen-huo-long-ex';
import { Ralts } from '../../../src/standard/set_fgh/ralts';
import { RaltsCs5aC } from '../../../src/standard/set_fgh/ralts-cs5ac';
import { RaltsCs65C } from '../../../src/standard/set_fgh/ralts-cs65c';
import { RaichuV } from '../../../src/standard/set_fgh/raichu-v';
import { RaikouV } from '../../../src/standard/set_fgh/raikou-v';
import { RotomV } from '../../../src/standard/set_fgh/rotom-v';
import { ShiZuDaNiao } from '../../../src/standard/set_fgh/shi-zu-da-niao';
import { TaoDaiLangEx } from '../../../src/standard/set_fgh/tao-dai-lang-ex';
import { XiaoHuoLong } from '../../../src/standard/set_fgh/xiao-huo-long';
import { YaoQuanEr } from '../../../src/standard/set_fgh/yao-quan-er';
import { YueYueXiongHeYueEx } from '../../../src/standard/set_fgh/yue-yue-xiong-he-yue-ex';
import { ZhenYiFa } from '../../../src/standard/set_fgh/zhen-yi-fa';
import { Zapdos } from '../../../src/standard/set_fgh/zapdos';
import { TestCard } from '../../test-cards/test-card';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('set_fgh pokemon additions', () => {
  it('registers the added Pokemon cards in set_fgh', () => {
    expect(setFgh.some(card => card instanceof GardevoirEx)).toBe(true);
    expect(setFgh.some(card => card instanceof Kirlia)).toBe(true);
    expect(setFgh.some(card => card instanceof KirliaCs5aC)).toBe(true);
    expect(setFgh.some(card => card instanceof KirliaCsv2C)).toBe(true);
    expect(setFgh.some(card => card instanceof Ralts)).toBe(true);
    expect(setFgh.some(card => card instanceof RaltsCs5aC)).toBe(true);
    expect(setFgh.some(card => card instanceof RaltsCs65C)).toBe(true);
    expect(setFgh.some(card => card instanceof Annihilape)).toBe(true);
    expect(setFgh.some(card => card instanceof BoBo)).toBe(true);
    expect(setFgh.some(card => card instanceof BoBoCsv4C)).toBe(true);
    expect(setFgh.some(card => card instanceof DaBiNiaoEx)).toBe(true);
    expect(setFgh.some(card => card instanceof DaBiNiaoV)).toBe(true);
    expect(setFgh.some(card => card instanceof DaWeiLi)).toBe(true);
    expect(setFgh.some(card => card instanceof DaWeiLiCs5aCRareSparkle)).toBe(true);
    expect(setFgh.some(card => card instanceof DaWeiLiCs5aC)).toBe(true);
    expect(setFgh.some(card => card instanceof DaWeiLiPromo3)).toBe(true);
    expect(setFgh.some(card => card instanceof DaWeiLiCszc)).toBe(true);
    expect(setFgh.some(card => card instanceof DaWeiLiCsve1C2)).toBe(true);
    expect(setFgh.some(card => card instanceof DaWeiLiCsve2pC2)).toBe(true);
    expect(setFgh.some(card => card instanceof DaWeiLiCs5bC)).toBe(true);
    expect(setFgh.some(card => card instanceof DaWeiLiCs5bCCommon)).toBe(true);
    expect(setFgh.some(card => card instanceof DaYaLi)).toBe(true);
    expect(setFgh.some(card => card instanceof DaYaLiCs5aC)).toBe(true);
    expect(setFgh.some(card => card instanceof Drifloon)).toBe(true);
    expect(setFgh.some(card => card instanceof HouJiaoWei)).toBe(true);
    expect(setFgh.some(card => card instanceof HouJiaoWeiG)).toBe(true);
    expect(setFgh.some(card => card instanceof GuangHuiJiaHeRenWa)).toBe(true);
    expect(setFgh.some(card => card instanceof GuangHuiPenHuoLong)).toBe(true);
    expect(setFgh.some(card => card instanceof GuiJiaoLuV)).toBe(true);
    expect(setFgh.some(card => card instanceof HongMingYueEx)).toBe(true);
    expect(setFgh.some(card => card instanceof HuoKongLong)).toBe(true);
    expect(setFgh.some(card => card instanceof IronHandsEx)).toBe(true);
    expect(setFgh.some(card => card instanceof RotomV)).toBe(true);
    expect(setFgh.some(card => card instanceof LumineonV)).toBe(true);
    expect(setFgh.some(card => card instanceof LuoJiYaV)).toBe(true);
    expect(setFgh.some(card => card instanceof LuoJiYaVSTAR)).toBe(true);
    expect(setFgh.some(card => card instanceof MiraidonEx)).toBe(true);
    expect(setFgh.some(card => card instanceof NuYingGeEx)).toBe(true);
    expect(setFgh.some(card => card instanceof PenHuoLongEx)).toBe(true);
    expect(setFgh.some(card => card instanceof YaoQuanEr)).toBe(true);
    expect(setFgh.some(card => card instanceof RaichuV)).toBe(true);
    expect(setFgh.some(card => card instanceof RaikouV)).toBe(true);
    expect(setFgh.some(card => card instanceof ZhenYiFa)).toBe(true);
    expect(setFgh.some(card => card instanceof ShiZuDaNiao)).toBe(true);
    expect(setFgh.some(card => card instanceof XiaoHuoLong)).toBe(true);
    expect(setFgh.some(card => card instanceof YueYueXiongHeYueEx)).toBe(true);
    expect(setFgh.some(card => card instanceof Zapdos)).toBe(true);
    expect(setFgh.some(card => card instanceof Manaphy)).toBe(true);
    expect(setFgh.some(card => card instanceof TaoDaiLangEx)).toBe(true);
    expect(setFgh.some(card => card instanceof RadiantAlakazam)).toBe(true);
  });

  it('keeps 大牙狸 logic groups separate while grouping same-logic printings together', () => {
    const daYaLiCards = setFgh.filter(card =>
      card.name === '大牙狸' && ['F', 'G', 'H'].includes((card.rawData as any)?.raw_card?.details?.regulationMarkText)
    );
    const groups = new Map<string, typeof daYaLiCards>();

    daYaLiCards.forEach(card => {
      const rawData = card.rawData as { variant_group_key?: string };
      const groupKey = rawData.variant_group_key || card.fullName;
      const group = groups.get(groupKey) || [];
      group.push(card);
      groups.set(groupKey, group);
    });

    expect(groups.size).toBe(2);

    const sixtyHpGroup = Array.from(groups.values()).find(group =>
      group.some(card => card.fullName === '大牙狸 111/128#9768')
    );
    const seventyHpGroup = Array.from(groups.values()).find(group =>
      group.some(card => card.fullName === '大牙狸 104/127#10039')
    );

    expect(sixtyHpGroup).toBeDefined();
    expect(sixtyHpGroup!.length).toBe(5);
    expect(seventyHpGroup).toBeDefined();
    expect(seventyHpGroup!.length).toBe(2);

    expect(
      new Set(sixtyHpGroup!.map(card => (card.rawData as { variant_group_key?: string }).variant_group_key)).size
    ).toBe(1);
    expect(
      new Set(seventyHpGroup!.map(card => (card.rawData as { variant_group_key?: string }).variant_group_key)).size
    ).toBe(1);
    expect(
      (sixtyHpGroup![0].rawData as { logic_group_key?: string }).logic_group_key
    ).not.toEqual((seventyHpGroup![0].rawData as { logic_group_key?: string }).logic_group_key);
  });

  it('keeps 大尾狸 logic groups separate while grouping same-logic printings together', () => {
    const daWeiLiCards = setFgh.filter(card => card.name === '大尾狸');
    const groups = new Map<string, typeof daWeiLiCards>();

    daWeiLiCards.forEach(card => {
      const rawData = card.rawData as { variant_group_key?: string };
      const groupKey = rawData.variant_group_key || card.fullName;
      const group = groups.get(groupKey) || [];
      group.push(card);
      groups.set(groupKey, group);
    });

    expect(daWeiLiCards.length).toBe(9);
    expect(groups.size).toBe(2);

    const diggingMawGroup = Array.from(groups.values()).find(group =>
      group.some(card => card.fullName === '大尾狸 130/127#9914')
    );
    const safeDamGroup = Array.from(groups.values()).find(group =>
      group.some(card => card.fullName === '大尾狸 112/128#9769')
    );

    expect(diggingMawGroup).toBeDefined();
    expect(diggingMawGroup!.length).toBe(7);
    expect(safeDamGroup).toBeDefined();
    expect(safeDamGroup!.length).toBe(2);

    expect(
      new Set(diggingMawGroup!.map(card => (card.rawData as { variant_group_key?: string }).variant_group_key)).size
    ).toBe(1);
    expect(
      new Set(safeDamGroup!.map(card => (card.rawData as { variant_group_key?: string }).variant_group_key)).size
    ).toBe(1);
    expect((diggingMawGroup![0].rawData as { logic_group_key?: string }).logic_group_key).not.toEqual(
      (safeDamGroup![0].rawData as { logic_group_key?: string }).logic_group_key
    );
  });

  it('uses the 70HP 大牙狸滚动 logic when the coin flip is heads', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new DaYaLiCs5aC();

    const { opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.COLORLESS, CardType.COLORLESS]);
    TestUtils.setDefending(sim, [new TestPokemon()]);

    sim.dispatch(new AttackAction(1, '滚动'));

    expect(opponent.active.damage).toBe(30);
  });

  it('keeps all current 拉鲁拉丝 and 奇鲁莉安 logic variants', () => {
    const raltsCards = setFgh.filter(card => card.name === '拉鲁拉丝');
    const kirliaCards = setFgh.filter(card => card.name === '奇鲁莉安');

    expect(raltsCards.map(card => card.fullName)).toEqual(jasmine.arrayContaining([
      '拉鲁拉丝 CSV2C',
      '拉鲁拉丝 CS5aC',
      '拉鲁拉丝 CS6.5C',
    ]));
    expect(kirliaCards.map(card => card.fullName)).toEqual(jasmine.arrayContaining([
      '奇鲁莉安 CS6.5C',
      '奇鲁莉安 CS5aC',
      '奇鲁莉安 CSV2C',
    ]));
  });

  it('groups 喷火龙ex, 光辉喷火龙, and 桃歹郎ex with runtime variant metadata', () => {
    const penHuoLongExCards = setFgh.filter(card => card.name === '喷火龙ex');
    const guangHuiPenHuoLongCards = setFgh.filter(card => card.name === '光辉喷火龙');
    const taoDaiLangExCards = setFgh.filter(card => card.name === '桃歹郎ex');

    expect(penHuoLongExCards.map(card => card.fullName)).toEqual([
      '喷火龙ex CSV5C 162/129#14819',
      '喷火龙ex CSV5C 155/129#14812',
      '喷火龙ex CSV5C 145/129#14802',
      '喷火龙ex CSV5C 075/129#14732',
    ]);
    expect(
      new Set(penHuoLongExCards.map(card => (card.rawData as { variant_group_key?: string }).variant_group_key)).size
    ).toBe(1);
    expect((penHuoLongExCards[0].rawData as { variant_group_size?: number }).variant_group_size).toBe(4);

    expect(guangHuiPenHuoLongCards.length).toBe(1);
    expect(
      (guangHuiPenHuoLongCards[0].rawData as { logic_group_key?: string }).logic_group_key
    ).toContain('光辉喷火龙');

    expect(taoDaiLangExCards.length).toBe(1);
    expect(
      (taoDaiLangExCards[0].rawData as { logic_group_key?: string }).logic_group_key
    ).toContain('桃歹郎ex');
  });

  it('keeps all 吼叫尾 logic variants registered', () => {
    const houJiaoWeiCards = setFgh.filter(card => card.name === '吼叫尾');

    expect(houJiaoWeiCards.map(card => card.fullName)).toEqual(jasmine.arrayContaining([
      '吼叫尾 107/204#16692',
      '吼叫尾 107/204#16519',
      '吼叫尾 107/204#16273',
      '吼叫尾 065/128#15924',
      '吼叫尾 065/128#15809',
      '吼叫尾 065/128#15652',
      '吼叫尾 104/052#16097',
      '吼叫尾 011/033#16908',
    ]));
  });

  it('keeps 波波 logic groups separated and defaults each logic to highest rarity face', () => {
    const boBoCards = setFgh.filter(card => card.name === '波波');
    const byLogic = new Map<string, typeof boBoCards>();

    boBoCards.forEach(card => {
      const logicGroupKey = (card.rawData as any)?.logic_group_key || card.fullName;
      const group = byLogic.get(logicGroupKey) || [];
      group.push(card);
      byLogic.set(logicGroupKey, group);
    });

    expect(byLogic.size).toBe(2);

    const birdCallGroup = Array.from(byLogic.values()).find(group =>
      group.some(card => card.attacks.some(attack => attack.name === '呼朋引伴'))
    );
    const gustGroup = Array.from(byLogic.values()).find(group =>
      group.some(card => card.attacks.some(attack => attack.name === '起风'))
    );

    expect(birdCallGroup).toBeDefined();
    expect(gustGroup).toBeDefined();
    expect(birdCallGroup!.map(card => card.fullName)).toEqual(jasmine.arrayContaining([
      '波波 151C4 153/151#11516',
      '波波 151C4 016/151#11700',
      '波波 151C4 016/151#11561',
      '波波 151C4 016/151#11379',
      '波波 CSVM1aC 008/033#16938',
    ]));
    expect(gustGroup!.map(card => card.fullName)).toEqual(jasmine.arrayContaining([
      '波波 CSV4C 136/129#14375',
      '波波 CSV4C 099/129#14606',
      '波波 CSV4C 099/129#14491',
      '波波 CSV4C 099/129#14338',
    ]));

    const firstBirdCall = boBoCards.find(card => card.attacks.some(attack => attack.name === '呼朋引伴'));
    const firstGust = boBoCards.find(card => card.attacks.some(attack => attack.name === '起风'));

    expect(firstBirdCall?.fullName).toBe('波波 151C4 153/151#11516');
    expect(firstGust?.fullName).toBe('波波 CSV4C 136/129#14375');
    expect((firstBirdCall?.rawData as any)?.variant_group_key).toBe('pokemon:波波:P016:G:hp50');
    expect((firstGust?.rawData as any)?.variant_group_key).toBe('pokemon:波波:P016:G:hp60');
  });
});

describe('DaWeiLiCs5bC set_fgh', () => {
  it('prevents opponent deck discard effects while 大尾狸 is on the Bench', () => {
    const sim = TestUtils.createTestSimulator();
    const daWeiLi = new DaWeiLiCs5bC();
    const topA = new TestCard();
    const topB = new TestCard();

    const { player, opponent, state } = TestUtils.getAll(sim);
    player.bench[0].pokemons.cards = [daWeiLi];
    player.deck.cards = [topA, topB];

    const topCards = player.deck.cards.slice(0, 2);
    const effect = new MoveDeckCardsToDiscardEffect(opponent, player, topCards, topCards);

    sim.store.reduceEffect(state, effect);

    expect(effect.preventDefault).toBe(true);
  });
});

describe('RotomV set_fgh', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('uses 快速充电', () => {
    const rotomV = new RotomV();
    const topA = new TestCard();
    const topB = new TestCard();
    const topC = new TestCard();

    const { player, state } = TestUtils.getAll(sim);
    player.bench[0].pokemons.cards = [rotomV];
    player.deck.cards = [topA, topB, topC];

    sim.dispatch(new UseAbilityAction(1, '快速充电', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.BENCH,
      index: 0,
    }));

    expect(player.hand.cards).toEqual([topA, topB, topC]);
    expect(state.activePlayer).toEqual(1);
  });

  it('adds damage with 废品短路 for each tool moved to the Lost Zone', () => {
    const rotomV = new RotomV();
    const toolA = new Eviolite();

    const { player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [rotomV], [CardType.LIGHTNING, CardType.LIGHTNING]);
    player.discard.cards = [toolA];
    sim.dispatch(new AttackAction(1, '废品短路'));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [toolA]));

    expect(opponent.active.damage).toEqual(80);
    expect(player.lostzone.cards).toContain(toolA);
  });
});

describe('LumineonV set_fgh', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('searches a Supporter with 夜光信号 when played to the Bench', () => {
    const lumineonV = new LumineonV();
    const leon = new Leon();
    const filler = new TestCard();

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [new TestPokemon()]);
    player.hand.cards = [lumineonV];
    player.deck.cards = [filler, leon];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 }));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [leon]));

    expect(player.bench[0].getPokemonCard()).toBe(lumineonV);
    expect(player.hand.cards).toContain(leon);
  });
});

describe('Manaphy set_fgh', () => {
  it('prevents bench damage from opponent attacks with 浪花水帘', () => {
    const sim = TestUtils.createTestSimulator();
    const manaphy = new Manaphy();
    const attacker = new TestPokemon();

    const { player, opponent, state } = TestUtils.getAll(sim);
    player.bench[0].pokemons.cards = [manaphy];
    player.bench[1].pokemons.cards = [new TestPokemon()];
    opponent.active.pokemons.cards = [attacker];

    const attackEffect = new AttackEffect(opponent, player, attacker.attacks[0]);
    const putDamageEffect = new PutDamageEffect(attackEffect, 30);
    putDamageEffect.target = player.bench[1];

    sim.store.reduceEffect(state, putDamageEffect);

    expect(player.bench[1].damage).toEqual(0);
  });
});

describe('RadiantAlakazam set_fgh', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('moves up to 2 damage counters with 伤痛汤匙', () => {
    const alakazam = new RadiantAlakazam();

    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [new TestPokemon()]);
    player.bench[0].pokemons.cards = [alakazam];
    opponent.active.damage = 20;
    opponent.bench[0].pokemons.cards = [new TestPokemon()];

    sim.dispatch(new UseAbilityAction(1, '伤痛汤匙', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.BENCH,
      index: 0,
    }));

    let prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.active]));

    prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.bench[0]]));

    const selectPrompt = TestUtils.getLastPrompt(sim) as SelectPrompt;
    sim.dispatch(new ResolvePromptAction(selectPrompt.id, 1));

    expect(opponent.active.damage).toEqual(0);
    expect(opponent.bench[0].damage).toEqual(20);
  });
});
