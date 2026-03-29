import {
  AbstractAttackEffect,
  AddSpecialConditionsEffect,
  AttackEffect,
  CardTag,
  CardType,
  Effect,
  PokemonCard,
  SpecialCondition,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type MiloticExFaceSeed = {
  id: number;
  collectionId: number;
  collectionName: string;
  commodityCode: string;
  collectionNumber: string;
  rarityLabel: string;
};

const miloticExFaceSeeds: MiloticExFaceSeed[] = [
  { id: 17434, collectionId: 458, collectionName: '补充包 璀璨诡幻', commodityCode: 'CSV8C', collectionNumber: '057/207', rarityLabel: 'RR' },
  { id: 17594, collectionId: 458, collectionName: '补充包 璀璨诡幻', commodityCode: 'CSV8C', collectionNumber: '217/207', rarityLabel: 'SR' },
  { id: 17621, collectionId: 458, collectionName: '补充包 璀璨诡幻', commodityCode: 'CSV8C', collectionNumber: '244/207', rarityLabel: 'SAR' },
];

const defaultFace = miloticExFaceSeeds[0];

function createMiloticExRawData(seed: MiloticExFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '美纳斯ex',
      yorenCode: 'Y1446',
      cardType: '1',
      commodityCode: seed.commodityCode,
      details: {
        regulationMarkText: 'H',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '水',
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: null,
        hp: 270,
        evolveText: '1阶进化',
        weakness: '雷 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: getCardImageUrl(seed.id),
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 92,
          name: '催眠飞溅',
          text: '令对手的战斗宝可梦陷入【睡眠】状态。',
          cost: ['水', '无色', '无色'],
          damage: '160',
        },
      ],
      features: [
        {
          id: 10,
          name: '璀璨鳞片',
          text: '这只宝可梦，不受到对手「太晶」宝可梦所使用招式的伤害和效果影响。',
        },
      ],
      illustratorNames: ['hncl'],
    },
    collection: {
      id: seed.collectionId,
      commodityCode: seed.commodityCode,
      name: seed.collectionName,
    },
    image_url: getR2CardImageUrl(seed.id),
  };
}

function isTeraPokemon(card: PokemonCard | undefined): boolean {
  if (card === undefined) {
    return false;
  }

  const rawData = card as any;
  return card.tags.includes(CardTag.TERA)
    || rawData.rawData?.raw_card?.details?.specialCardLabel === '太晶'
    || rawData.rawData?.api_card?.specialCardLabel === '太晶';
}

export class MeiNaSiEx extends PokemonCard {
  public rawData: any;

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '丑丑鱼';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp = 270;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance: { type: CardType; value: number }[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: '璀璨鳞片',
      powerType: 0 as any,
      text: '这只宝可梦，不受到对手「太晶」宝可梦所使用招式的伤害和效果影响。',
    },
  ];

  public attacks = [
    {
      name: '催眠飞溅',
      cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
      damage: '160',
      text: '令对手的战斗宝可梦陷入【睡眠】状态。',
    },
  ];

  public set = 'set_h';

  public name = '美纳斯ex';

  public fullName = '';

  constructor(seed: MiloticExFaceSeed = defaultFace) {
    super();
    this.rawData = createMiloticExRawData(seed);
    this.fullName = `美纳斯ex ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AbstractAttackEffect) {
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);
      if (pokemonSlot === undefined) {
        return state;
      }

      const owner = StateUtils.findOwner(state, pokemonSlot);
      if (effect.player === owner || effect.target !== pokemonSlot) {
        return state;
      }

      if (!isTeraPokemon(effect.source.getPokemonCard())) {
        return state;
      }

      effect.preventDefault = true;
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const sleep = new AddSpecialConditionsEffect(effect, [SpecialCondition.ASLEEP]);
      sleep.target = effect.opponent.active;
      return store.reduceEffect(state, sleep);
    }

    return state;
  }
}

export function createMeiNaSiExVariants(): MeiNaSiEx[] {
  return miloticExFaceSeeds.map(seed => new MeiNaSiEx(seed));
}

