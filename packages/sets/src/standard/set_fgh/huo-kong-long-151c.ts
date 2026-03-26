import {
  AttackEffect,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StoreLike,
  SuperType,
} from '@ptcg/common';

import {
  seedHuoKongLongVariants,
} from './huo-kong-long-variant';

export const HUO_KONG_LONG_151C_LOGIC_GROUP_KEY = 'pokemon:火恐龙:P005:G:hp100:烈焰20+大字爆炎90';
export const HUO_KONG_LONG_151C_VARIANT_GROUP_KEY = 'pokemon:火恐龙:P005:G:hp100:烈焰20+大字爆炎90';

function* discardFireEnergy(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  const fireEnergies = player.active.energies.cards.filter(card =>
    card instanceof EnergyCard
    && card.energyType === EnergyType.BASIC
    && card.provides.includes(CardType.FIRE)
  );

  if (fireEnergies.length === 0) {
    return state;
  }

  let selected: EnergyCard[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      player.active.energies,
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.FIRE] },
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      selected = (cards || []) as EnergyCard[];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  player.active.energies.moveCardsTo(selected, player.discard);
  return state;
}

export class HuoKongLong151C extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 11691,
      name: '火恐龙',
      yorenCode: 'P005',
      cardType: '1',
      commodityCode: '151C4',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '005/151',
        rarityLabel: 'U★★★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 100,
        evolveText: '1阶进化',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: '/api/v1/cards/11691/image',
      ruleLines: [],
      attacks: [
        {
          id: 5175,
          name: '烈焰',
          text: '',
          cost: ['火'],
          damage: '20',
        },
        {
          id: 5176,
          name: '大字爆炎',
          text: '选择这只宝可梦身上附着的1个能量，放于弃牌区。',
          cost: ['火', '火', '火'],
          damage: '90',
        },
      ],
      features: [],
      illustratorNames: ['GIDORA'],
      pokemonCategory: '火焰宝可梦',
      pokedexCode: '0005',
      pokedexText: '如果它在战斗中亢奋起来，就会喷出灼热的火焰，把周围的东西烧得一干二净。',
      height: 1.1,
      weight: 19,
      deckRuleLimit: null,
    },
    collection: {
      id: 280,
      commodityCode: '151C4',
      name: '收集啦151 聚',
    },
    image_url: 'http://localhost:3000/api/v1/cards/11691/image',
    logic_group_key: HUO_KONG_LONG_151C_LOGIC_GROUP_KEY,
    variant_group_key: HUO_KONG_LONG_151C_VARIANT_GROUP_KEY,
    variant_group_size: 5,
  };

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '小火龙';

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 100;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '烈焰',
      cost: [CardType.FIRE],
      damage: '20',
      text: '',
    },
    {
      name: '大字爆炎',
      cost: [CardType.FIRE, CardType.FIRE, CardType.FIRE],
      damage: '90',
      text: '选择这只宝可梦身上附着的1个能量，放于弃牌区。',
    },
  ];

  public set: string = 'set_g';

  public name: string = '火恐龙';

  public fullName: string = '火恐龙 151C4 005/151#11691';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 20;
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.damage = 90;
      const generator = discardFireEnergy(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}

export const huoKongLong151CVariants = seedHuoKongLongVariants(
  () => new HuoKongLong151C(),
  [
    {
      id: 11691,
      commodityCode: '151C4',
      collectionId: 280,
      collectionName: '收集啦151 聚',
      collectionNumber: '005/151',
      rarityLabel: 'U★★★',
    },
    {
      id: 11552,
      commodityCode: '151C4',
      collectionId: 280,
      collectionName: '收集啦151 聚',
      collectionNumber: '005/151',
      rarityLabel: 'U☆★',
    },
    {
      id: 11368,
      commodityCode: '151C4',
      collectionId: 280,
      collectionName: '收集啦151 聚',
      collectionNumber: '005/151',
      rarityLabel: 'U',
    },
    {
      id: 12510,
      commodityCode: 'CSVE1C2',
      collectionId: 258,
      collectionName: '对战派对 共梦 下',
      collectionNumber: '013/177',
      rarityLabel: '无标记',
    },
    {
      id: 14018,
      commodityCode: 'CSVL1C',
      collectionId: 275,
      collectionName: '启程专题包',
      collectionNumber: '091/049',
      rarityLabel: '无标记',
    },
  ],
  {
    logicGroupKey: HUO_KONG_LONG_151C_LOGIC_GROUP_KEY,
    variantGroupKey: HUO_KONG_LONG_151C_VARIANT_GROUP_KEY,
    variantGroupSize: 5,
  }
);
