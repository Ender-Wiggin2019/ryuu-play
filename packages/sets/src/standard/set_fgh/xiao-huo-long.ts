import {
  AttackEffect,
  Card,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameMessage,
  PokemonCard,
  ShuffleDeckPrompt,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

type PokemonVariantCollection = {
  id: number;
  commodityCode: string;
  name: string;
};

type PokemonVariantSeed = {
  id: number;
  collection: PokemonVariantCollection;
  collectionNumber: string;
  rarityLabel: string;
  logicGroupKey: string;
  illustratorNames?: string[];
};

type PokemonVariantRawData = {
  raw_card: {
    id: number;
    name: string;
    commodityCode?: string;
    yorenCode?: string;
    cardType?: string;
    details: {
      collectionNumber: string;
      rarityLabel: string;
    } & Record<string, unknown>;
    image: string;
    ruleLines: unknown[];
    attacks: unknown[];
    features: unknown[];
    illustratorNames?: string[];
  } & Record<string, unknown>;
  collection: PokemonVariantCollection;
  image_url: string;
  logic_group_key?: string;
  variant_group_key?: string;
};

type SeededPokemonCard = PokemonCard & {
  rawData: PokemonVariantRawData;
  name: string;
  fullName: string;
};

const BURN_STADIUM_LOGIC_GROUP_KEY = 'pokemon:xiao-huo-long:burn-stadium';
const BURNING_TAIL_LOGIC_GROUP_KEY = 'pokemon:xiao-huo-long:burning-tail';
const HIGH_TEMP_LOGIC_GROUP_KEY = 'pokemon:xiao-huo-long:high-temp';

function seedPokemonVariant<T extends SeededPokemonCard>(instance: T, seed: PokemonVariantSeed): T {
  instance.rawData = {
    ...instance.rawData,
    logic_group_key: seed.logicGroupKey,
    variant_group_key: seed.logicGroupKey,
    raw_card: {
      ...instance.rawData.raw_card,
      id: seed.id,
      commodityCode: seed.collection.commodityCode,
      image: `/api/v1/cards/${seed.id}/image`,
      details: {
        ...instance.rawData.raw_card.details,
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
      },
      ...(seed.illustratorNames ? { illustratorNames: seed.illustratorNames } : {}),
    },
    collection: seed.collection,
    image_url: `http://localhost:3000/api/v1/cards/${seed.id}/image`,
  };

  instance.fullName = `${instance.name} ${seed.collectionNumber}#${seed.id}`;
  return instance;
}

function seedPokemonVariants<T extends SeededPokemonCard>(factory: () => T, seeds: PokemonVariantSeed[]): T[] {
  return seeds.map(seed => seedPokemonVariant(factory(), seed));
}

function* useBurningTail(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  const validFireEnergy = player.deck.cards.filter(card =>
    card.superType === SuperType.ENERGY &&
    card instanceof EnergyCard &&
    card.energyType === EnergyType.BASIC &&
    card.provides.includes(CardType.FIRE)
  );

  if (validFireEnergy.length === 0) {
    return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
      player.deck.applyOrder(order);
      next();
    });
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_ATTACH,
      player.deck,
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.FIRE] },
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length > 0) {
    player.deck.moveCardsTo(selected, player.active.energies);
  }

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
    next();
  });
}

