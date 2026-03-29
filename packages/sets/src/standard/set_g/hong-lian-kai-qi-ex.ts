import {
  AttackEffect,
  CardTag,
  CardType,
  DealDamageEffect,
  Effect,
  EnergyCard,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type HongLianKaiQiExFaceSeed = {
  id: number;
  collectionId: number;
  collectionName: string;
  commodityCode: string;
  collectionNumber: string;
  rarityLabel: string;
};

const HONG_LIAN_KAI_QI_EX_LOGIC_GROUP_KEY = 'pokemon:红莲铠骑ex:Y1333:G:hp260:红莲盔甲+灼热火箭炮40+火能量x40';

const hongLianKaiQiExFaceSeeds: HongLianKaiQiExFaceSeed[] = [
  { id: 14796, collectionId: 298, collectionName: '补充包 黑晶炽诚', commodityCode: 'CSV5C', collectionNumber: '139/129', rarityLabel: 'SR' },
  { id: 14678, collectionId: 298, collectionName: '补充包 黑晶炽诚', commodityCode: 'CSV5C', collectionNumber: '021/129', rarityLabel: 'RR' },
];

const defaultFace = hongLianKaiQiExFaceSeeds[0];

function createHongLianKaiQiExRawData(seed: HongLianKaiQiExFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '红莲铠骑ex',
      yorenCode: 'Y1333',
      cardType: '1',
      commodityCode: seed.commodityCode,
      details: {
        regulationMarkText: 'G',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: null,
        hp: 260,
        evolveText: '1阶进化',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: getCardImageUrl(seed.id),
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 1250,
          name: '灼热火箭炮',
          text: '追加造成这只宝可梦身上附着的【火】能量数量×40伤害。',
          cost: ['无色', '无色'],
          damage: '40+',
        },
      ],
      features: [
        {
          id: 162,
          name: '红莲盔甲',
          text: '如果这只宝可梦的HP为全满状态的话，则这只宝可梦受到对手宝可梦的招式的伤害「-80」。',
        },
      ],
      illustratorNames: ['takuyoa'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: seed.collectionId,
      commodityCode: seed.commodityCode,
      name: seed.collectionName,
    },
    image_url: getR2CardImageUrl(seed.id),
    logic_group_key: HONG_LIAN_KAI_QI_EX_LOGIC_GROUP_KEY,
    variant_group_key: HONG_LIAN_KAI_QI_EX_LOGIC_GROUP_KEY,
    variant_group_size: hongLianKaiQiExFaceSeeds.length,
  };
}

export class HongLianKaiQiExG extends PokemonCard {
  public rawData: any;

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '炭小侍';

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 260;

  public weakness = [{ type: CardType.WATER }];

  public resistance: { type: CardType; value: number }[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '灼热火箭炮',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '40+',
      text: '追加造成这只宝可梦身上附着的【火】能量数量×40伤害。',
    },
  ];

  public set: string = 'set_g';

  public name: string = '红莲铠骑ex';

  public fullName: string = '';

  constructor(seed: HongLianKaiQiExFaceSeed = defaultFace) {
    super();
    this.rawData = createHongLianKaiQiExRawData(seed);
    this.fullName = `红莲铠骑ex ${seed.commodityCode} ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const fireEnergyCount = effect.player.active.energies.cards.filter(
        card => Array.isArray((card as EnergyCard).provides) && (card as EnergyCard).provides.includes(CardType.FIRE)
      ).length;
      effect.damage = 40 + fireEnergyCount * 40;
      return state;
    }

    if (effect instanceof DealDamageEffect) {
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);
      if (pokemonSlot === undefined || effect.target !== pokemonSlot) {
        return state;
      }

      const owner = StateUtils.findOwner(state, pokemonSlot);
      if (effect.player === owner || pokemonSlot.damage > 0) {
        return state;
      }

      effect.damage = Math.max(0, effect.damage - 80);
    }

    return state;
  }
}

export const hongLianKaiQiExVariants = hongLianKaiQiExFaceSeeds.map(seed => new HongLianKaiQiExG(seed));
