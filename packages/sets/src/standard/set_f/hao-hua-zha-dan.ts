import {
  AfterDamageEffect,
  CardTag,
  Effect,
  GamePhase,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_h',
  name: '豪华炸弹',
  fullName: '豪华炸弹 CSV8C',
  text: '身上放有这张卡牌的宝可梦，在战斗场上受到对手宝可梦的招式的伤害时，给使用了招式的宝可梦身上放置12个伤害指示物。然后，将这张卡牌放于弃牌区。\n在自己的回合可以将任意张宝可梦道具卡，放于自己的宝可梦身上。每只宝可梦身上只可以放1张宝可梦道具卡，并保持附加状态。',
  trainerType: TrainerType.TOOL,
  tags: [CardTag.ACE_SPEC],
  rawData: {
    raw_card: {
      id: 17566,
      name: '豪华炸弹',
      yorenCode: 'Y1478',
      cardType: '2',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '189/207',
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
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/508.png',
      ruleLines: [
        '身上放有这张卡牌的宝可梦，在战斗场上受到对手宝可梦的招式的伤害时，给使用了招式的宝可梦身上放置12个伤害指示物。然后，将这张卡牌放于弃牌区。',
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
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/508.png',
  },
};

export class HaoHuaZhaDan extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AfterDamageEffect && effect.target.trainers.cards.includes(this)) {
      if (state.phase !== GamePhase.ATTACK) {
        return state;
      }

      const owner = StateUtils.findOwner(state, effect.target);
      if (effect.damage <= 0 || effect.player === owner || owner.active !== effect.target) {
        return state;
      }

      effect.source.damage += 120;
      effect.target.trainers.moveCardTo(this, owner.discard);
    }

    return state;
  }
}
