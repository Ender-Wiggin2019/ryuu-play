import {
  Card,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  PokemonCard,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const handBlocked: number[] = [];
  let handPokemonCount = 0;

  player.hand.cards.forEach((card, index) => {
    if (card instanceof PokemonCard) {
      handPokemonCount += 1;
      return;
    }
    handBlocked.push(index);
  });

  let selectedFromHand: Card[] = [];
  if (handPokemonCount > 0) {
    yield store.prompt(
      state,
      new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_DECK,
        player.hand,
        { superType: SuperType.POKEMON },
        { min: 0, max: Math.min(2, handPokemonCount), allowCancel: false, blocked: handBlocked }
      ),
      cards => {
        selectedFromHand = cards || [];
        next();
      }
    );
  }

  if (selectedFromHand.length > 0) {
    player.hand.moveCardsTo(selectedFromHand, player.deck);
    yield store.prompt(state, new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selectedFromHand), () =>
      next()
    );
  }

  const deckBlocked: number[] = [];
  let deckPokemonCount = 0;
  player.deck.cards.forEach((card, index) => {
    if (card instanceof PokemonCard) {
      deckPokemonCount += 1;
      return;
    }
    deckBlocked.push(index);
  });

  let selectedFromDeck: Card[] = [];
  if (selectedFromHand.length > 0 && deckPokemonCount > 0) {
    yield store.prompt(
      state,
      new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_HAND,
        player.deck,
        { superType: SuperType.POKEMON },
        { min: 0, max: Math.min(selectedFromHand.length, deckPokemonCount), allowCancel: false, blocked: deckBlocked }
      ),
      cards => {
        selectedFromDeck = cards || [];
        next();
      }
    );
  }

  if (selectedFromDeck.length > 0) {
    player.deck.moveCardsTo(selectedFromDeck, player.hand);
    yield store.prompt(state, new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selectedFromDeck), () =>
      next()
    );
  }

  if (player.deck.cards.length > 0) {
    return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
      player.deck.applyOrder(order);
    });
  }

  return state;
}

export class ShaLi extends VariantTrainerCard {
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
