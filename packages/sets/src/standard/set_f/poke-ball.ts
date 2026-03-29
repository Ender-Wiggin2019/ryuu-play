import {
  CoinFlipPrompt,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  ShuffleDeckPrompt,
  State,
  StoreLike,
  SuperType,
  TrainerEffect,
} from '@ptcg/common';

import { searchCardsToHand } from '../../common/utils/search-cards-to-hand';
import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let flipResult = false;
  yield store.prompt(state, [new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)], result => {
    flipResult = result;
    next();
  });

  if (!flipResult) {
    return state;
  }

  const hasPokemonInDeck = player.deck.cards.some(card => card instanceof PokemonCard);
  if (!hasPokemonInDeck) {
    return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
      player.deck.applyOrder(order);
    });
  }

  yield* searchCardsToHand(
    next,
    store,
    state,
    player,
    player.deck,
    { superType: SuperType.POKEMON },
    {
      min: 1,
      max: 1,
      allowCancel: true,
      showToOpponent: true,
      shuffleAfterSearch: true
    }
  );

  return state;
}

export class PokeBall extends VariantTrainerCard {
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
