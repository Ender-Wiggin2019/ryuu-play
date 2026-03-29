import { CheckRetreatCostEffect, Effect, PokemonCard, Stage, State, StoreLike, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function isStage2Pokemon(pokemon: PokemonCard | undefined): boolean {
  return pokemon !== undefined && pokemon.stage === Stage.STAGE_2;
}

export class BigAirBalloon extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckRetreatCostEffect && effect.player.active.trainers.cards.includes(this)) {
      const pokemon = effect.player.active.getPokemonCard();
      if (isStage2Pokemon(pokemon)) {
        effect.cost = [];
      }
    }

    return state;
  }
}
