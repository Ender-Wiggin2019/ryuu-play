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
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type GuaGuaPaoWaVariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  imageUrl: string;
};

const GUA_GUA_PAO_WA_LOGIC_GROUP_KEY = 'pokemon:呱呱泡蛙:P656:G:hp70:跳一下30:coin-fail';
const GUA_GUA_PAO_WA_VARIANT_GROUP_KEY = 'pokemon:呱呱泡蛙:P656:G:hp70:跳一下30:coin-fail';

function seedGuaGuaPaoWaVariant(card: GuaGuaPaoWa, seed: GuaGuaPaoWaVariantSeed): GuaGuaPaoWa {
  card.rawData = {
    ...card.rawData,
    raw_card: {
      ...card.rawData.raw_card,
      id: seed.id,
      image: getCardImageUrl(seed.id),
      details: {
        ...card.rawData.raw_card.details,
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
      },
    },
    image_url: getR2CardImageUrl(seed.id),
    logic_group_key: GUA_GUA_PAO_WA_LOGIC_GROUP_KEY,
    variant_group_key: GUA_GUA_PAO_WA_VARIANT_GROUP_KEY,
    variant_group_size: 5,
  };
  card.fullName = `${card.name} ${seed.collectionNumber}#${seed.id}`;
  return card;
}

export class GuaGuaPaoWa extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 12686,
      name: '呱呱泡蛙',
      yorenCode: 'P656',
      cardType: '1',
      commodityCode: 'CSV2C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '028/128',
        rarityLabel: 'C',
        cardTypeLabel: '宝可梦',
        attributeLabel: '水',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 70,
        evolveText: '基础',
        weakness: '雷 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/253/77.png',
      ruleLines: [],
      attacks: [
        {
          id: 1974,
          name: '跳一下',
          text: '抛掷1次硬币如果为反面，则这个招式失败。',
          cost: ['水'],
          damage: '30',
        },
      ],
      features: [],
      illustratorNames: ['Atsuya Uki'],
      pokemonCategory: '泡蛙宝可梦',
      pokedexCode: '0656',
      pokedexText: '用细腻的泡泡包住身体，保护皮肤。装得无忧无虑的，实则很精明地窥视着四周。',
      height: 0.3,
      weight: 7,
      deckRuleLimit: null,
    },
    collection: {
      id: 253,
      commodityCode: 'CSV2C',
      name: '补充包 奇迹启程',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/253/77.png',
    logic_group_key: GUA_GUA_PAO_WA_LOGIC_GROUP_KEY,
    variant_group_key: GUA_GUA_PAO_WA_VARIANT_GROUP_KEY,
    variant_group_size: 5,
  };

  public stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp = 70;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '跳一下',
      cost: [CardType.WATER],
      damage: '30',
      text: '抛掷1次硬币如果为反面，则这个招式失败。',
    },
  ];

  public set = 'set_g';

  public name = '呱呱泡蛙';

  public fullName = '呱呱泡蛙 028/128#12686';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const player = effect.player;

      return store.prompt(state, new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP), flipResult => {
        if (!flipResult) {
          effect.damage = 0;
        }
      });
    }

    return state;
  }
}

export const guaGuaPaoWaVariants = [
  seedGuaGuaPaoWaVariant(new GuaGuaPaoWa(), {
    id: 12686,
    collectionNumber: '028/128',
    rarityLabel: 'C',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/253/77.png',
  }),
  seedGuaGuaPaoWaVariant(new GuaGuaPaoWa(), {
    id: 12847,
    collectionNumber: '028/128',
    rarityLabel: 'C☆★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/253/78.png',
  }),
  seedGuaGuaPaoWaVariant(new GuaGuaPaoWa(), {
    id: 12962,
    collectionNumber: '028/128',
    rarityLabel: 'C★★★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/253/79.png',
  }),
  seedGuaGuaPaoWaVariant(new GuaGuaPaoWa(), {
    id: 13567,
    collectionNumber: '007/058',
    rarityLabel: '无标记',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/268/12.png',
  }),
  seedGuaGuaPaoWaVariant(new GuaGuaPaoWa(), {
    id: 13652,
    collectionNumber: '007/058',
    rarityLabel: '无标记☆★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/268/13.png',
  }),
];
