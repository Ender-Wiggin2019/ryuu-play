import {
  AddMarkerEffect,
  AddSpecialConditionsEffect,
  AttackEffect,
  CardType,
  DiscardCardsEffect,
  Effect,
  MoveCardsEffect,
  PokemonCard,
  PutCountersEffect,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

import {
  seedHuoKongLongVariants,
} from './huo-kong-long-variant';

export const HUO_KONG_LONG_CSV5C_LOGIC_GROUP_KEY = 'pokemon:火恐龙:P005:G:hp90:烈焰50+闪焰之幕';
export const HUO_KONG_LONG_CSV5C_VARIANT_GROUP_KEY = 'pokemon:火恐龙:P005:G:hp90:烈焰50+闪焰之幕';

function blocksOpponentAttackEffect(state: State, effect: { player: any; target: any }): boolean {
  const owner = StateUtils.findOwner(state, effect.target);
  return owner !== undefined && owner !== effect.player;
}

export class HuoKongLongCsv5c extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 14949,
      name: '火恐龙',
      yorenCode: 'P005',
      cardType: '1',
      commodityCode: 'CSV5C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '015/129',
        rarityLabel: 'C★★★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 90,
        evolveText: '1阶进化',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: '/api/v1/cards/14949/image',
      ruleLines: [],
      attacks: [
        {
          id: 3832,
          name: '烈焰',
          text: '',
          cost: ['火', '火'],
          damage: '50',
        },
      ],
      features: [
        {
          id: 523,
          name: '闪焰之幕',
          text: '这只宝可梦，不受到对手宝可梦所使用招式的效果影响。',
        },
      ],
      illustratorNames: ['Tonji Matsuno'],
      pokemonCategory: '火焰宝可梦',
      pokedexCode: '0005',
      pokedexText: '如果它在战斗中亢奋起来，就会喷出灼热的火焰，把周围的东西烧得一干二净。',
      height: 1.1,
      weight: 19,
      deckRuleLimit: null,
    },
    collection: {
      id: 298,
      commodityCode: 'CSV5C',
      name: '补充包 黑晶炽诚',
    },
    image_url: 'http://localhost:3000/api/v1/cards/14949/image',
    logic_group_key: HUO_KONG_LONG_CSV5C_LOGIC_GROUP_KEY,
    variant_group_key: HUO_KONG_LONG_CSV5C_VARIANT_GROUP_KEY,
    variant_group_size: 6,
  };

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '小火龙';

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 90;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '烈焰',
      cost: [CardType.FIRE, CardType.FIRE],
      damage: '50',
      text: '',
    },
  ];

  public set: string = 'set_g';

  public name: string = '火恐龙';

  public fullName: string = '火恐龙 CSV5C 015/129#14949';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 50;
      return state;
    }

    if (
      (effect instanceof AddSpecialConditionsEffect
        || effect instanceof DiscardCardsEffect
        || effect instanceof MoveCardsEffect
        || effect instanceof PutCountersEffect
        || effect instanceof AddMarkerEffect)
      && effect.target.getPokemonCard() === this
      && blocksOpponentAttackEffect(state, effect)
    ) {
      effect.preventDefault = true;
      return state;
    }

    return state;
  }
}

export const huoKongLongCsv5cVariants = seedHuoKongLongVariants(
  () => new HuoKongLongCsv5c(),
  [
    {
      id: 14949,
      commodityCode: 'CSV5C',
      collectionId: 298,
      collectionName: '补充包 黑晶炽诚',
      collectionNumber: '015/129',
      rarityLabel: 'C★★★',
    },
    {
      id: 14834,
      commodityCode: 'CSV5C',
      collectionId: 298,
      collectionName: '补充包 黑晶炽诚',
      collectionNumber: '015/129',
      rarityLabel: 'C☆★',
    },
    {
      id: 14672,
      commodityCode: 'CSV5C',
      collectionId: 298,
      collectionName: '补充包 黑晶炽诚',
      collectionNumber: '015/129',
      rarityLabel: 'C',
    },
    {
      id: 16055,
      commodityCode: 'CSVL2C',
      collectionId: 314,
      collectionName: '游历专题包',
      collectionNumber: '062/052',
      rarityLabel: '无标记',
    },
    {
      id: 16007,
      commodityCode: 'CSVL2C',
      collectionId: 314,
      collectionName: '游历专题包',
      collectionNumber: '014/052',
      rarityLabel: '无标记',
    },
    {
      id: 16932,
      commodityCode: 'CSVM1aC',
      collectionId: 330,
      collectionName: '大师战略卡组构筑套装 喷火龙ex',
      collectionNumber: '002/033',
      rarityLabel: '无标记',
    },
  ],
  {
    logicGroupKey: HUO_KONG_LONG_CSV5C_LOGIC_GROUP_KEY,
    variantGroupKey: HUO_KONG_LONG_CSV5C_VARIANT_GROUP_KEY,
    variantGroupSize: 6,
  }
);
