import {
  AttackEffect,
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type TanXiaoShiFaceSeed = {
  id: number;
  collectionId: number;
  collectionName: string;
  commodityCode: string;
  collectionNumber: string;
  rarityLabel: string;
};

const TAN_XIAO_SHI_LOGIC_GROUP_KEY = 'pokemon:炭小侍:P0935:G:hp70:高温爆破60';

const tanXiaoShiFaceSeeds: TanXiaoShiFaceSeed[] = [
  { id: 16057, collectionId: 314, collectionName: '游历专题包', commodityCode: 'CSVL2C', collectionNumber: '064/052', rarityLabel: '无标记' },
  { id: 16009, collectionId: 314, collectionName: '游历专题包', commodityCode: 'CSVL2C', collectionNumber: '016/052', rarityLabel: '无标记' },
];

const defaultFace = tanXiaoShiFaceSeeds[0];

function createTanXiaoShiRawData(seed: TanXiaoShiFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '炭小侍',
      yorenCode: 'P0935',
      cardType: '1',
      commodityCode: seed.commodityCode,
      details: {
        regulationMarkText: 'G',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
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
      image: getCardImageUrl(seed.id),
      ruleLines: [],
      attacks: [
        {
          id: 774,
          name: '高温爆破',
          text: '',
          cost: ['火', '火', '无色'],
          damage: '60',
        },
      ],
      features: [],
      illustratorNames: ['nagimiso'],
      pokemonCategory: '小火星宝可梦',
      pokedexCode: '0935',
      pokedexText: '生命寄宿在燃烧的木炭上，变成了宝可梦。即使面对强敌，也会以燃烧的斗志来迎战。',
      height: 0.6,
      weight: 10.5,
      deckRuleLimit: null,
    },
    collection: {
      id: seed.collectionId,
      commodityCode: seed.commodityCode,
      name: seed.collectionName,
    },
    image_url: getR2CardImageUrl(seed.id),
    logic_group_key: TAN_XIAO_SHI_LOGIC_GROUP_KEY,
    variant_group_key: TAN_XIAO_SHI_LOGIC_GROUP_KEY,
    variant_group_size: tanXiaoShiFaceSeeds.length,
  };
}

export class TanXiaoShiG extends PokemonCard {
  public rawData: any;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 70;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '高温爆破',
      cost: [CardType.FIRE, CardType.FIRE, CardType.COLORLESS],
      damage: '60',
      text: '',
    },
  ];

  public set: string = 'set_g';

  public name: string = '炭小侍';

  public fullName: string = '';

  constructor(seed: TanXiaoShiFaceSeed = defaultFace) {
    super();
    this.rawData = createTanXiaoShiRawData(seed);
    this.fullName = `炭小侍 ${seed.commodityCode} ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 60;
    }

    return state;
  }
}

export const tanXiaoShiVariants = tanXiaoShiFaceSeeds.map(seed => new TanXiaoShiG(seed));
