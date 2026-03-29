import {
  CardType,
  DealDamageEffect,
  Effect,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class FuLuGuo extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof DealDamageEffect && effect.target.trainers.cards.includes(this)) {
      const owner = StateUtils.findOwner(state, effect.target);
      const attackerCard = effect.player.active.getPokemonCard();
      if (owner !== undefined
        && effect.player !== owner
        && effect.damage > 0
        && attackerCard !== undefined
        && attackerCard.cardTypes.includes(CardType.PSYCHIC)) {
        effect.damage = Math.max(0, effect.damage - 60);
        effect.target.trainers.moveCardTo(this, owner.discard);
      }
    }

    return state;
  }
}
