import {
  Card,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
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

  const bench = opponent.bench.find(slot => slot.pokemons.cards.length === 0);
  const basicTargets = opponent.hand.cards.filter(card => {
    return card instanceof PokemonCard && card.stage === Stage.BASIC;
  });

  if (bench === undefined || basicTargets.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      opponent.hand,
      { superType: SuperType.POKEMON, stage: Stage.BASIC },
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  opponent.hand.moveCardTo(selected[0], bench.pokemons);
  bench.pokemonPlayedTurn = state.turn;
  opponent.switchPokemon(bench);
  return state;
}

export class LiJiaDeYaoQing extends VariantTrainerCard {
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
