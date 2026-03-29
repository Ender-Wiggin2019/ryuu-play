import { CardTag, Effect, State, StoreLike, TrainerEffect, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(_next: Function, _store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = state.players.find(p => p.id !== player.id);
  if (opponent === undefined) {
    return state;
  }

  const opponentActive = opponent.active.getPokemonCard();
  const drawCount = Math.min(
    2 + (opponentActive !== undefined && opponentActive.tags.includes(CardTag.POKEMON_EX) ? 2 : 0),
    player.deck.cards.length
  );

  player.deck.moveTo(player.hand, drawCount);

  if (player.hand.cards.includes(effect.trainerCard)) {
    player.hand.moveCardTo(effect.trainerCard, player.discard);
  }

  return state;
}

export class QianLi extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

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
