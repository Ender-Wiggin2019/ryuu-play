import {
  AttackEffect,
  CardTag,
  CardType,
  Effect,
  EnergyCard,
  GameError,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StoreLike,
  UseAttackEffect,
} from '@ptcg/common';

import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type DialgaVStarFaceSeed = {
  id: number;
  collectionId: number;
  collectionName: string;
  commodityCode: string;
  collectionNumber: string;
  rarityLabel: string;
};

const dialgaVStarFaceSeeds: DialgaVStarFaceSeed[] = [
  {
    id: 9600,
    collectionId: 182,
    collectionName: '补充包 勇魅群星 勇',
    commodityCode: 'CS5bC',
    collectionNumber: '096/128',
    rarityLabel: 'RRR',
  },
  {
    id: 9678,
    collectionId: 182,
    collectionName: '补充包 勇魅群星 勇',
    commodityCode: 'CS5bC',
    collectionNumber: '174/128',
    rarityLabel: 'UR',
  },
  {
    id: 9669,
    collectionId: 182,
    collectionName: '补充包 勇魅群星 勇',
    commodityCode: 'CS5bC',
    collectionNumber: '165/128',
    rarityLabel: 'HR',
  },
  {
    id: 14117,
    collectionId: 283,
    collectionName: '对战派对 耀梦 上',
    commodityCode: 'CSVE2C1',
    collectionNumber: '103/207',
    rarityLabel: '无标记',
  },
  {
    id: 10884,
    collectionId: 210,
    collectionName: '专题包 辉耀能量 第三弹',
    commodityCode: 'CS6.1C',
    collectionNumber: '022/004',
    rarityLabel: '无标记',
  },
];

const defaultFace = dialgaVStarFaceSeeds[0];

function createDialgaVStarRawData(seed: DialgaVStarFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '起源帝牙卢卡VSTAR',
      yorenCode: 'Y984',
      cardType: '1',
      commodityCode: seed.commodityCode,
      details: {
        regulationMarkText: 'F',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '钢',
        pokemonTypeLabel: '宝可梦VSTAR',
        specialCardLabel: null,
        hp: 280,
        evolveText: 'V进化',
        weakness: '火 ×2',
        resistance: '草 -30',
        retreatCost: 3,
      },
      image: getCardImageUrl(seed.id),
      ruleLines: ['当宝可梦VSTAR【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 1569,
          name: '金属爆破',
          text: '追加造成这只宝可梦身上附有的【钢】能量数量×40点伤害。',
          cost: ['无色'],
          damage: '40+',
        },
        {
          id: 1570,
          name: 'Star Chronos',
          text: '造成220点伤害。这个回合结束后，再进行1个自己的回合。',
          cost: ['钢', '钢', '钢', '无色', '无色'],
          damage: '220',
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

export class QiYuanDiYaLuKaVSTAR extends PokemonCard {
  public rawData: any;

  public tags = [CardTag.POKEMON_VSTAR];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '起源帝牙卢卡V';

  public cardTypes: CardType[] = [CardType.METAL];

  public hp = 280;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '金属爆破',
      cost: [CardType.COLORLESS],
      damage: '40+',
      text: '追加造成这只宝可梦身上附有的【钢】能量数量×40点伤害。',
    },
    {
      name: 'Star Chronos',
      cost: [CardType.METAL, CardType.METAL, CardType.METAL, CardType.COLORLESS, CardType.COLORLESS],
      damage: '220',
      text: '造成220点伤害。这个回合结束后，再进行1个自己的回合。',
    },
  ];

  public set = 'set_f';

  public name = '起源帝牙卢卡VSTAR';

  public fullName = '';

  constructor(seed: DialgaVStarFaceSeed = defaultFace) {
    super();
    this.rawData = createDialgaVStarRawData(seed);
    this.fullName = `起源帝牙卢卡VSTAR ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const metalEnergyCount = effect.player.active.energies.cards.filter(card =>
        card instanceof EnergyCard
        && (card.provides.includes(CardType.METAL) || card.provides.includes(CardType.ANY))
      ).length;
      effect.damage = 40 + metalEnergyCount * 40;
      return state;
    }

    if (effect instanceof UseAttackEffect && effect.attack === this.attacks[1]) {
      // The engine does not currently expose an extra-turn scheduler, so the
      // VSTAR Power attack cannot resolve correctly at card-layer only.
      throw new GameError(GameMessage.CANNOT_USE_POWER);
    }

    return state;
  }
}

export function createQiYuanDiYaLuKaVStarVariants(): QiYuanDiYaLuKaVSTAR[] {
  return dialgaVStarFaceSeeds.map(seed => new QiYuanDiYaLuKaVSTAR(seed));
}
