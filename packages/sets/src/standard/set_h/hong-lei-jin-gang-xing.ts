import {
  AddMarkerEffect,
  AttackEffect,
  CardType,
  CheckAttackCostEffect,
  CheckRetreatCostEffect,
  Effect,
  EndTurnEffect,
  PokemonCard,
  PutDamageEffect,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type RillaboomFaceSeed = {
  id: number;
  collectionId: number;
  collectionName: string;
  commodityCode: string;
  collectionNumber: string;
  rarityLabel: string;
};

const rillaboomFaceSeeds: RillaboomFaceSeed[] = [
  { id: 17399, collectionId: 458, collectionName: '补充包 璀璨诡幻', commodityCode: 'CSV8C', collectionNumber: '022/207', rarityLabel: 'U' },
  { id: 17838, collectionId: 458, collectionName: '补充包 璀璨诡幻', commodityCode: 'CSV8C', collectionNumber: '022/207', rarityLabel: 'U★★' },
  { id: 17662, collectionId: 458, collectionName: '补充包 璀璨诡幻', commodityCode: 'CSV8C', collectionNumber: '022/207', rarityLabel: 'U★' },
];

const defaultFace = rillaboomFaceSeeds[0];
const DRUM_BEATING_MARKER = 'DRUM_BEATING_MARKER';

function createRillaboomRawData(seed: RillaboomFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '轰擂金刚猩',
      yorenCode: 'P812',
      cardType: '1',
      commodityCode: seed.commodityCode,
      details: {
        regulationMarkText: 'H',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '草',
        specialCardLabel: null,
        hp: 180,
        evolveText: '2阶进化',
        weakness: '火 ×2',
        resistance: null,
        retreatCost: 4,
      },
      image: getCardImageUrl(seed.id),
      ruleLines: [],
      attacks: [
        {
          id: 31,
          name: '鼓击',
          text: '在下一个对手的回合，受到这个招式影响的宝可梦，使用招式所需能量和【撤退】所需能量，各增加1个【无】能量。',
          cost: ['草'],
          damage: '60',
        },
        {
          id: 32,
          name: '木槌',
          text: '给这只宝可梦也造成50伤害。',
          cost: ['草', '草'],
          damage: '180',
        },
      ],
      features: [],
      illustratorNames: ['toriyufu'],
      pokemonCategory: '鼓手宝可梦',
      pokedexCode: '0812',
      pokedexText: '能够通过打鼓来控制特别的树桩中的力量，操纵树根进行战斗。',
      height: 2.1,
      weight: 90,
      deckRuleLimit: null,
    },
    collection: {
      id: seed.collectionId,
      commodityCode: seed.commodityCode,
      name: seed.collectionName,
    },
    image_url: getR2CardImageUrl(seed.id),
  };
}

export class HongLeiJinGangXing extends PokemonCard {
  public rawData: any;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = '啪咚猴';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp = 180;

  public weakness = [{ type: CardType.FIRE }];

  public resistance: { type: CardType; value: number }[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '鼓击',
      cost: [CardType.GRASS],
      damage: '60',
      text: '在下一个对手的回合，受到这个招式影响的宝可梦，使用招式所需能量和【撤退】所需能量，各增加1个【无】能量。',
    },
    {
      name: '木槌',
      cost: [CardType.GRASS, CardType.GRASS],
      damage: '180',
      text: '给这只宝可梦也造成50伤害。',
    },
  ];

  public set = 'set_h';

  public name = '轰擂金刚猩';

  public fullName = '';

  constructor(seed: RillaboomFaceSeed = defaultFace) {
    super();
    this.rawData = createRillaboomRawData(seed);
    this.fullName = `轰擂金刚猩 ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const addMarkerEffect = new AddMarkerEffect(effect, DRUM_BEATING_MARKER, this);
      addMarkerEffect.target = effect.opponent.active;
      return store.reduceEffect(state, addMarkerEffect);
    }

    if (effect instanceof CheckAttackCostEffect && effect.player.active.marker.hasMarker(DRUM_BEATING_MARKER, this)) {
      effect.cost.push(CardType.COLORLESS);
      return state;
    }

    if (effect instanceof CheckRetreatCostEffect && effect.player.active.marker.hasMarker(DRUM_BEATING_MARKER, this)) {
      effect.cost.push(CardType.COLORLESS);
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const selfDamage = new PutDamageEffect(effect, 50);
      selfDamage.target = effect.player.active;
      store.reduceEffect(state, selfDamage);
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.active.marker.removeMarker(DRUM_BEATING_MARKER, this);
      effect.player.bench.forEach(slot => slot.marker.removeMarker(DRUM_BEATING_MARKER, this));
      return state;
    }

    return state;
  }
}

export function createHongLeiJinGangXingVariants(): HongLeiJinGangXing[] {
  return rillaboomFaceSeeds.map(seed => new HongLeiJinGangXing(seed));
}
