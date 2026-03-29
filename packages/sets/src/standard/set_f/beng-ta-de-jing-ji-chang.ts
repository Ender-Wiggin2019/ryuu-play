import {
  CheckTableStateEffect,
  Effect,
  GameError,
  GameMessage,
  State,
  StateUtils,
  StoreLike,
  UseStadiumEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class BengTaDeJingJiChang extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
  }

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckTableStateEffect && StateUtils.getStadiumCard(state) === this) {
      effect.benchSize = Math.min(effect.benchSize, 4);
    }

    if (effect instanceof UseStadiumEffect && StateUtils.getStadiumCard(state) === this) {
      throw new GameError(GameMessage.CANNOT_USE_STADIUM);
    }

    return state;
  }
}
