import {
  Effect,
  MoveDeckCardsToDiscardEffect,
  State,
  StateUtils,
  StoreLike,
  TrainerType
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_g',
  name: '巡逻帽',
  fullName: '巡逻帽 118/129#15040',
  text: '只要身上放有这张卡牌的宝可梦在战斗场上，自己的牌库，就不会受到因对手的招式、特性、物品、宝可梦道具、支援者而导致的将牌库的卡牌放于弃牌区的效果影响。\n在自己的回合可以将任意张宝可梦道具卡，放于自己的宝可梦身上。每只宝可梦身上只可以放1张宝可梦道具卡，并保持附加状态。',
  trainerType: TrainerType.TOOL,
  rawData: {
    raw_card: {
      id: 15040,
      name: '巡逻帽',
      yorenCode: 'Y1346',
      cardType: '2',
      commodityCode: 'CSV5C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '118/129',
        rarityLabel: 'U★★★',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '宝可梦道具',
        attributeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: null,
        evolveText: null,
        weakness: null,
        resistance: null,
        retreatCost: null
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/298/325.png',
      ruleLines: [
        '只要身上放有这张卡牌的宝可梦在战斗场上，自己的牌库，就不会受到因对手的招式、特性、物品、宝可梦道具、支援者而导致的将牌库的卡牌放于弃牌区的效果影响。',
        '在自己的回合可以将任意张宝可梦道具卡，放于自己的宝可梦身上。每只宝可梦身上只可以放1张宝可梦道具卡，并保持附加状态。'
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Toyste Beach'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null
    },
    collection: {
      id: 298,
      commodityCode: 'CSV5C',
      name: '补充包 黑晶炽诚',
      commodityNames: ['补充包 黑晶炽诚']
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/298/325.png'
  }
};

export class XunLuoMao extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof MoveDeckCardsToDiscardEffect) {
      const cardList = StateUtils.findCardList(state, this);
      const owner = StateUtils.findOwner(state, cardList);

      if (owner !== undefined
        && owner === effect.targetPlayer
        && effect.player !== owner
        && owner.active.trainers.cards.includes(this)) {
        effect.preventDefault = true;
      }
    }

    return state;
  }
}
