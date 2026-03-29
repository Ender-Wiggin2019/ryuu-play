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
  const hasBench = opponent.bench.some((b: any) => b.pokemons.cards.length > 0);

  if (!hasBench || player.getPrizeLeft() <= opponent.getPrizeLeft()) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  return store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_SWITCH,
      PlayerType.TOP_PLAYER,
      [SlotType.BENCH],
      { allowCancel: false }
    ),
    result => {
      const cardList = result[0];
      opponent.switchPokemon(cardList);
    }
  );
}

export class CounterCatcher extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if ((effect as any).trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }
    return state;
  }
}
