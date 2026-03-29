import { CoinFlipPrompt, Effect, GameMessage, State, StoreLike, TrainerEffect } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect
): IterableIterator<State> {
  const player = effect.player;
  let heads = false;

  effect.preventDefault = true;

  yield store.prompt(state, [new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)], result => {
    heads = result;
    next();
  });

  player.deck.moveTo(player.hand, Math.min(heads ? 4 : 2, player.deck.cards.length));

  return state;
}

export class YeCanNvHai extends VariantTrainerCard {
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
