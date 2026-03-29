import {
  AttackEffect,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  CheckAttackCostEffect,
  CheckRetreatCostEffect,
  DealDamageEffect,
  MoveDeckCardsToDiscardEffect,
  PlayCardAction,
  PlayerType,
  ResolvePromptAction,
  SlotType,
  Stage,
  TrainerCard,
  UseTrainerInPlayAction,
} from '@ptcg/common';

import { setF } from '../../../src/standard/set_f';
import { DragapultEx } from '../../../src/standard/set_h/dragapult-ex';
import { OriginFormePalkiaVSTAR } from '../../../src/standard/set-sword-and-shield/origin-forme-palkia-vstar';
import { TestCard } from '../../test-cards/test-card';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';
import { RotomV } from '../../../src/standard/set_f/rotom-v';

function getCard(name: string) {
  const card = setF.find(c => c.name === name);
  expect(card).toBeDefined();
  return card!;
}

describe('drag deck trainer overrides', () => {
  it('replaces key drag deck trainers with real implementations', () => {
    const names = [
      '宝可梦交替', '神奇糖果', '高级球', '奇树', '派帕', '大地容器',
      '夜间担架', '神奥神殿', '老大的指令', '巢穴球', '反击捕捉器',
      '放逐吸尘器', '杜娟', '梅洛可', '森林封印石', '洗翠的沉重球', '璀璨结晶',
      '宝可梦捕捉器', '超级球', '裁判', '博士的研究', '能量回收', '能量输送',
      '能量转移', '粉碎之锤', '暗黑补丁', '伤药', '厉害钓竿', '超级能量回收',
      '活力头带', '勇气护符', '学习装置', '朋友手册', '加油牛奶', '能量贴纸',
      '电气发生器', '高级香氛', '健行鞋', '甜蜜球', '不服输头带', '讲究腰带',
      '妮莫', '阿驯', '米莫莎', '幸运头盔', '不服输背心', '安全护目镜',
      '大师球', '黑暗球', '飞羽球',
      '呐喊队的应援', '玛俐的骄傲', '竹兰的霸气', '珠贝', '晓白', '火夏', '贝里菈', '阿芒', '刚石', '工人',
      '能量签', '美味之水套装', '坚毅铁镐', '甜甜蜜', '工具箱', '宝可装置3.0', '鼓励信', '胜利之印', '野餐篮', '送货无人机',
      '锅型头盔', '岩石胸甲', '吃剩的东西', '坚硬束带', '大气球', '睿智湖', '灾祸荒野', '海滩场地', '练习室', '全金属实验室'
      , '星月', '马加木', '千金小姐', '神奥的伙伴', '洗翠的伙伴', '阿渡', '吉尼亚', '克拉韦尔', '阿速', '野餐女孩'
      , '滨名的后援', '小菘', '正辉的传输', '牡丹', '瓢太', '莉普', '探险家的向导', '白露的真心', '西餐厨师', '枇琶'
      , '长袖和服少女', '营火专家', '拉苯博士', '亚玄', '查克洛', '黑连的关照', '神代', '米可利', '挖洞兄弟', '短裤小子'
      , '莎莉娜', '菜种的活力', '坂木的领导力', '莉佳的邀请', '凰檗', '秋明', '古鲁夏', '寇沙', '青木', '聂凯'
      , '野贼三姐妹', '阿枫', '天星队手下', '皮拿', '奥尔迪加', '辛俐', '奈奈美的协助', '阳伞姐姐', '蕾荷', '波琵'
      , '悟松', '暗码迷的解读', '望罗', '梅丽莎', '叶隐披风', '巡逻帽'
      , '崩塌的竞技场', '阻碍之塔', '中立中心'
    ];

    for (const name of names) {
      const card = getCard(name);
      expect(card.constructor.name).not.toBe('GeneratedTrainerCard');
    }
  });
});

describe('override normalization set_f', () => {
  it('replaces full-art rare candy variants with zero-width characters in their names', () => {
    const rareCandy = setF.find(card => card.fullName === '‌神奇糖果 231/SV-P#17368');
    expect(rareCandy).toBeDefined();
    expect(rareCandy!.constructor.name).toBe('RareCandy');
    expect(rareCandy!.name).toBe('神奇糖果');
  });
});

