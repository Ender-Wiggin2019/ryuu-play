import {
  CardTag,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  PutDamageEffect,
  State,
  StateUtils,
  StoreLike,
  UseStadiumEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function hasPokemonTypeLabel(card: PokemonCard | undefined, label: string): boolean {
  if (card === undefined) {
    return false;
  }

  const rawData = card as any;
  const labels = [
    rawData.rawData?.raw_card?.details?.pokemonTypeLabel,
    rawData.rawData?.api_card?.pokemonTypeLabel,
  ];

  return labels.some((value: unknown) => typeof value === 'string' && value.includes(label));
}

function hasRuleBox(card: PokemonCard | undefined): boolean {
  return !!card && ([
    CardTag.POKEMON_EX,
    CardTag.POKEMON_V,
    CardTag.POKEMON_VSTAR,
    CardTag.POKEMON_GX,
    CardTag.POKEMON_LV_X,
    CardTag.RADIANT,
  ].some(tag => card.tags.includes(tag)) || hasPokemonTypeLabel(card, '宝可梦VMAX'));
}

function isExOrVPokemon(card: PokemonCard | undefined): boolean {
  return !!card && (
    [CardTag.POKEMON_EX, CardTag.POKEMON_V, CardTag.POKEMON_VSTAR].some(tag => card.tags.includes(tag))
    || hasPokemonTypeLabel(card, '宝可梦VMAX')
  );
}

export class ZhongLiZhongXin extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PutDamageEffect && StateUtils.getStadiumCard(state) === this) {
      const targetCard = effect.target.getPokemonCard();
      const sourceCard = effect.source.getPokemonCard();
      const sourceOwner = StateUtils.findOwner(state, effect.source);
      const targetOwner = StateUtils.findOwner(state, effect.target);

      if (sourceOwner !== undefined && targetOwner !== undefined && sourceOwner !== targetOwner) {
        if (!hasRuleBox(targetCard) && isExOrVPokemon(sourceCard)) {
          effect.preventDefault = true;
          return state;
        }
      }
    }

    if (effect instanceof UseStadiumEffect && StateUtils.getStadiumCard(state) === this) {
      throw new GameError(GameMessage.CANNOT_USE_STADIUM);
    }

    return state;
  }
}
