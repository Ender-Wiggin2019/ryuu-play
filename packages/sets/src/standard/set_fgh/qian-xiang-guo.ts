import { CardType, DealDamageEffect, Effect, State, StateUtils, StoreLike, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_h',
  name: '千香果',
  fullName: '千香果 184/204#16755',
  text: '身上放有这张卡牌的宝可梦，受到对手【水】宝可梦的招式的伤害时，那个伤害「-60」，将这张卡牌放于弃牌区。\n在自己的回合可以将任意张宝可梦道具卡，放于自己的宝可梦身上。每只宝可梦身上只可以放1张宝可梦道具卡，并保持附加状态。',
  trainerType: TrainerType.TOOL,
  rawData: {
    raw_card: {
      id: 16755,
      name: '千香果',
      yorenCode: 'Y1410',
      cardType: '2',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '184/204',
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
        retreatCost: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/497.png',
      ruleLines: [
        '身上放有这张卡牌的宝可梦，受到对手【水】宝可梦的招式的伤害时，那个伤害「-60」，将这张卡牌放于弃牌区。',
        '在自己的回合可以将任意张宝可梦道具卡，放于自己的宝可梦身上。每只宝可梦身上只可以放1张宝可梦道具卡，并保持附加状态。',
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
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/497.png',
  },
};

export class QianXiangGuo extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof DealDamageEffect && effect.target.trainers.cards.includes(this)) {
      const owner = StateUtils.findOwner(state, effect.target);
      const sourcePokemon = effect.source.getPokemonCard();
      if (effect.player !== owner && effect.damage > 0 && sourcePokemon?.cardTypes.includes(CardType.WATER)) {
        effect.damage = Math.max(0, effect.damage - 60);
        effect.target.trainers.moveCardTo(this, owner.discard);
      }
    }

    return state;
  }
}
