import {
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type BoBoCsv4CRawData = {
  raw_card: {
    id: number;
    name: string;
    yorenCode: string;
    cardType: string;
    commodityCode: string;
    details: {
      regulationMarkText: string;
      collectionNumber: string;
      rarityLabel: string;
      cardTypeLabel: string;
      attributeLabel: string;
      specialCardLabel: string | null;
      hp: number;
      evolveText: string;
      weakness: string;
      resistance: string;
      retreatCost: number;
    };
    image: string;
    ruleLines: string[];
    attacks: Array<{
      id: number;
      name: string;
      text: string;
      cost: string[];
      damage: string;
    }>;
    features: unknown[];
  };
  collection: {
    id: number;
    commodityCode: string;
    name: string;
  };
  image_url: string;
  logic_group_key: string;
  variant_group_key: string;
  variant_group_size: number;
};

type BoBoCsv4CVariantCapable = {
  name: string;
  fullName: string;
  rawData: BoBoCsv4CRawData;
};

export type BoBoCsv4CVariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  commodityCode?: string;
};

export const BO_BO_CSV4C_LOGIC_GROUP_KEY = 'pokemon:波波:P016:G:hp60:起风';
export const BO_BO_CSV4C_VARIANT_GROUP_KEY = 'pokemon:波波:P016:G:hp60';

export function seedBoBoCsv4CVariant<T extends BoBoCsv4CVariantCapable>(
  instance: T,
  options: BoBoCsv4CVariantSeed
): T {
  const commodityCode = options.commodityCode || instance.rawData.raw_card.commodityCode;
  instance.rawData = {
    ...instance.rawData,
    raw_card: {
      ...instance.rawData.raw_card,
      id: options.id,
      commodityCode,
      image: getCardImageUrl(options.id),
      details: {
        ...instance.rawData.raw_card.details,
        collectionNumber: options.collectionNumber,
        rarityLabel: options.rarityLabel,
      },
    },
    image_url: getR2CardImageUrl(options.id),
    logic_group_key: BO_BO_CSV4C_LOGIC_GROUP_KEY,
    variant_group_key: BO_BO_CSV4C_VARIANT_GROUP_KEY,
  };
  instance.fullName = `${instance.name} ${commodityCode} ${options.collectionNumber}#${options.id}`;
  return instance;
}

export function seedBoBoCsv4CVariants<T extends BoBoCsv4CVariantCapable>(
  factory: () => T,
  variants: BoBoCsv4CVariantSeed[]
): T[] {
  return variants.map(variant => seedBoBoCsv4CVariant(factory(), variant));
}

export class BoBoCsv4C extends PokemonCard {
  public rawData: BoBoCsv4CRawData = {
    raw_card: {
      id: 14375,
      name: '波波',
      yorenCode: 'P016',
      cardType: '1',
      commodityCode: 'CSV4C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '136/129',
        rarityLabel: 'AR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        specialCardLabel: null,
        hp: 60,
        evolveText: '基础',
        weakness: '雷 ×2',
        resistance: '斗 -30',
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/365.png',
      ruleLines: [],
      attacks: [
        {
          id: 4316,
          name: '起风',
          text: '',
          cost: ['COLORLESS'],
          damage: '20',
        },
      ],
      features: [],
    },
    collection: {
      id: 285,
      commodityCode: 'CSV4C',
      name: '补充包 嘉奖回合',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/365.png',
    logic_group_key: BO_BO_CSV4C_LOGIC_GROUP_KEY,
    variant_group_key: BO_BO_CSV4C_VARIANT_GROUP_KEY,
    variant_group_size: 4,
  };

  public stage: Stage = Stage.BASIC;
  public cardTypes: CardType[] = [CardType.COLORLESS];
  public hp: number = 60;
  public weakness = [{ type: CardType.LIGHTNING }];
  public resistance = [{ type: CardType.FIGHTING, value: -30 }];
  public retreat = [CardType.COLORLESS];
  public attacks = [
    {
      name: '起风',
      cost: [CardType.COLORLESS],
      damage: '20',
      text: '',
    },
  ];

  public set: string = 'set_g';
  public name: string = '波波';
  public fullName: string = '波波 CSV4C 136/129#14375';

  public reduceEffect(_store: StoreLike, state: State, _effect: Effect): State {
    return state;
  }
}