describe('Nest Ball set_f', () => {
  it('puts a Basic Pokemon from deck onto the Bench', () => {
    const sim = TestUtils.createTestSimulator();
    const nestBall = getCard('巢穴球');
    const basic = new TestPokemon();
    const player = TestUtils.getAll(sim).player;
    player.hand.cards = [nestBall];
    player.deck.cards = [basic];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [basic]));

    expect(player.bench[0].getPokemonCard()).toEqual(basic);
  });

  it('is discarded when the search is cancelled', () => {
    const sim = TestUtils.createTestSimulator();
    const nestBall = getCard('巢穴球');
    const basic = new TestPokemon();
    const player = TestUtils.getAll(sim).player;
    player.hand.cards = [nestBall];
    player.deck.cards = [basic];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, []));

    expect(player.hand.cards).not.toContain(nestBall);
    expect(player.discard.cards).toContain(nestBall);
  });
});

describe('JiNiYa set_f', () => {
  it('goes to the supporter zone even when the search is cancelled', () => {
    const sim = TestUtils.createTestSimulator();
    const jiNiYa = getCard('吉尼亚');
    const stage1 = new TestPokemon();
    stage1.stage = Stage.STAGE_1;
    const player = TestUtils.getAll(sim).player;
    player.hand.cards = [jiNiYa];
    player.deck.cards = [stage1];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, []));

    expect(player.hand.cards).not.toContain(jiNiYa);
    expect(player.supporter.cards).toContain(jiNiYa);
  });
});

describe('Energy Search set_f', () => {
  it('searches a basic energy card from deck to hand', () => {
    const sim = TestUtils.createTestSimulator();
    const energySearch = getCard('能量输送');
    const energy = TestUtils.makeEnergies([CardType.LIGHTNING])[0];
    const player = TestUtils.getAll(sim).player;
    player.hand.cards = [energySearch];
    player.deck.cards = [energy];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [energy]));

    expect(player.hand.cards).toContain(energy);
  });
});

describe('Qian Jin Xiao Jie set_f', () => {
  it('searches up to four basic Energy cards into hand', () => {
    const sim = TestUtils.createTestSimulator();
    const qianJinXiaoJie = getCard('千金小姐');
    const energies = TestUtils.makeEnergies([
      CardType.GRASS,
      CardType.FIRE,
      CardType.WATER,
      CardType.LIGHTNING
    ]);
    const player = TestUtils.getAll(sim).player;
    player.hand.cards = [qianJinXiaoJie];
    player.deck.cards = [...energies];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, energies));

    for (const energy of energies) {
      expect(player.hand.cards).toContain(energy);
    }
  });
});

describe('Shen Ao De Huo Ban set_f', () => {
  it('draws three cards', () => {
    const sim = TestUtils.createTestSimulator();
    const supporter = getCard('神奥的伙伴');
    const cards = [new TestCard(), new TestCard(), new TestCard()];
    const player = TestUtils.getAll(sim).player;
    player.hand.cards = [supporter];
    player.deck.cards = cards;

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));

    expect(player.hand.cards).toEqual(jasmine.arrayContaining(cards));
  });
});

describe('Pal Pad set_f', () => {
  it('shuffles up to two supporter cards from discard into the deck', () => {
    const sim = TestUtils.createTestSimulator();
    const palPad = getCard('朋友手册');
    const iono = getCard('奇树');
    const research = getCard('博士的研究');
    const player = TestUtils.getAll(sim).player;
    player.hand.cards = [palPad];
    player.discard.cards = [iono, research];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [iono, research]));
    const revealPrompt = TestUtils.getLastPrompt(sim) as any;
    sim.dispatch(new ResolvePromptAction(revealPrompt.id, null));

    expect(player.deck.cards).toContain(iono);
    expect(player.deck.cards).toContain(research);
  });
});

describe('Moo Moo Milk set_f', () => {
  it('heals 60 when the player is behind on prizes', () => {
    const sim = TestUtils.createTestSimulator();
    const milk = getCard('加油牛奶');
    const { player, opponent } = TestUtils.getAll(sim);
    player.hand.cards = [milk];
    player.active.damage = 80;
    opponent.prizes[0].cards = [];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [player.active]));

    expect(player.active.damage).toBe(20);
  });
});

