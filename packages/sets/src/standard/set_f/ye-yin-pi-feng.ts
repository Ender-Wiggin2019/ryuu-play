import {
  Effect,
  State,
  StoreLike,
  TrainerEffect,
  TrainerType
} from '@ptcg/common';

import { isProtectedFromOpponentSupporter } from '../../common/trainers/supporter-target-protection';
import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_f',
  name: '叶隐披风',
  fullName: '叶隐披风 177/128#9681',
  text: '身上放有这张卡牌的「宝可梦【VSTAR】・【VMAX】」，当对手从手牌使出支援者时，不受其效果影响。\n在自己的回合可以将任意张宝可梦道具卡，放于自己的宝可梦身上。每只宝可梦身上只可以放1张宝可梦道具卡，并保持附加状态。',
  trainerType: TrainerType.TOOL,
  rawData: {
    raw_card: {
      id: 9681,
      name: '叶隐披风',
      yorenCode: 'Y991',
      cardType: '2',
      commodityCode: 'CS5bC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '177/128',
        rarityLabel: 'UR',
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
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/182/278.png',
      ruleLines: [
        '宝可梦道具可以附着在自己的宝可梦身上。每只宝可梦身上只可以附着1张宝可梦道具，并保持附加状态。',
        '身上放有这张卡牌的「宝可梦【VSTAR】・【VMAX】」，当对手从手牌使出支援者时，不受其效果影响。',
        '在自己的回合可以使用任意张物品卡。'
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Studio Bora Inc.'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null
    },
    collection: {
      id: 182,
      commodityCode: 'CS5bC',
      name: '补充包 勇魅群星 勇',
      commodityNames: ['补充包 勇魅群星 勇']
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/182/278.png'
  }
};

function isProtectedTarget(self: YeYinPiFeng, state: State, effect: TrainerEffect): boolean {
  const target = effect.target;
  if (target === undefined || !target.trainers.cards.includes(self)) {
    return false;
  }
  return isProtectedFromOpponentSupporter(state, effect.player.id, target);
}

export class YeYinPiFeng extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect
      && effect.trainerCard.trainerType === TrainerType.SUPPORTER
      && isProtectedTarget(this, state, effect)) {
      effect.preventDefault = true;
    }

    return state;
  }
}