export class XiaoHuoLong extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 11515,
      name: '小火龙',
      yorenCode: 'P004',
      cardType: '1',
      commodityCode: '151C4',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '152/151',
        rarityLabel: 'S',
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 70,
        evolveText: '基础',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: '/api/v1/cards/11515/image',
      ruleLines: [],
      attacks: [
        {
          id: 4923,
          name: '烧光',
          text: '将场上的竞技场放于弃牌区。',
          cost: ['火'],
          damage: null,
        },
        {
          id: 4924,
          name: '吐火',
          text: '',
          cost: ['火', '火'],
          damage: '30',
        },
      ],
      features: [],
      illustratorNames: ['sowsow'],
      pokemonCategory: '蜥蜴宝可梦',
      pokedexCode: '0004',
      pokedexText: '生下来的时候，尾巴上就有火焰在燃烧。火焰熄灭时，它的生命也会结束。',
      height: 0.6,
      weight: 8.5,
      deckRuleLimit: null,
    },
    collection: {
      id: 280,
      commodityCode: '151C4',
      name: '收集啦151 聚',
    },
    image_url: 'http://localhost:3000/api/v1/cards/11515/image',
    logic_group_key: BURN_STADIUM_LOGIC_GROUP_KEY,
    variant_group_key: BURN_STADIUM_LOGIC_GROUP_KEY,
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 70;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '烧光',
      cost: [CardType.FIRE],
      damage: '',
      text: '将场上的竞技场放于弃牌区。',
    },
    {
      name: '吐火',
      cost: [CardType.FIRE, CardType.FIRE],
      damage: '30',
      text: '',
    },
  ];

  public set: string = 'set_g';

  public name: string = '小火龙';

  public fullName: string = '小火龙 152/151#11515';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const stadiumCard = StateUtils.getStadiumCard(state);
      if (stadiumCard === undefined) {
        return state;
      }

      const owner = StateUtils.findOwner(state, StateUtils.findCardList(state, stadiumCard));
      owner.stadium.moveCardTo(stadiumCard, owner.discard);
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.damage = 30;
      return state;
    }

    return state;
  }
}

export class XiaoHuoLongCs5aC extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 9961,
      name: '小火龙',
      yorenCode: 'P004',
      cardType: '1',
      commodityCode: 'CS5aC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '001/127',
        rarityLabel: 'C☆★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 60,
        evolveText: '基础',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: '/api/v1/cards/9961/image',
      ruleLines: [],
      attacks: [
        {
          id: 9540,
          name: '燃烧之尾',
          text: '选择自己牌库中的1张【火】能量，附着于这只宝可梦身上。并重洗牌库。',
          cost: ['火'],
          damage: '10',
        },
      ],
      features: [],
      illustratorNames: ['Naoki Saito'],
      pokemonCategory: '蜥蜴宝可梦',
      pokedexCode: '004',
      pokedexText: '天生喜欢热热的东西。据说当它被雨淋湿的时候，尾巴的末端会冒出烟来。',
      height: 0.6,
      weight: 8.5,
      deckRuleLimit: null,
    },
    collection: {
      id: 183,
      commodityCode: 'CS5aC',
      name: '补充包 勇魅群星 魅',
    },
    image_url: 'http://localhost:3000/api/v1/cards/9961/image',
    logic_group_key: BURNING_TAIL_LOGIC_GROUP_KEY,
    variant_group_key: BURNING_TAIL_LOGIC_GROUP_KEY,
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 60;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '燃烧之尾',
      cost: [CardType.FIRE],
      damage: '10',
      text: '选择自己牌库中的1张【火】能量，附着于这只宝可梦身上。并重洗牌库。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '小火龙';

  public fullName: string = '小火龙 001/127#9961';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useBurningTail(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}

export class XiaoHuoLongCsv5C extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 14948,
      name: '小火龙',
      yorenCode: 'P004',
      cardType: '1',
      commodityCode: 'CSV5C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '014/129',
        rarityLabel: 'C★★★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 60,
        evolveText: '基础',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: '/api/v1/cards/14948/image',
      ruleLines: [],
      attacks: [
        {
          id: 3831,
          name: '高温冲撞',
          text: '给这只宝可梦也造成10伤害。',
          cost: ['火'],
          damage: '30',
        },
      ],
      features: [],
      illustratorNames: ['DOM'],
      pokemonCategory: '蜥蜴宝可梦',
      pokedexCode: '0004',
      pokedexText: '生下来的时候，尾巴上就有火焰在燃烧。火焰熄灭时，它的生命也会结束。',
      height: 0.6,
      weight: 8.5,
      deckRuleLimit: null,
    },
    collection: {
      id: 298,
      commodityCode: 'CSV5C',
      name: '补充包 黑晶炽诚',
    },
    image_url: 'http://localhost:3000/api/v1/cards/14948/image',
    logic_group_key: HIGH_TEMP_LOGIC_GROUP_KEY,
    variant_group_key: HIGH_TEMP_LOGIC_GROUP_KEY,
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 60;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '高温冲撞',
      cost: [CardType.FIRE],
      damage: '30',
      text: '给这只宝可梦也造成10伤害。',
    },
  ];

  public set: string = 'set_g';

  public name: string = '小火龙';

  public fullName: string = '小火龙 014/129#14948';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 30;
      effect.player.active.damage += 10;
    }

    return state;
  }
}

