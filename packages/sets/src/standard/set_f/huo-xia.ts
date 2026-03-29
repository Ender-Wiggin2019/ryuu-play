import {
  Card,
  CardTag,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  ShuffleDeckPrompt,
  Stage,
  State,
  StoreLike,
  SuperType,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function isRuleBoxPokemon(card: PokemonCard): boolean {
  return card.tags.includes(CardTag.POKEMON_EX)
    || card.tags.includes(CardTag.POKEMON_V)
    || card.tags.includes(CardTag.POKEMON_VSTAR)
    || card.tags.includes(CardTag.POKEMON_GX)
    || card.tags.includes(CardTag.POKEMON_LV_X);
}

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const blocked: number[] = [];

  player.deck.cards.forEach((card, index) => {
    if (!(card instanceof PokemonCard && card.stage !== Stage.BASIC && card.stage !== Stage.RESTORED && !isRuleBoxPokemon(card))) {
      blocked.push(index);
    }
  });

  if (blocked.length === player.deck.cards.length) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.deck,
      { superType: SuperType.POKEMON },
      { min: 1, max: 3, allowCancel: false, blocked }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  player.deck.moveCardsTo(selected, player.hand);
  yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });

  return state;
}

export class HuoXia extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

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
