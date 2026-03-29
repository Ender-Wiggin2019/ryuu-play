import { DealDamageEffect, Effect, SpecialCondition, State, StoreLike, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_h',
  name: '锁链粘糕',
  fullName: '锁链粘糕 CSV8C',
  text: '身上放有这张卡牌的处于【中毒】状态的宝可梦所使用的招式，给对手的战斗宝可梦造成的伤害「+40」。\n在自己的回合可以将任意张宝可梦道具卡，放于自己的宝可梦身上。每只宝可梦身上只可以放1张宝可梦道具卡，并保持附加状态。',
  trainerType: TrainerType.TOOL,
  rawData: {
    raw_card: {
      id: 17976,
      name: '锁链粘糕',
      yorenCode: 'Y1476',
      cardType: '2',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '187/207',
        rarityLabel: 'U★★',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '宝可梦道具',
        specialCardLabel: null,
        attributeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        hp: null,
        evolveText: null,
        weakness: null,
        resistance: null,
        retreatCost: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/504.png',
      ruleLines: [
        '身上放有这张卡牌的处于【中毒】状态的宝可梦所使用的招式，给对手的战斗宝可梦造成的伤害「+40」。',
        '在自己的回合可以将任意张宝可梦道具卡，放于自己的宝可梦身上。每只宝可梦身上只可以放1张宝可梦道具卡，并保持附加状态。',
      ],
      attacks: [],
      features: [],
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/504.png',
  },
};

export class SuoLianZhanGao extends VariantTrainerCard {
  public trainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof DealDamageEffect
      && effect.source.trainers.cards.includes(this)
      && effect.source.specialConditions.includes(SpecialCondition.POISONED)
      && effect.damage > 0) {
      effect.damage += 40;
    }

    return state;
  }
}
