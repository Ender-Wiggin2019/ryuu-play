import {
  Effect,
  CoinFlipPrompt,
  GameError,
  GameMessage,
  PokemonCard,
  State,
  StoreLike,
  SuperType,
  TrainerEffect,
} from '@ptcg/common';

import { searchCardsToHand } from '../../common/utils/search-cards-to-hand';
import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  let heads = false;
  yield store.prompt(state, new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP), result => {
    heads = result === true;
    next();
  });

  if (!heads) {
    player.hand.moveCardTo(effect.trainerCard, player.discard);
    return state;
  }

  const pokemonCount = player.deck.cards.filter(card => card instanceof PokemonCard).length;
  if (pokemonCount === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
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
      allowCancel: false,
      showToOpponent: true,
      shuffleAfterSearch: true
    }
  );

  player.hand.moveCardTo(effect.trainerCard, player.discard);
  return state;
}

export class VictoryStamp extends VariantTrainerCard {
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