describe('Hisuian Heavy Ball set_f', () => {
  it('swaps itself with a Basic Pokemon from prizes', () => {
    const sim = TestUtils.createTestSimulator();
    const heavyBall = getCard('洗翠的沉重球');
    const basic = new TestPokemon();
    basic.stage = Stage.BASIC;
    const player = TestUtils.getAll(sim).player;
    player.hand.cards = [heavyBall];
    player.prizes[0].cards = [basic];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [basic]));
    const revealPrompt = TestUtils.getLastPrompt(sim) as any;
    sim.dispatch(new ResolvePromptAction(revealPrompt.id, null));

    expect(player.hand.cards).toContain(basic);
    expect(player.prizes[0].cards).toContain(heavyBall);
  });
});

describe('WangLuo set_f', () => {
  it('discards a benched Pokemon V together with attached cards', () => {
    const sim = TestUtils.createTestSimulator();
    const supporter = getCard('望罗');
    const benchedPokemon = new RotomV();
    const attachedEnergy = TestUtils.makeEnergies([CardType.LIGHTNING])[0];
    const { player } = TestUtils.getAll(sim);
    player.hand.cards = [supporter];
    player.bench[0].pokemons.cards = [benchedPokemon];
    player.bench[0].energies.cards = [attachedEnergy];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [player.bench[0]]));

    expect(player.bench[0].pokemons.cards.length).toBe(0);
    expect(player.discard.cards).toContain(benchedPokemon);
    expect(player.discard.cards).toContain(attachedEnergy);
  });

  it('targets the top player bench correctly when the top player uses it', () => {
    const sim = TestUtils.createTestSimulator();
    const supporter = getCard('望罗');
    const benchedPokemon = new RotomV();
    const attachedEnergy = TestUtils.makeEnergies([CardType.LIGHTNING])[0];
    const { opponent } = TestUtils.getAll(sim);
    sim.store.state.activePlayer = 1;
    sim.store.state.turn = 2;
    opponent.hand.cards = [supporter];
    opponent.bench[0].pokemons.cards = [benchedPokemon];
    opponent.bench[0].energies.cards = [attachedEnergy];

    sim.dispatch(new PlayCardAction(2, 0, { player: PlayerType.TOP_PLAYER, slot: SlotType.HAND, index: 0 }));

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.bench[0]]));

    expect(opponent.bench[0].pokemons.cards.length).toBe(0);
    expect(opponent.discard.cards).toContain(benchedPokemon);
    expect(opponent.discard.cards).toContain(attachedEnergy);
  });
});

describe('Counter Catcher set_f', () => {
  it('switches opponent bench when player is behind on prizes', () => {
    const sim = TestUtils.createTestSimulator();
    const catcher = getCard('反击捕捉器');
    const { player, opponent } = TestUtils.getAll(sim);
    player.hand.cards = [catcher];
    opponent.prizes[0].cards = [];
    opponent.bench[0].pokemons.cards = [new TestPokemon()];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.bench[0]]));

    expect(opponent.active.pokemons.cards.length).toBe(1);
    expect(opponent.bench[0].pokemons.cards.length).toBe(1);
  });
});

describe('Sparkling Crystal set_f', () => {
  it('reduces the attack cost of the attached Tera Pokemon by one energy of any type', () => {
    const crystal = getCard('璀璨结晶') as TrainerCard;
    const sim = TestUtils.createTestSimulator();
    const { player, state } = TestUtils.getAll(sim);
    const teraPokemon = new DragapultEx();

    player.active.pokemons.cards = [teraPokemon];
    player.active.trainers.cards = [crystal];
    const effect = new CheckAttackCostEffect(player, teraPokemon.attacks[1]);

    sim.store.reduceEffect(state, effect);

    expect(teraPokemon.tags).toContain(CardTag.TERA);
    expect(effect.cost.length).toBe(1);
  });
});

describe('Lost Vacuum set_f', () => {
  it('banishes a hand card and a stadium in play', () => {
    const sim = TestUtils.createTestSimulator();
    const vacuum = getCard('放逐吸尘器');
    const temple = getCard('神奥神殿') as TrainerCard;
    const filler = new TestCard();
    const { player, opponent } = TestUtils.getAll(sim);
    player.hand.cards = [vacuum, filler];
    opponent.stadium.cards = [temple];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));

    let prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [filler]));

    expect(player.lostzone.cards).toContain(filler);
    expect(opponent.lostzone.cards).toContain(temple);
  });
});

