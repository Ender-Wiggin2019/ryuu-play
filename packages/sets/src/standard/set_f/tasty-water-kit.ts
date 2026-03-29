import {
  Effect,
  HealEffect,
  PlayerType,
  State,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  effect.preventDefault = true;

  state.players.forEach(targetPlayer => {
    targetPlayer.forEachPokemon(PlayerType.BOTTOM_PLAYER, pokemonSlot => {
      if (pokemonSlot.damage > 0) {
        store.reduceEffect(state, new HealEffect(player, pokemonSlot, 20));
      }
    });
  });

  player.hand.moveCardTo(effect.trainerCard, player.discard);
  return state;
}

export class TastyWaterKit extends VariantTrainerCard {
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
