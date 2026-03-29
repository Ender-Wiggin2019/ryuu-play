import {
  Card,
  ChooseCardsPrompt,
  CoinFlipPrompt,
  Effect,
  GameError,
  GameMessage,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  PokemonCard,
  Stage,
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

  const basicTargets = player.deck.cards.filter(card => card instanceof PokemonCard && card.stage === Stage.BASIC);
  const allPokemonTargets = player.deck.cards.filter(card => card.superType === SuperType.POKEMON);

  if (basicTargets.length === 0 && allPokemonTargets.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let flipResult = false;
  yield store.prompt(state, new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP), result => {
    flipResult = result;
    next();
  });

  let selected: Card[] = [];
  if (flipResult) {
    if (allPokemonTargets.length === 0) {
      throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
    }

    yield store.prompt(
      state,
      new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_HAND,
        player.deck,
        { superType: SuperType.POKEMON },
        { min: 0, max: Math.min(2, allPokemonTargets.length), allowCancel: false }
      ),
      cards => {
        selected = cards || [];
        next();
      }
    );
  } else {
    if (basicTargets.length === 0) {
      throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
    }

    yield store.prompt(
      state,
      new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_HAND,
        player.deck,
        { superType: SuperType.POKEMON, stage: Stage.BASIC },
        { min: 1, max: 1, allowCancel: false }
      ),
      cards => {
        selected = cards || [];
        next();
      }
    );

    if (selected.length > 0) {
      yield store.prompt(state, new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selected), () =>
        next()
      );
    }
  }

  if (selected.length > 0) {
    player.deck.moveCardsTo(selected, player.hand);
  }

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class QingMu extends VariantTrainerCard {
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
