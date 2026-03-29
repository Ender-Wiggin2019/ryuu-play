import {
  Card,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  GameMessage,
  PokemonCard,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  State,
  StateUtils,
  StoreLike,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function getMatchingCards(
  cards: Card[],
  predicate: (card: Card) => boolean,
): { blocked: number[]; available: number } {
  const blocked: number[] = [];
  let available = 0;

  cards.forEach((card, index) => {
    if (predicate(card)) {
      available += 1;
      return;
    }

    blocked.push(index);
  });

  return { blocked, available };
}

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const selected: Card[] = [];

  const categories = [
    (card: Card) => card instanceof PokemonCard,
    (card: Card) => card instanceof TrainerCard && card.trainerType === TrainerType.TOOL,
    (card: Card) => card instanceof TrainerCard && card.trainerType === TrainerType.STADIUM,
    (card: Card) => card instanceof EnergyCard,
  ];

  for (const predicate of categories) {
    const { blocked, available } = getMatchingCards(player.discard.cards, predicate);
    if (available === 0) {
      continue;
    }

    let cards: Card[] = [];
    yield store.prompt(
      state,
      new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_DECK,
        player.discard,
        {},
        { min: 0, max: 1, allowCancel: true, blocked },
      ),
      result => {
        cards = result || [];
        next();
      },
    );

    if (cards.length > 0) {
      selected.push(cards[0]);
    }
  }

  if (selected.length > 0) {
    yield store.prompt(
      state,
      new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selected),
      () => next(),
    );
    player.discard.moveCardsTo(selected, player.deck);
  }

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class BinMingDeHouYuan extends VariantTrainerCard {
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
