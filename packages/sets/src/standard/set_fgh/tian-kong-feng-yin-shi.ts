import {
  CardTag,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  KnockOutEffect,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
  UseTrainerInPlayEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const VSTAR_POWER_USED_MARKER = 'TIAN_KONG_FENG_YIN_SHI_USED_MARKER';
const TURN_EFFECT_MARKER = 'TIAN_KONG_FENG_YIN_SHI_TURN_MARKER';

function isBasicPokemonV(card: PokemonCard | undefined): boolean {
  if (card === undefined) {
    return false;
  }

  return card.stage === Stage.BASIC && card.tags.includes(CardTag.POKEMON_V);
}

function isVStarOrVMaxPokemon(card: PokemonCard | undefined): boolean {
  if (card === undefined) {
    return false;
  }

  if (card.tags.includes(CardTag.POKEMON_VSTAR)) {
    return true;
  }

  const rawData = card as any;
  const labels = [
    rawData.rawData?.raw_card?.details?.pokemonTypeLabel,
    rawData.rawData?.api_card?.pokemonTypeLabel,
  ];

  return labels.some((label: unknown) => typeof label === 'string' && label.includes('宝可梦VMAX'));
}

const defaultSeed: VariantTrainerSeed = {
  set: 'set_f',
  name: '天空封印石',
  fullName: '天空封印石 CS6aC',
  text:
    '宝可梦道具可以附着在自己的宝可梦身上。每只宝可梦身上只可以附着1张宝可梦道具，并保持附加状态。\n' +
    '身上放有这张卡牌的「宝可梦V」，可以使用这个【VSTAR】力量。\n' +
    '[特性] 星耀指令\n' +
    '在自己的回合可以使用。在这个回合，如果因为自己【基础】宝可梦的「宝可梦V」所使用的招式的伤害，而导致对手战斗场上的「宝可梦【VSTAR】・【VMAX】」【昏厥】了的话，则多拿取1张奖赏卡。[对战中，己方的【VSTAR】力量只能使用1次。]\n' +
    '在自己的回合可以使用任意张物品卡。',
  trainerType: TrainerType.TOOL,
  rawData: {
    raw_card: {
      id: 10854,
      name: '天空封印石',
      yorenCode: 'Y1133',
      cardType: '2',
      commodityCode: 'CS6aC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '123/131',
        rarityLabel: 'R☆★',
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
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/208/222.png',
      ruleLines: [
        '宝可梦道具可以附着在自己的宝可梦身上。每只宝可梦身上只可以附着1张宝可梦道具，并保持附加状态。',
        '身上放有这张卡牌的「宝可梦V」，可以使用这个【VSTAR】力量。',
        '[特性] 星耀指令',
        '在自己的回合可以使用。在这个回合，如果因为自己【基础】宝可梦的「宝可梦V」所使用的招式的伤害，而导致对手战斗场上的「宝可梦【VSTAR】・【VMAX】」【昏厥】了的话，则多拿取1张奖赏卡。[对战中，己方的【VSTAR】力量只能使用1次。]',
        '在自己的回合可以使用任意张物品卡。',
      ],
      attacks: [],
      features: [],
      illustratorNames: ['AYUMI ODASHIMA'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 208,
      commodityCode: 'CS6aC',
      name: '补充包 碧海暗影 啸',
      commodityNames: ['补充包 碧海暗影 啸'],
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/208/222.png',
  },
};

function useTrainer(state: State, effect: UseTrainerInPlayEffect): State {
  const player = effect.player;
  const pokemon = effect.target.getPokemonCard();

  if (!isBasicPokemonV(pokemon)) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  if (player.marker.hasMarker(VSTAR_POWER_USED_MARKER, effect.trainerCard)) {
    throw new GameError(GameMessage.POWER_ALREADY_USED);
  }

  player.marker.addMarker(VSTAR_POWER_USED_MARKER, effect.trainerCard);
  player.marker.addMarker(TURN_EFFECT_MARKER, effect.trainerCard);
  return state;
}

export class TianKongFengYinShi extends VariantTrainerCard {
  public useWhenInPlay = true;
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
    this.useWhenInPlay = true;
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof UseTrainerInPlayEffect && effect.trainerCard === this) {
      return useTrainer(state, effect);
    }

    if (effect instanceof KnockOutEffect && effect.player.marker.hasMarker(TURN_EFFECT_MARKER, this)) {
      const source = effect.player.active.getPokemonCard();
      if (isBasicPokemonV(source) && effect.target === StateUtils.getOpponent(state, effect.player).active
        && isVStarOrVMaxPokemon(effect.target.getPokemonCard())) {
        effect.prizeCount += 1;
      }
      return state;
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(TURN_EFFECT_MARKER, this)) {
      effect.player.marker.removeMarker(TURN_EFFECT_MARKER, this);
      return state;
    }

    return state;
  }
}
