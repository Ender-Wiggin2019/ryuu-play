import {
  AttackAction,
  CardType,
  CheckAttackCostEffect,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  PlayerType,
  PlayPokemonEffect,
  PowerEffect,
  ResolvePromptAction,
  SlotType,
  SpecialCondition,
  Stage,
  SuperType,
  UseAbilityAction,
  PokemonCard,
  PowerType,
} from '@ptcg/common';

import { GuangHuiJiaHeRenWa } from '../../../src/standard/set_f/guang-hui-jia-he-ren-wa';
import { HouJiaoWei } from '../../../src/standard/set_f/hou-jiao-wei';
import { HouJiaoWeiG } from '../../../src/standard/set_f/hou-jiao-wei-g';
import { GuangHuiPenHuoLong } from '../../../src/standard/set_f/guang-hui-pen-huo-long';
import { HuoKongLong } from '../../../src/standard/set_f/huo-kong-long';
import { Kirlia } from '../../../src/standard/set_f/kirlia';
import { PenHuoLongEx } from '../../../src/standard/set_f/pen-huo-long-ex';
import { TaoDaiLangEx } from '../../../src/standard/set_f/tao-dai-lang-ex';
import { TanXiaoShi } from '../../../src/standard/set_f/tan-xiao-shi';
import { XiaoHuoLong } from '../../../src/standard/set_f/xiao-huo-long';
import { YaoQuanEr } from '../../../src/standard/set_f/yao-quan-er';
import { ZhenYiFa } from '../../../src/standard/set_f/zhen-yi-fa';
import { HongLianKaiQi } from '../../../src/standard/set_f/hong-lian-kai-qi';
import { TestCard } from '../../test-cards/test-card';
import { TestUtils } from '../../test-utils';

class DummyPokemon extends PokemonCard {
  public stage: Stage = Stage.BASIC;
  public cardTypes: CardType[] = [];
  public hp = 60;
  public weakness = [];
  public resistance = [];
  public retreat = [];
  public set = 'TEST';
  public name: string;
  public fullName: string;
  public evolvesFrom = '';
  public attacks = [];
  public powers = [];

  constructor(name: string, cardTypes: CardType[] = []) {
    super();
    this.name = name;
    this.fullName = `${name} TEST`;
    this.cardTypes = cardTypes;
  }
}

class DummyAbilityPokemon extends PokemonCard {
  public stage: Stage = Stage.BASIC;
  public cardTypes: CardType[] = [];
  public hp = 60;
  public weakness = [];
  public resistance = [];
  public retreat = [];
  public set = 'TEST';
  public name = '能力测试';
  public fullName = '能力测试 TEST';
  public evolvesFrom = '';
  public attacks = [];
  public powers = [
    {
      name: '测试特性',
      powerType: PowerType.ABILITY,
      text: '',
    },
  ];
}

function getCard<T>(card: T): T {
  return card;
}

