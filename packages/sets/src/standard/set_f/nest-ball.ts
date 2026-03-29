import {
  Card,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  TrainerEffect,
  ShuffleDeckPrompt,
  Stage,
  State,
  StoreLike,
  SuperType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: Effect
): IterableIterator<State> {
  const trainerEffect = effect as TrainerEffect;
  const player = trainerEffect.player;

  const openBench = player.bench.filter((slot: any) => slot.pokemons.cards.length === 0).length;
  if (openBench === 0 || player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
      player.deck,
      { superType: SuperType.POKEMON, stage: Stage.BASIC },
      { min: 0, max: 1, allowCancel: true }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  const bench = player.bench.find((slot: any) => slot.pokemons.cards.length === 0);
  if (bench !== undefined) {
    player.deck.moveCardTo(selected[0], bench.pokemons);
    bench.pokemonPlayedTurn = state.turn;
  }

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class NestBall extends VariantTrainerCard {
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
