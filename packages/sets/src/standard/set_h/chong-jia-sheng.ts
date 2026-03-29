import {
  AbstractAttackEffect,
  AttackEffect,
  CardType,
  Effect,
  PokemonCard,
  PowerType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

import { getR2CardImageUrl } from '../card-image-r2';

type ChongJiaShengFaceSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  imageUrl: string;
};

const CHONG_JIA_SHENG_LOGIC_GROUP_KEY = 'pokemon:虫甲圣:P0954:H:hp70:球形护盾:bench-shield';

const chongJiaShengFaceSeeds: ChongJiaShengFaceSeed[] = [
  {
    id: 16197,
    collectionNumber: '031/204',
    rarityLabel: 'U',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/88.png',
  },
  {
    id: 16455,
    collectionNumber: '031/204',
    rarityLabel: 'U☆★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/89.png',
  },
  {
    id: 16628,
    collectionNumber: '031/204',
    rarityLabel: 'U★★★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/90.png',
  },
];

const defaultFace = chongJiaShengFaceSeeds[0];

function createChongJiaShengRawData(seed: ChongJiaShengFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '虫甲圣',
      yorenCode: 'P0954',
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
        hp: 70,
        evolveText: '1阶进化',
        weakness: '火 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: seed.imageUrl,
      ruleLines: [],
      attacks: [
        {
          id: 547,
          name: '精神强念',
          text: '追加造成对手战斗宝可梦身上附着的能量数量×30伤害。',
          cost: ['草'],
          damage: '10+',
        },
      ],
      features: [
        {
          id: 83,
          name: '球形护盾',
          text: '只要这只宝可梦在场上，自己所有的备战宝可梦，不受到对手宝可梦的招式的伤害和效果影响。',
        },
      ],
      illustratorNames: ['mingo'],
      pokemonCategory: '滚动宝可梦',
      pokedexCode: '0954',
      pokedexText:
        '为了能让睡在球里面的宝宝睡得更香甜，会用脚转动球，让宝宝感到安心。',
      height: 0.3,
      weight: 3.5,
      deckRuleLimit: null,
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: getR2CardImageUrl(seed.id),
    logic_group_key: CHONG_JIA_SHENG_LOGIC_GROUP_KEY,
    variant_group_key: CHONG_JIA_SHENG_LOGIC_GROUP_KEY,
    variant_group_size: chongJiaShengFaceSeeds.length,
  };
}

export class ChongJiaSheng extends PokemonCard {
  public rawData: any;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '虫滚泥';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 70;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '球形护盾',
      powerType: PowerType.ABILITY,
      text: '只要这只宝可梦在场上，自己所有的备战宝可梦，不受到对手宝可梦的招式的伤害和效果影响。',
    },
  ];

  public attacks = [
    {
      name: '精神强念',
      cost: [CardType.GRASS],
      damage: '10+',
      text: '追加造成对手战斗宝可梦身上附着的能量数量×30伤害。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '虫甲圣';

  public fullName: string = '';

  constructor(seed: ChongJiaShengFaceSeed = defaultFace) {
    super();
    this.rawData = createChongJiaShengRawData(seed);
    this.fullName = `虫甲圣 ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AbstractAttackEffect) {
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);
      if (pokemonSlot === undefined) {
        return state;
      }

      const owner = StateUtils.findOwner(state, pokemonSlot);
      if (owner === undefined || effect.player === owner) {
        return state;
      }

      if (!owner.bench.includes(effect.target)) {
        return state;
      }

      effect.preventDefault = true;
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;
      effect.damage += opponent.active.energies.cards.length * 30;
      return state;
    }

    return state;
  }
}

export function createChongJiaShengVariants(): ChongJiaSheng[] {
  return chongJiaShengFaceSeeds.map(seed => new ChongJiaSheng(seed));
}
