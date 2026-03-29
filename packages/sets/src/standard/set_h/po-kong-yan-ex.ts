import {
  AttackEffect,
  CardTag,
  CardType,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StoreLike,
  UseAttackEffect,
} from '@ptcg/common';

import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type GougingFireExFaceSeed = {
  id: number;
  collectionId: number;
  collectionName: string;
  commodityCode: string;
  collectionNumber: string;
  rarityLabel: string;
};

const gougingFireExFaceSeeds: GougingFireExFaceSeed[] = [
  { id: 16217, collectionId: 324, collectionName: '补充包 利刃猛醒', commodityCode: 'CSV7C', collectionNumber: '051/204', rarityLabel: 'RR' },
  { id: 16381, collectionId: 324, collectionName: '补充包 利刃猛醒', commodityCode: 'CSV7C', collectionNumber: '215/204', rarityLabel: 'SR' },
  { id: 16404, collectionId: 324, collectionName: '补充包 利刃猛醒', commodityCode: 'CSV7C', collectionNumber: '238/204', rarityLabel: 'SAR' },
  { id: 16418, collectionId: 324, collectionName: '补充包 利刃猛醒', commodityCode: 'CSV7C', collectionNumber: '252/204', rarityLabel: 'UR' },
];

const defaultFace = gougingFireExFaceSeeds[0];
const RAGING_CHARGE_MARKER = 'RAGING_CHARGE_MARKER';

function createGougingFireExRawData(seed: GougingFireExFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '破空焰ex',
      yorenCode: 'Y1387',
      cardType: '1',
      commodityCode: seed.commodityCode,
      details: {
        regulationMarkText: 'H',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: '古代',
        hp: 230,
        evolveText: '基础',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: getCardImageUrl(seed.id),
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 568,
          name: '高温爆破',
          text: '',
          cost: ['火', '无色'],
          damage: '60',
        },
        {
          id: 569,
          name: '烈火猛冲',
          text: '如果使用了这个招式的话，则这只宝可梦，在离开战斗场之前无法使用「烈火猛冲」。',
          cost: ['火', '火', '无色'],
          damage: '260',
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

export class PoKongYanEx extends PokemonCard {
  public rawData: any;

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp = 230;

  public weakness = [{ type: CardType.WATER }];

  public resistance: { type: CardType; value: number }[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '高温爆破',
      cost: [CardType.FIRE, CardType.COLORLESS],
      damage: '60',
      text: '',
    },
    {
      name: '烈火猛冲',
      cost: [CardType.FIRE, CardType.FIRE, CardType.COLORLESS],
      damage: '260',
      text: '如果使用了这个招式的话，则这只宝可梦，在离开战斗场之前无法使用「烈火猛冲」。',
    },
  ];

  public set = 'set_h';

  public name = '破空焰ex';

  public fullName = '';

  constructor(seed: GougingFireExFaceSeed = defaultFace) {
    super();
    this.rawData = createGougingFireExRawData(seed);
    this.fullName = `破空焰ex ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof UseAttackEffect && effect.player.active.getPokemonCard() === this && effect.attack === this.attacks[1]) {
      if (effect.player.active.marker.hasMarker(RAGING_CHARGE_MARKER, this)) {
        throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
      }
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.player.active.marker.addMarker(RAGING_CHARGE_MARKER, this);
      return state;
    }

    return state;
  }
}

export function createPoKongYanExVariants(): PoKongYanEx[] {
  return gougingFireExFaceSeeds.map(seed => new PoKongYanEx(seed));
}
