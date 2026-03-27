import {
  CardTag,
  CheckHpEffect,
  Effect,
  GamePhase,
  KnockOutEffect,
  PokemonCard,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function isRuleBoxPokemon(card: PokemonCard | undefined): boolean {
  if (card === undefined) {
    return false;
  }

  if (card.tags.includes(CardTag.POKEMON_EX)
    || card.tags.includes(CardTag.POKEMON_V)
    || card.tags.includes(CardTag.POKEMON_VSTAR)
    || card.tags.includes(CardTag.POKEMON_LV_X)
    || card.tags.includes(CardTag.RADIANT)
    || card.tags.includes(CardTag.POKEMON_SP)
    || card.tags.includes(CardTag.POKEMON_GX)
    || card.tags.includes(CardTag.TERA)) {
    return true;
  }

  const rawData = card as any;
  const labels = [
    rawData.rawData?.raw_card?.details?.pokemonTypeLabel,
    rawData.rawData?.api_card?.pokemonTypeLabel,
  ];

  return labels.some((label: unknown) => typeof label === 'string' && (
    label.includes('宝可梦ex')
    || label.includes('宝可梦VSTAR')
    || label.includes('宝可梦VMAX')
    || label.includes('光辉宝可梦')
    || label.includes('宝可梦V')
    || label.includes('宝可梦GX')
    || label.includes('宝可梦SP')
  ));
}

const defaultSeed: VariantTrainerSeed = {
  set: 'set_g',
  name: '豪华斗篷',
  fullName: '豪华斗篷 CSV4C',
  text: '身上放有这张卡牌的宝可梦（除「拥有规则的宝可梦」外）的最大HP「+100」，当该宝可梦，受到对手宝可梦的招式的伤害而【昏厥】时，对手拿取的奖赏卡将增加1张。\n在自己的回合可以将任意张宝可梦道具卡，放于自己的宝可梦身上。每只宝可梦身上只可以放1张宝可梦道具卡，并保持附加状态。',
  trainerType: TrainerType.TOOL,
  rawData: {
    raw_card: {
      id: 14403,
      name: '豪华斗篷',
      yorenCode: 'Y1318',
      cardType: '2',
      commodityCode: 'CSV4C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '164/129',
        rarityLabel: 'UR',
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
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/393.png',
      ruleLines: [
        '身上放有这张卡牌的宝可梦（除「拥有规则的宝可梦」外）的最大HP「+100」，当该宝可梦，受到对手宝可梦的招式的伤害而【昏厥】时，对手拿取的奖赏卡将增加1张。',
        '在自己的回合可以将任意张宝可梦道具卡，放于自己的宝可梦身上。每只宝可梦身上只可以放1张宝可梦道具卡，并保持附加状态。',
      ],
      attacks: [],
      features: [],
    },
    collection: {
      id: 285,
      commodityCode: 'CSV4C',
      name: '补充包 嘉奖回合',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/393.png',
  },
};

export class HaoHuaDouPeng extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckHpEffect && effect.target.trainers.cards.includes(this)) {
      const pokemon = effect.target.getPokemonCard();
      if (!isRuleBoxPokemon(pokemon)) {
        effect.hp += 100;
      }
    }

    if (effect instanceof KnockOutEffect && effect.target.trainers.cards.includes(this)) {
      if (state.phase !== GamePhase.ATTACK) {
        return state;
      }

      const owner = StateUtils.findOwner(state, effect.target);
      const pokemon = effect.target.getPokemonCard();
      if (effect.player !== owner && !isRuleBoxPokemon(pokemon)) {
        effect.prizeCount += 1;
      }
    }

    return state;
  }
}
