import {
  AttackEffect,
  CardType,
  CoinFlipPrompt,
  Effect,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

import { getR2CardImageUrl } from '../card-image-r2';

type KenGuoChongFaceSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  imageUrl: string;
};

const KEN_GUO_CHONG_LOGIC_GROUP_KEY = 'pokemon:啃果虫:P840:H:hp40:滚动攻击10plus';

const kenGuoChongFaceSeeds: KenGuoChongFaceSeed[] = [
  {
    id: 17400,
    collectionNumber: '023/207',
    rarityLabel: 'C',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/64.png',
  },
  {
    id: 17663,
    collectionNumber: '023/207',
    rarityLabel: 'C★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/65.png',
  },
  {
    id: 17839,
    collectionNumber: '023/207',
    rarityLabel: 'C★★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/66.png',
  },
];

const defaultFace = kenGuoChongFaceSeeds[0];

function createKenGuoChongRawData(seed: KenGuoChongFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '啃果虫',
      yorenCode: 'P840',
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
        hp: 40,
        evolveText: '基础',
        weakness: '火 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: seed.imageUrl,
      ruleLines: [],
      attacks: [
        {
          id: 33,
          name: '滚动攻击',
          text: '抛掷1次硬币如果为正面，则追加造成20伤害。',
          cost: ['草'],
          damage: '10+',
        },
      ],
      features: [],
      illustratorNames: ['OKUBO'],
      pokemonCategory: '苹果居宝可梦',
      pokedexCode: '0840',
      pokedexText:
        '平时生活在苹果中。如果失去了苹果，身体的水分就会流失，从而逐渐虚弱。',
      height: 0.2,
      weight: 0.5,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: getR2CardImageUrl(seed.id),
    logic_group_key: KEN_GUO_CHONG_LOGIC_GROUP_KEY,
    variant_group_key: KEN_GUO_CHONG_LOGIC_GROUP_KEY,
    variant_group_size: kenGuoChongFaceSeeds.length,
  };
}

export class KenGuoChong extends PokemonCard {
  public rawData: any;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 40;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '滚动攻击',
      cost: [CardType.GRASS],
      damage: '10+',
      text: '抛掷1次硬币如果为正面，则追加造成20伤害。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '啃果虫';

  public fullName: string = '';

  constructor(seed: KenGuoChongFaceSeed = defaultFace) {
    super();
    this.rawData = createKenGuoChongRawData(seed);
    this.fullName = `啃果虫 ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      return store.prompt(state, [new CoinFlipPrompt(effect.player.id, GameMessage.COIN_FLIP)], result => {
        if (result === true) {
          effect.damage += 20;
        }
      });
    }

    return state;
  }
}

export function createKenGuoChongVariants(): KenGuoChong[] {
  return kenGuoChongFaceSeeds.map(seed => new KenGuoChong(seed));
}
