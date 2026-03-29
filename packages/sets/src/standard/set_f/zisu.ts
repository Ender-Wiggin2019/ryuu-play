import {
  Card,
  CardType,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  TrainerCard,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const waterPokemonCount = player.deck.cards.filter(card =>
    card instanceof PokemonCard && card.cardTypes.includes(CardType.WATER)
  ).length;
  const itemCount = player.deck.cards.filter(card =>
    card instanceof TrainerCard && card.trainerType === TrainerType.ITEM
  ).length;

  if (waterPokemonCount === 0 || itemCount === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let waterCards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.deck,
      { superType: SuperType.POKEMON, cardTypes: [CardType.WATER] },
      { min: 1, max: 1, allowCancel: false }
    ),
    selected => {
      waterCards = selected || [];
      next();
    }
  );

  player.deck.moveCardsTo(waterCards, player.hand);

  let itemCards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.deck,
      { superType: SuperType.TRAINER, trainerType: TrainerType.ITEM },
      { min: 1, max: 1, allowCancel: false }
    ),
    selected => {
      itemCards = selected || [];
      next();
    }
  );

  player.deck.moveCardsTo(itemCards, player.hand);

  const opponent = StateUtils.getOpponent(state, player);
  if (waterCards.length > 0) {
    yield store.prompt(state, new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, waterCards), () =>
      next()
    );
  }
  if (itemCards.length > 0) {
    yield store.prompt(state, new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, itemCards), () =>
      next()
    );
  }

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class Zisu extends VariantTrainerCard {
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
