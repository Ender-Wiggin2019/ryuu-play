import {
  AttackEffect,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StoreLike,
  SuperType,
} from '@ptcg/common';

import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type DialgaVFaceSeed = {
  id: number;
  collectionId: number;
  collectionName: string;
  commodityCode: string;
  collectionNumber: string;
  rarityLabel: string;
};

const dialgaVFaceSeeds: DialgaVFaceSeed[] = [
  {
    id: 9599,
    collectionId: 182,
    collectionName: '补充包 勇魅群星 勇',
    commodityCode: 'CS5bC',
    collectionNumber: '095/128',
    rarityLabel: 'RR',
  },
  {
    id: 9650,
    collectionId: 182,
    collectionName: '补充包 勇魅群星 勇',
    commodityCode: 'CS5bC',
    collectionNumber: '146/128',
    rarityLabel: 'SR',
  },
  {
    id: 9651,
    collectionId: 182,
    collectionName: '补充包 勇魅群星 勇',
    commodityCode: 'CS5bC',
    collectionNumber: '147/128',
    rarityLabel: 'SR',
  },
  {
    id: 14116,
    collectionId: 283,
    collectionName: '对战派对 耀梦 上',
    commodityCode: 'CSVE2C1',
    collectionNumber: '102/207',
    rarityLabel: '无标记',
  },
  {
    id: 9165,
    collectionId: 180,
    collectionName: '勇魅群星 卡组构筑礼盒',
    commodityCode: 'CSNC',
    collectionNumber: '008/024',
    rarityLabel: '无标记',
  },
];

const defaultFace = dialgaVFaceSeeds[0];

function createDialgaVRawData(seed: DialgaVFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '起源帝牙卢卡V',
      yorenCode: 'Y931',
      cardType: '1',
      commodityCode: seed.commodityCode,
      details: {
        regulationMarkText: 'F',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '钢',
        pokemonTypeLabel: '宝可梦V',
        specialCardLabel: null,
        hp: 220,
        evolveText: '基础',
        weakness: '火 ×2',
        resistance: '草 -30',
        retreatCost: 2,
      },
      image: getCardImageUrl(seed.id),
      ruleLines: ['当宝可梦V【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 1567,
          name: '金属涂层',
          text: '选择自己弃牌区中最多2张【钢】能量，附着于这只宝可梦身上。',
          cost: ['无色'],
          damage: null,
        },
        {
          id: 1568,
          name: '时间断绝',
          text: '',
          cost: ['钢', '钢', '钢', '无色'],
          damage: '180',
        },
      ],
      features: [],
      illustratorNames: ['5ban Graphics'],
    },
    collection: {
      id: seed.collectionId,
      commodityCode: seed.commodityCode,
      name: seed.collectionName,
    },
    image_url: getR2CardImageUrl(seed.id),
  };
}

export class QiYuanDiYaLuKaV extends PokemonCard {
  public rawData: any;

  public tags = [CardTag.POKEMON_V];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.METAL];

  public hp = 220;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '金属涂层',
      cost: [CardType.COLORLESS],
      damage: '',
      text: '选择自己弃牌区中最多2张【钢】能量，附着于这只宝可梦身上。',
    },
    {
      name: '时间断绝',
      cost: [CardType.METAL, CardType.METAL, CardType.METAL, CardType.COLORLESS],
      damage: '180',
      text: '',
    },
  ];

  public set = 'set_f';

  public name = '起源帝牙卢卡V';

  public fullName = '';

  constructor(seed: DialgaVFaceSeed = defaultFace) {
    super();
    this.rawData = createDialgaVRawData(seed);
    this.fullName = `起源帝牙卢卡V ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const metalCards = player.discard.cards.filter(card =>
        card instanceof EnergyCard
        && card.superType === SuperType.ENERGY
        && (card.provides.includes(CardType.METAL) || card.provides.includes(CardType.ANY))
      );

      if (metalCards.length === 0) {
        return state;
      }

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_ATTACH,
          player.discard,
          { superType: SuperType.ENERGY, provides: [CardType.METAL] },
          { min: 0, max: Math.min(2, metalCards.length), allowCancel: false }
        ),
        selected => {
          const cards = (selected || []) as EnergyCard[];
          cards.forEach(card => player.discard.moveCardTo(card, player.active.energies));
        }
      );
    }

    return state;
  }
}

export function createQiYuanDiYaLuKaVVariants(): QiYuanDiYaLuKaV[] {
  return dialgaVFaceSeeds.map(seed => new QiYuanDiYaLuKaV(seed));
}

