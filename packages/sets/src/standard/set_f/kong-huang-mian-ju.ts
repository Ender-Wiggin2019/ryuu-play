import { CheckHpEffect, DealDamageEffect, Effect, State, StoreLike, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_f',
  name: '恐慌面具',
  fullName: '恐慌面具 CS6.5C',
  text:
    '身上放有这张卡牌的宝可梦，不会受到对手剩余HP在「40」点以下（包含40点）的宝可梦的招式的伤害。\n' +
    '在自己的回合可以使用任意张物品卡。',
  trainerType: TrainerType.TOOL,
  rawData: {
    raw_card: {
      id: 11080,
      name: '恐慌面具',
      yorenCode: 'Y1171',
      cardType: '2',
      commodityCode: 'CS6.5C',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '065/072',
        rarityLabel: 'U☆★',
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
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/222/114.png',
      ruleLines: [
        '宝可梦道具可以附着在自己的宝可梦身上。每只宝可梦身上只可以附着1张宝可梦道具，并保持附加状态。',
        '身上放有这张卡牌的宝可梦，不会受到对手剩余HP在「40」点以下（包含40点）的宝可梦的招式的伤害。',
        '在自己的回合可以使用任意张物品卡。',
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Studio Bora Inc.'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 222,
      commodityCode: 'CS6.5C',
      name: '强化包 胜象星引',
      commodityNames: ['强化包 胜象星引'],
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/222/114.png',
  },
};

export class KongHuangMianJu extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof DealDamageEffect && effect.target.trainers.cards.includes(this) && effect.damage > 0) {
      const checkHpEffect = new CheckHpEffect(effect.player, effect.source);
      store.reduceEffect(state, checkHpEffect);
      if (checkHpEffect.hp - effect.source.damage <= 40) {
        effect.damage = 0;
      }
    }

    return state;
  }
}
