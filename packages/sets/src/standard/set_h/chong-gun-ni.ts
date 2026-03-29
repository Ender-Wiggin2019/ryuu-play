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

type ChongGunNiFaceSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  imageUrl: string;
};

const CHONG_GUN_NI_LOGIC_GROUP_KEY = 'pokemon:虫滚泥:P0953:H:hp50:小小莽撞30:self-10';

const chongGunNiFaceSeeds: ChongGunNiFaceSeed[] = [
  {
    id: 16196,
    collectionNumber: '030/204',
    rarityLabel: 'C',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/85.png',
  },
  {
    id: 16454,
    collectionNumber: '030/204',
    rarityLabel: 'C☆★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/86.png',
  },
  {
    id: 16627,
    collectionNumber: '030/204',
    rarityLabel: 'C★★★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/87.png',
  },
];

const defaultFace = chongGunNiFaceSeeds[0];

function createChongGunNiRawData(seed: ChongGunNiFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '虫滚泥',
      yorenCode: 'P0953',
      cardType: '1',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '草',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 50,
        evolveText: '基础',
        weakness: '火 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: seed.imageUrl,
      ruleLines: [],
      attacks: [
        {
          id: 546,
          name: '小小莽撞',
          text: '给这只宝可梦也造成10伤害。',
          cost: ['无色'],
          damage: '30',
        },
      ],
      features: [],
      illustratorNames: ['Saboteri'],
      pokemonCategory: '滚动宝可梦',
      pokedexCode: '0953',
      pokedexText:
        '会一边滚着泥巴球，一边让进化所需的能量成熟。最终迎接进化的时刻。',
      height: 0.2,
      weight: 1,
      deckRuleLimit: null,
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: getR2CardImageUrl(seed.id),
    logic_group_key: CHONG_GUN_NI_LOGIC_GROUP_KEY,
    variant_group_key: CHONG_GUN_NI_LOGIC_GROUP_KEY,
    variant_group_size: chongGunNiFaceSeeds.length,
  };
}

export class ChongGunNi extends PokemonCard {
  public rawData: any;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 50;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '小小莽撞',
      cost: [CardType.COLORLESS],
      damage: '30',
      text: '给这只宝可梦也造成10伤害。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '虫滚泥';

  public fullName: string = '';

  constructor(seed: ChongGunNiFaceSeed = defaultFace) {
    super();
    this.rawData = createChongGunNiRawData(seed);
    this.fullName = `虫滚泥 ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 30;
      effect.player.active.damage += 10;
      return state;
    }

    return state;
  }
}

export function createChongGunNiVariants(): ChongGunNi[] {
  return chongGunNiFaceSeeds.map(seed => new ChongGunNi(seed));
}
