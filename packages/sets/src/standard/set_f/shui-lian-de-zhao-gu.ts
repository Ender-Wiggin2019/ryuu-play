import {
  Card,
  CardTag,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameMessage,
  PokemonCard,
  ShowCardsPrompt,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function isRuleBoxPokemon(card: PokemonCard): boolean {
  if (card.tags.includes(CardTag.POKEMON_EX)
    || card.tags.includes(CardTag.POKEMON_V)
    || card.tags.includes(CardTag.POKEMON_VSTAR)
    || card.tags.includes(CardTag.POKEMON_LV_X)
    || card.tags.includes(CardTag.RADIANT)
    || card.tags.includes(CardTag.POKEMON_SP)
    || card.tags.includes(CardTag.POKEMON_GX)) {
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

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const blocked: number[] = [];
  let available = 0;

  player.discard.cards.forEach((card, index) => {
    const isPokemon = card instanceof PokemonCard && !isRuleBoxPokemon(card);
    const isBasicEnergy = card instanceof EnergyCard && card.energyType === EnergyType.BASIC;
    if (isPokemon || isBasicEnergy) {
      available += 1;
      return;
    }
    blocked.push(index);
  });

  if (available === 0) {
    return state;
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.discard,
      {},
      { min: 0, max: Math.min(3, available), allowCancel: false, blocked }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length > 0) {
    player.discard.moveCardsTo(selected, player.hand);
    yield store.prompt(state, new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selected), () =>
      next()
    );
  }

  return state;
}

export class ShuiLianDeZhaoGu extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
