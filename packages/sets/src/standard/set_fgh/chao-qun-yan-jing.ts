import {
  ApplyWeaknessEffect,
  CheckPokemonStatsEffect,
  CheckPokemonTypeEffect,
  Effect,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_f',
  name: '超群眼镜',
  fullName: '超群眼镜 CS5aC',
  text: '宝可梦道具可以附着在自己的宝可梦身上。每只宝可梦身上只可以附着1张宝可梦道具，并保持附加状态。\n身上放有这张卡牌的宝可梦使用招式的伤害，在计算对手战斗宝可梦的弱点时，其弱点按照「×3」计算。\n在自己的回合可以使用任意张物品卡。',
  trainerType: TrainerType.TOOL,
  rawData: {
    raw_card: {
      id: 9902,
      name: '超群眼镜',
      yorenCode: 'Y1025',
      cardType: '2',
      commodityCode: 'CS5aC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '118/127',
        rarityLabel: 'U',
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
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/183/206.png',
      ruleLines: [
        '宝可梦道具可以附着在自己的宝可梦身上。每只宝可梦身上只可以附着1张宝可梦道具，并保持附加状态。',
        '身上放有这张卡牌的宝可梦使用招式的伤害，在计算对手战斗宝可梦的弱点时，其弱点按照「×3」计算。',
        '在自己的回合可以使用任意张物品卡。',
      ],
      attacks: [],
      features: [],
    },
    collection: {
      id: 183,
      commodityCode: 'CS5aC',
      name: '补充包 勇魅群星 魅',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/183/206.png',
  },
};

export class ChaoQunYanJing extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: ApplyWeaknessEffect): State;
  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof ApplyWeaknessEffect && effect.source.trainers.cards.includes(this)) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (effect.target !== opponent.active || effect.damage <= 0) {
        return state;
      }

      const checkPokemonType = new CheckPokemonTypeEffect(effect.source);
      store.reduceEffect(state, checkPokemonType);

      const checkPokemonStats = new CheckPokemonStatsEffect(effect.target);
      store.reduceEffect(state, checkPokemonStats);

      const hasWeakness = checkPokemonStats.weakness.some(weakness => checkPokemonType.cardTypes.includes(weakness.type));
      if (hasWeakness) {
        effect.ignoreWeakness = true;
        effect.damage *= 3;
      }
    }

    return state;
  }
}
