import {
  Card,
  CardList,
  ChooseCardsPrompt,
  CardType,
  Effect,
  EnergyCard,
  GameMessage,
  PokemonCard,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function getBlocked(cards: Card[]): { blocked: number[]; available: number } {
  const blocked: number[] = [];
  let available = 0;

  cards.forEach((card, index) => {
    const matches =
      (card instanceof PokemonCard && card.cardTypes.includes(CardType.WATER)) ||
      (card instanceof EnergyCard && card.provides.includes(CardType.WATER));

    if (matches) {
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
  const deckCount = player.deck.cards.length;
  const topCards = new CardList();
  topCards.cards = player.deck.cards.splice(0, Math.min(7, deckCount));
  const { blocked, available } = getBlocked(topCards.cards);

  let selected: Card[] = [];
  if (available > 0) {
    yield store.prompt(
      state,
      new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_HAND,
        topCards,
        {},
        { min: 0, max: available, allowCancel: false, blocked },
      ),
      cards => {
        selected = cards || [];
        next();
      },
    );
  }

  if (selected.length > 0) {
    topCards.moveCardsTo(selected, player.hand);
    yield store.prompt(
      state,
      new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selected),
      () => next(),
    );
  }

  topCards.moveTo(player.deck);

  if (deckCount > 0) {
    return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
      player.deck.applyOrder(order);
    });
  }

  return state;
}

export class XiaoSong extends VariantTrainerCard {
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