describe('pokemon impl2 set_f', () => {
  it('lets 小火龙 discard the stadium in play', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new XiaoHuoLong();
    const stadium = new TestCard();
    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.FIRE]);
    player.stadium.cards = [stadium];

    sim.dispatch(new AttackAction(1, '烧光'));

    expect(player.stadium.cards).toHaveLength(0);
    expect(player.discard.cards).toContain(stadium);
  });

  it('deals self damage for 火恐龙高温冲撞', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new HuoKongLong();
    const target = new DummyPokemon('Target');
    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.FIRE, CardType.FIRE]);
    opponent.active.pokemons.cards = [target];

    sim.dispatch(new AttackAction(1, '高温冲撞'));

    expect(opponent.active.damage).toBe(70);
    expect(player.active.damage).toBe(20);
  });

  it('attaches up to 3 Fire Energy on evolution and scales 燃烧黑暗 with taken prizes', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new PenHuoLongEx();
    const target = new DummyPokemon('Target');
    const { player, opponent } = TestUtils.getAll(sim);
    player.active.pokemons.cards = [new DummyPokemon('火恐龙', [CardType.FIRE]), card];
    player.deck.cards = TestUtils.makeEnergies([CardType.FIRE, CardType.FIRE, CardType.FIRE]);
    opponent.active.pokemons.cards = [target];

    sim.store.reduceEffect(sim.store.state, new PlayPokemonEffect(player, card, player.active));
    const prompt = TestUtils.getLastPrompt(sim) as any;
    sim.dispatch(new ResolvePromptAction(prompt.id, [
      { card: player.deck.cards[0], to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 } },
      { card: player.deck.cards[1], to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 } },
      { card: player.deck.cards[2], to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 } },
    ]));

    expect(player.active.energies.cards.length).toBe(3);

    opponent.prizes[0].cards = [];
    opponent.prizes[1].cards = [];
    sim.dispatch(new AttackAction(1, '燃烧黑暗'));
    expect(opponent.active.damage).toBe(240);
  });

  it('reduces 光辉喷火龙 attack costs and locks 炎爆 next turn', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new GuangHuiPenHuoLong();
    const { player, state, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.FIRE]);
    opponent.prizes[0].cards = [];
    opponent.prizes[1].cards = [];
    opponent.prizes[2].cards = [];

    const costEffect = new CheckAttackCostEffect(player, card.attacks[0]);
    sim.store.reduceEffect(state, costEffect);
    expect(costEffect.cost.filter(c => c === CardType.COLORLESS).length).toBe(1);

    opponent.active.pokemons.cards = [new DummyPokemon('Defending')];
    sim.dispatch(new AttackAction(1, '炎爆'));
    state.turn = 2;
    expect(() => sim.dispatch(new AttackAction(1, '炎爆'))).toThrow();
  });

  it('lets 奇鲁莉安 use 精炼 once per turn', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new Kirlia();
    const discardCard = new TestCard();
    const drawA = new TestCard();
    const drawB = new TestCard();
    const { player } = TestUtils.getAll(sim);
    player.bench[0].pokemons.cards = [card];
    player.hand.cards = [discardCard];
    player.deck.cards = [drawA, drawB];

    sim.dispatch(new UseAbilityAction(1, '精炼', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.BENCH,
      index: 0,
    }));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [discardCard]));

    expect(player.discard.cards).toContain(discardCard);
    expect(player.hand.cards).toEqual(jasmine.arrayContaining([drawA, drawB]));
  });

  it('lets 光辉甲贺忍蛙 draw cards and damage 2 targets', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new GuangHuiJiaHeRenWa();
    const energy = TestUtils.makeEnergies([CardType.FIRE])[0];
    const targetA = new DummyPokemon('Target A');
    const targetB = new DummyPokemon('Target B');
    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.WATER, CardType.WATER, CardType.COLORLESS]);
    player.hand.cards = [energy];
    player.deck.cards = [new TestCard(), new TestCard()];
    opponent.active.pokemons.cards = [targetA];
    opponent.bench[0].pokemons.cards = [targetB];

    sim.dispatch(new UseAbilityAction(1, '隐藏牌', { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 }));
    expect(player.hand.cards.length).toBe(2);

    sim.dispatch(new AttackAction(1, '月光手里剑'));
    let prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [player.active.energies.cards[0], player.active.energies.cards[1]]));

    prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.active, opponent.bench[0]]));

    expect(opponent.active.damage).toBe(90);
    expect(opponent.bench[0].damage).toBe(90);
  });

  it('heals benched 古代 Pokemon with 吼叫尾', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new HouJiaoWei();
    const ancient = new DummyPokemon('Ancient', [CardType.DARK]);
    (ancient as any).rawData = {
      raw_card: { details: { specialCardLabel: '古代' } },
      api_card: { specialCardLabel: '古代' },
    };
    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.COLORLESS]);
    player.bench[0].pokemons.cards = [ancient];
    player.bench[0].damage = 120;

    sim.dispatch(new AttackAction(1, '歌唱激励'));
    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [player.bench[0]]));

    expect(player.bench[0].damage).toBe(20);
  });

  it('deals 30 damage with the G-version 吼叫尾 巴掌', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new HouJiaoWeiG();
    const target = new DummyPokemon('Active Target');
    const { opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.PSYCHIC]);
    opponent.active.pokemons.cards = [target];

    sim.dispatch(new AttackAction(1, '巴掌'));
    expect(opponent.active.damage).toBe(30);
  });

  it('prompts for a target with 吼叫尾 G 凶暴吼叫', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new HouJiaoWeiG();
    const target = new DummyPokemon('Bench Target');
    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.PSYCHIC, CardType.PSYCHIC]);
    opponent.bench[0].pokemons.cards = [target];
    opponent.bench[0].damage = 50;

    sim.dispatch(new AttackAction(1, '凶暴吼叫'));
    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(prompt).toBeTruthy();
    expect(() => sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.bench[0]]))).not.toThrow();
    expect(player.active.damage).toBe(0);
  });

  it('can target opponent active with 吼叫尾 G 凶暴吼叫 when bench is empty', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new HouJiaoWeiG();
    const target = new DummyPokemon('Active Target');
    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.PSYCHIC, CardType.PSYCHIC]);
    player.active.damage = 20;
    opponent.active.pokemons.cards = [target];

    sim.dispatch(new AttackAction(1, '凶暴吼叫'));
    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(prompt).toBeTruthy();
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.active]));

    expect(opponent.active.damage).toBe(40);
  });

  it('switches a benched Dark Pokémon and poisons it with 桃歹郎ex', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new TaoDaiLangEx();
    const dark = new DummyPokemon('Dark Bench', [CardType.DARK]);
    const other = new DummyPokemon('Other Bench', [CardType.GRASS]);
    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.DARK, CardType.DARK]);
    player.bench[0].pokemons.cards = [dark];
    player.bench[1].pokemons.cards = [other];

    sim.dispatch(new UseAbilityAction(1, '支配锁链', { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 }));
    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [player.bench[0]]));

    expect(player.active.getPokemonCard()).toBe(dark);
    expect(player.active.specialConditions).toContain(SpecialCondition.POISONED);
  });

  it('discards one energy from 炭小侍喷射火焰', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new TanXiaoShi();
    const target = new DummyPokemon('Target');
    const fireEnergy = TestUtils.makeEnergies([CardType.FIRE])[0];
    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.FIRE, CardType.FIRE, CardType.COLORLESS]);
    player.active.energies.cards = [fireEnergy];
    opponent.active.pokemons.cards = [target];

    sim.dispatch(new AttackAction(1, '喷射火焰'));
    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [fireEnergy]));

    expect(player.active.energies.cards).toHaveLength(0);
    expect(opponent.active.damage).toBe(70);
  });

  it('locks opponent active abilities while 振翼发 is active', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new ZhenYiFa();
    const opponentActive = new DummyAbilityPokemon();
    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS]);
    opponent.active.pokemons.cards = [opponentActive];

    expect(() => {
      sim.dispatch(new UseAbilityAction(2, '测试特性', { player: PlayerType.TOP_PLAYER, slot: SlotType.ACTIVE, index: 0 }));
    }).toThrow();
  });

  it('drops one bench target for 红莲铠骑 and discards all Fire Energy', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new HongLianKaiQi();
    const target = new DummyPokemon('Bench Target');
    const fireA = TestUtils.makeEnergies([CardType.FIRE])[0];
    const fireB = TestUtils.makeEnergies([CardType.FIRE])[0];
    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.FIRE, CardType.FIRE, CardType.COLORLESS]);
    player.active.energies.cards = [fireA, fireB];
    opponent.bench[0].pokemons.cards = [target];

    sim.dispatch(new AttackAction(1, '红莲引爆'));
    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.bench[0]]));

    expect(opponent.bench[0].damage).toBe(180);
    expect(player.active.energies.cards).toHaveLength(0);
    expect(player.discard.cards).toEqual(expect.arrayContaining([fireA, fireB]));
  });
});