describe('YeYinPiFeng set_f', () => {
  it('blocks Boss-style supporter effects from targeting the attached VSTAR Pokemon', () => {
    const sim = TestUtils.createTestSimulator();
    const boss = getCard('老大的指令');
    const poncho = getCard('叶隐披风') as TrainerCard;
    const protectedPokemon = new OriginFormePalkiaVSTAR();
    const otherBenchedPokemon = new TestPokemon();
    const { player, opponent } = TestUtils.getAll(sim);

    player.hand.cards = [boss];
    opponent.bench[0].pokemons.cards = [protectedPokemon];
    opponent.bench[0].trainers.cards = [poncho];
    opponent.bench[1].pokemons.cards = [otherBenchedPokemon];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(prompt.options.blocked).toContain(
      { player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index: 0 }
    );
    expect(prompt.options.blocked).not.toContain(
      { player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index: 1 }
    );
    expect(() => sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.bench[0]]))).toThrow();
    expect(() => sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.bench[1]]))).not.toThrow();
    expect(opponent.active.getPokemonCard()).toBe(otherBenchedPokemon);
  });
});

describe('XunLuoMao set_f', () => {
  it('prevents opponent effects from moving cards from your deck to the discard pile while attached Active', () => {
    const sim = TestUtils.createTestSimulator();
    const patrolCap = getCard('巡逻帽') as TrainerCard;
    const itemA = getCard('精灵球');
    const itemB = getCard('高级球');
    const filler = new TestCard();
    const { player, opponent } = TestUtils.getAll(sim);

    player.active.trainers.cards = [patrolCap];
    player.deck.cards = [itemA, itemB, filler];
    const effect = new MoveDeckCardsToDiscardEffect(opponent, player, player.deck, [itemA, itemB]);
    sim.store.reduceEffect(sim.store.state, effect);

    expect(effect.preventDefault).toBe(true);
    expect(player.discard.cards).not.toContain(itemA);
    expect(player.discard.cards).not.toContain(itemB);
    expect(player.deck.cards.length).toBe(3);
  });
});

describe('Energy Sign set_f', () => {
  it('looks at top seven cards and puts one Energy into hand', () => {
    const sim = TestUtils.createTestSimulator();
    const energySign = getCard('能量签');
    const energy = TestUtils.makeEnergies([CardType.WATER])[0];
    const filler = new TestCard();
    const player = TestUtils.getAll(sim).player;
    player.hand.cards = [energySign];
    player.deck.cards = [filler, energy];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [energy]));

    expect(player.hand.cards).toContain(energy);
  });
});

describe('Beach Court set_f', () => {
  it('reduces retreat cost of the active Basic Pokemon by one', () => {
    const sim = TestUtils.createTestSimulator();
    const beachCourt = getCard('海滩场地') as TrainerCard;
    const basic = new TestPokemon();
    (basic as { retreat: CardType[] }).retreat = [CardType.COLORLESS];
    const { player, state } = TestUtils.getAll(sim);
    player.active.pokemons.cards = [basic];
    player.stadium.cards = [beachCourt];

    const effect = new CheckRetreatCostEffect(player);
    sim.store.reduceEffect(state, effect);

    expect(effect.cost).toEqual([]);
  });
});

describe('Rocky Helmet set_f', () => {
  it('reduces damage by 30 for attached non-rule Pokemon', () => {
    const sim = TestUtils.createTestSimulator();
    const rockyHelmet = getCard('锅型头盔') as TrainerCard;
    const attacker = new TestPokemon();
    const defender = new TestPokemon();
    const { player, opponent, state } = TestUtils.getAll(sim);
    player.active.pokemons.cards = [defender];
    player.active.trainers.cards = [rockyHelmet];
    opponent.active.pokemons.cards = [attacker];

    const attackEffect = new AttackEffect(opponent, player, attacker.attacks[0]);
    const dealDamageEffect = new DealDamageEffect(attackEffect, 100);

    sim.store.reduceEffect(state, dealDamageEffect);

    expect(dealDamageEffect.damage).toBe(70);
  });
});

describe('Forest Seal Stone set_f', () => {
  it('searches any card once while attached to a Pokemon V', () => {
    const sim = TestUtils.createTestSimulator();
    const stone = getCard('森林封印石') as TrainerCard;
    const target = new TestCard();
    const { player } = TestUtils.getAll(sim);
    const rotom = new RotomV();
    TestUtils.setActive(sim, [rotom], [CardType.LIGHTNING]);
    player.active.trainers.cards = [stone];
    player.deck.cards = [target];

    sim.dispatch(new UseTrainerInPlayAction(1, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 }, '森林封印石'));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [target]));

    expect(player.hand.cards).toContain(target);
  });
});
