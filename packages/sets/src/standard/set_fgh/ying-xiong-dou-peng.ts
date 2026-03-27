import { CardTag, CheckHpEffect, Effect, State, StoreLike, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_h',
  name: '英雄斗篷',
  fullName: '英雄斗篷 CSV7C',
  text: '身上放有这张卡牌的宝可梦的最大HP「+100」。\n在自己的回合可以将任意张宝可梦道具卡，放于自己的宝可梦身上。每只宝可梦身上只可以放1张宝可梦道具卡，并保持附加状态。',
  trainerType: TrainerType.TOOL,
  tags: [CardTag.ACE_SPEC],
  rawData: {
    raw_card: {
      id: 16353,
      name: '英雄斗篷',
      yorenCode: 'Y1413',
      cardType: '2',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '187/204',
        rarityLabel: 'ACE',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '宝可梦道具',
        specialCardLabel: 'ACE SPEC',
        attributeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        hp: null,
        evolveText: null,
        weakness: null,
        resistance: null,
        retreatCost: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/502.png',
      ruleLines: [
        '身上放有这张卡牌的宝可梦的最大HP「+100」。',
        '在自己的回合可以将任意张宝可梦道具卡，放于自己的宝可梦身上。每只宝可梦身上只可以放1张宝可梦道具卡，并保持附加状态。',
      ],
      attacks: [],
      features: [],
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/502.png',
  },
};

export class YingXiongDouPeng extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckHpEffect && effect.target.trainers.cards.includes(this)) {
      effect.hp += 100;
    }

    return state;
  }
}
