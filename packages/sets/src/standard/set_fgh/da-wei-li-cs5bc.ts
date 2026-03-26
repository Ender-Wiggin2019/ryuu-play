import {
  CardType,
  Effect,
  MoveDeckCardsToDiscardEffect,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

type DaWeiLiSafeDamFaceSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
};

const SAFE_DAM_LOGIC_GROUP_KEY = 'pokemon:da-wei-li:p400:dam-builder';
const SAFE_DAM_VARIANT_GROUP_KEY = 'pokemon:da-wei-li:p400:dam-builder:f';
const SAFE_DAM_VARIANT_GROUP_SIZE = 2;

function createDaWeiLiSafeDamRawData(seed: DaWeiLiSafeDamFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '大尾狸',
      yorenCode: 'P400',
      cardType: '1',
      commodityCode: 'CS5bC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        specialCardLabel: null,
        hp: 110,
        evolveText: '1阶进化',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: `/api/v1/cards/${seed.id}/image`,
      ruleLines: [],
      attacks: [
        {
          id: 9342,
          name: '头突',
          text: '',
          cost: ['COLORLESS', 'COLORLESS', 'COLORLESS'],
          damage: '80',
        },
      ],
      features: [
        {
          id: 1242,
          name: '安心水坝',
          text: '只要这只宝可梦在备战区，自己的牌库，就不会受到因对手的招式、特性、物品、支援者而导致的将牌库的卡牌放于弃牌区的效果影响。',
        },
      ],
    },
    collection: {
      id: 182,
      commodityCode: 'CS5bC',
      name: '补充包 勇魅群星 勇',
    },
    image_url: `http://localhost:3000/api/v1/cards/${seed.id}/image`,
    logic_group_key: SAFE_DAM_LOGIC_GROUP_KEY,
    variant_group_key: SAFE_DAM_VARIANT_GROUP_KEY,
    variant_group_size: SAFE_DAM_VARIANT_GROUP_SIZE,
  };
}

export class DaWeiLiCs5bC extends PokemonCard {
  public rawData = createDaWeiLiSafeDamRawData({
    id: 9769,
    collectionNumber: '112/128',
    rarityLabel: 'C☆★',
  });

  public stage: Stage = Stage.STAGE_1;
  public evolvesFrom = '大牙狸';
  public cardTypes: CardType[] = [CardType.COLORLESS];
  public hp: number = 110;
  public weakness = [{ type: CardType.FIGHTING }];
  public retreat = [CardType.COLORLESS, CardType.COLORLESS];
  public attacks = [
    {
      name: '头突',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '80',
      text: '',
    },
  ];

  public set: string = 'set_f';
  public name: string = '大尾狸';
  public fullName: string = '大尾狸 112/128#9769';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof MoveDeckCardsToDiscardEffect) {
      const cardList = StateUtils.findCardList(state, this);
      const owner = StateUtils.findOwner(state, cardList);
      const slot = StateUtils.findPokemonSlot(state, this);
      const isOnBench = slot !== undefined && owner.bench.includes(slot);

      if (owner !== undefined
        && isOnBench
        && effect.targetPlayer === owner
        && effect.player !== owner) {
        effect.preventDefault = true;
      }
    }

    return state;
  }
}

export class DaWeiLiCs5bCCommon extends DaWeiLiCs5bC {
  public rawData = createDaWeiLiSafeDamRawData({
    id: 9616,
    collectionNumber: '112/128',
    rarityLabel: 'C',
  });

  public fullName: string = '大尾狸 112/128#9616';
}
