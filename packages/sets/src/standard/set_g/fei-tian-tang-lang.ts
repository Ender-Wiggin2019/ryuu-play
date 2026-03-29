import {
  AbstractAttackEffect,
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

import { commonMarkers } from '../../common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type VariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
};

function seedVariant(card: FeiTianTangLang, seed: VariantSeed): FeiTianTangLang {
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
  };
  card.fullName = `${card.name} ${seed.collectionNumber}#${seed.id}`;
  return card;
}

export class FeiTianTangLang extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 15994,
      name: '飞天螳螂',
      yorenCode: 'P133',
      cardType: '1',
      commodityCode: 'CSVL2C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '001/052',
        rarityLabel: '无标记',
        cardTypeLabel: '宝可梦',
        attributeLabel: '草',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 80,
        evolveText: '基础',
        weakness: '火 ×2',
        resistance: null,
        retreatCost: 0,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/314/0.png',
      ruleLines: [],
      attacks: [
        {
          id: 757,
          name: '高速移动',
          text: '抛掷1次硬币如果为正面，则在下一个对手的回合，这只宝可梦不受到招式的伤害和效果影响。',
          cost: ['无色'],
          damage: '10',
        },
        {
          id: 758,
          name: '居合劈',
          text: '',
          cost: ['无色', '无色'],
          damage: '20',
        },
      ],
      features: [],
      illustratorNames: ['HYOGONOSUKE'],
      pokemonCategory: '镰刀宝可梦',
      pokedexCode: '0122',
      pokedexText: '锋利的镰刀极其厉害。即使石头也能毫不费力地切开。',
      height: 1.5,
      weight: 56,
      deckRuleLimit: null,
    },
    collection: {
      id: 314,
      commodityCode: 'CSVL2C',
      name: '游历专题包',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/314/0.png',
  };

  public tags = [];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 80;

  public weakness = [{ type: CardType.FIRE }];

  public retreat = [];

  public attacks = [
    {
      name: '高速移动',
      cost: [CardType.COLORLESS],
      damage: '10',
      text: '抛掷1次硬币如果为正面，则在下一个对手的回合，这只宝可梦不受到招式的伤害和效果影响。',
    },
    {
      name: '居合劈',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '20',
      text: '',
    },
  ];

  public set: string = 'set_g';

  public name: string = '飞天螳螂';

  public fullName: string = '飞天螳螂 001/052#15994';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    const opponentNextTurn = commonMarkers.duringOpponentNextTurn(this, store, state, effect);

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      return store.prompt(state, [new CoinFlipPrompt(effect.player.id, GameMessage.COIN_FLIP)], result => {
        if (result) {
          opponentNextTurn.setMarker(effect, effect.player.active);
        }
      });
    }

    if (effect instanceof AbstractAttackEffect && opponentNextTurn.hasMarker(effect, effect.target)) {
      effect.preventDefault = true;
      return state;
    }

    return state;
  }
}

export const feiTianTangLangVariants = [
  new FeiTianTangLang(),
  seedVariant(new FeiTianTangLang(), {
    id: 101,
    collectionNumber: '001/151',
    rarityLabel: 'C',
  }),
  seedVariant(new FeiTianTangLang(), {
    id: 312,
    collectionNumber: '001/151',
    rarityLabel: 'C☆★',
  }),
  seedVariant(new FeiTianTangLang(), {
    id: 252,
    collectionNumber: '152/151',
    rarityLabel: 'S',
  }),
];