const burnStadiumVariants = seedPokemonVariants(() => new XiaoHuoLong(), [
  {
    id: 11367,
    collection: { id: 280, commodityCode: '151C4', name: '收集啦151 聚' },
    collectionNumber: '004/151',
    rarityLabel: 'C',
    logicGroupKey: BURN_STADIUM_LOGIC_GROUP_KEY,
    illustratorNames: ['GIDORA'],
  },
  {
    id: 14017,
    collection: { id: 275, commodityCode: 'CSVL1C', name: '启程专题包' },
    collectionNumber: '090/049',
    rarityLabel: '无标记',
    logicGroupKey: BURN_STADIUM_LOGIC_GROUP_KEY,
    illustratorNames: ['miki kudo'],
  },
  {
    id: 12509,
    collection: { id: 258, commodityCode: 'CSVE1C2', name: '对战派对 共梦 下' },
    collectionNumber: '012/177',
    rarityLabel: '无标记',
    logicGroupKey: BURN_STADIUM_LOGIC_GROUP_KEY,
    illustratorNames: ['GIDORA'],
  },
  {
    id: 11690,
    collection: { id: 280, commodityCode: '151C4', name: '收集啦151 聚' },
    collectionNumber: '004/151',
    rarityLabel: 'C★★★',
    logicGroupKey: BURN_STADIUM_LOGIC_GROUP_KEY,
    illustratorNames: ['GIDORA'],
  },
  {
    id: 11551,
    collection: { id: 280, commodityCode: '151C4', name: '收集啦151 聚' },
    collectionNumber: '004/151',
    rarityLabel: 'C☆★',
    logicGroupKey: BURN_STADIUM_LOGIC_GROUP_KEY,
    illustratorNames: ['GIDORA'],
  },
  {
    id: 16931,
    collection: { id: 330, commodityCode: 'CSVM1aC', name: '大师战略卡组构筑套装 喷火龙ex' },
    collectionNumber: '001/033',
    rarityLabel: '无标记',
    logicGroupKey: BURN_STADIUM_LOGIC_GROUP_KEY,
    illustratorNames: ['GIDORA'],
  },
]);

const burningTailVariants = seedPokemonVariants(() => new XiaoHuoLongCs5aC(), [
  {
    id: 9785,
    collection: { id: 183, commodityCode: 'CS5aC', name: '补充包 勇魅群星 魅' },
    collectionNumber: '001/127',
    rarityLabel: 'C',
    logicGroupKey: BURNING_TAIL_LOGIC_GROUP_KEY,
    illustratorNames: ['Naoki Saito'],
  },
]);

const highTempVariants = seedPokemonVariants(() => new XiaoHuoLongCsv5C(), [
  {
    id: 14833,
    collection: { id: 298, commodityCode: 'CSV5C', name: '补充包 黑晶炽诚' },
    collectionNumber: '014/129',
    rarityLabel: 'C☆★',
    logicGroupKey: HIGH_TEMP_LOGIC_GROUP_KEY,
    illustratorNames: ['DOM'],
  },
  {
    id: 14671,
    collection: { id: 298, commodityCode: 'CSV5C', name: '补充包 黑晶炽诚' },
    collectionNumber: '014/129',
    rarityLabel: 'C',
    logicGroupKey: HIGH_TEMP_LOGIC_GROUP_KEY,
    illustratorNames: ['DOM'],
  },
  {
    id: 15463,
    collection: { id: 305, commodityCode: 'PROMOSV151m2', name: '收集啦151 最初的伙伴精品礼盒 小火龙' },
    collectionNumber: '098/SV-P',
    rarityLabel: '无标记',
    logicGroupKey: HIGH_TEMP_LOGIC_GROUP_KEY,
    illustratorNames: ['MINAMINAMI Take'],
  },
]);

export const xiaoHuoLongCards: Card[] = [
  new XiaoHuoLong(),
  ...burnStadiumVariants,
  new XiaoHuoLongCs5aC(),
  ...burningTailVariants,
  new XiaoHuoLongCsv5C(),
  ...highTempVariants,
];
