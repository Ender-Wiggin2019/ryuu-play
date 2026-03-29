import {
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { searchCardsToHand } from '../../common/utils/search-cards-to-hand';
import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const stage1Count = player.deck.cards.filter(card => card instanceof PokemonCard && card.stage === Stage.STAGE_1).length;

  if (stage1Count === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  yield* searchCardsToHand(
    next,
    store,
    state,
    player,
    player.deck,
    { stage: Stage.STAGE_1 },
    {
      min: 1,
      max: Math.min(3, stage1Count),
      allowCancel: false,
      showToOpponent: true,
      shuffleAfterSearch: true
    }
  );

  return state;
}

export class AdvancedAroma extends VariantTrainerCard {
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
