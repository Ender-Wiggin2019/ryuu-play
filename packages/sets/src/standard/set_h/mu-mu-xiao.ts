import {
  AttackEffect,
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

import { getR2CardImageUrl } from '../card-image-r2';

type MuMuXiaoFaceSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  imageUrl: string;
};

const MU_MU_XIAO_LOGIC_GROUP_KEY = 'pokemon:木木枭:P722:H:hp70:叼-draw1';

const muMuXiaoFaceSeeds: MuMuXiaoFaceSeed[] = [
  {
    id: 17391,
    collectionNumber: '014/207',
    rarityLabel: 'C',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/37.png',
  },
  {
    id: 17654,
    collectionNumber: '014/207',
    rarityLabel: 'C★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/38.png',
  },
  {
    id: 17830,
    collectionNumber: '014/207',
    rarityLabel: 'C★★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/39.png',
  },
];

const defaultFace = muMuXiaoFaceSeeds[0];

function createMuMuXiaoRawData(seed: MuMuXiaoFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '木木枭',
      yorenCode: 'P722',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '草',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 70,
        evolveText: '基础',
        weakness: '火 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: seed.imageUrl,
      ruleLines: [],
      attacks: [
        {
          id: 19,
          name: '叼',
          text: '从自己牌库上方抽取1张卡牌。',
          cost: ['无色'],
          damage: null,
        },
        {
          id: 20,
          name: '树叶',
          text: '',
          cost: ['草'],
          damage: '10',
        },
      ],
      features: [],
      illustratorNames: ['Yoshimi Miyoshi'],
      pokemonCategory: '草羽宝可梦',
      pokedexCode: '0722',
      pokedexText:
        '一边飞行一边射出刀刃般锐利的羽毛，距离近时会使出猛烈的踢击。',
      height: 0.3,
      weight: 1.5,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: getR2CardImageUrl(seed.id),
    logic_group_key: MU_MU_XIAO_LOGIC_GROUP_KEY,
    variant_group_key: MU_MU_XIAO_LOGIC_GROUP_KEY,
    variant_group_size: muMuXiaoFaceSeeds.length,
  };
}

export class MuMuXiao extends PokemonCard {
  public rawData: any;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 70;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '叼',
      cost: [CardType.COLORLESS],
      damage: '',
      text: '从自己牌库上方抽取1张卡牌。',
    },
    {
      name: '树叶',
      cost: [CardType.GRASS],
      damage: '10',
      text: '',
    },
  ];

  public set: string = 'set_h';

  public name: string = '木木枭';

  public fullName: string = '';

  constructor(seed: MuMuXiaoFaceSeed = defaultFace) {
    super();
    this.rawData = createMuMuXiaoRawData(seed);
    this.fullName = `木木枭 ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.player.deck.moveTo(effect.player.hand, 1);
      return state;
    }

    return state;
  }
}

export function createMuMuXiaoVariants(): MuMuXiao[] {
  return muMuXiaoFaceSeeds.map(seed => new MuMuXiao(seed));
}
