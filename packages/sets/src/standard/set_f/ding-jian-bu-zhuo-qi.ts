import {
  ChoosePokemonPrompt,
  Effect,
  GameError,
  GameMessage,
  PlayerType,
  SlotType,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: Effect
): IterableIterator<State> {
  const trainerEffect = effect as any;
  const player = trainerEffect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const opponentHasBench = opponent.bench.some((slot: any) => slot.pokemons.cards.length > 0);

  if (!opponentHasBench) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let opponentChoice: any[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_SWITCH,
      PlayerType.TOP_PLAYER,
      [SlotType.BENCH],
      { allowCancel: false }
    ),
    result => {
      opponentChoice = result || [];
      next();
    }
  );

  if (opponentChoice.length > 0) {
    opponent.switchPokemon(opponentChoice[0]);
  }

  return state;
}

export class DingJianBuZhuoQi extends VariantTrainerCard {
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
