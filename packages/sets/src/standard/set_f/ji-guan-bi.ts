import {
  Effect,
  EndTurnEffect,
  SpecialCondition,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
  UseAttackEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class JiGuanBi extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  public readonly ASLEEP_MARKER = 'JIGUANBI_ASLEEP_MARKER';

  public readonly PARALYZED_MARKER = 'JIGUANBI_PARALYZED_MARKER';

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof UseAttackEffect && effect.player.active.trainers.cards.includes(this)) {
      const active = effect.player.active;
      if (active.specialConditions.includes(SpecialCondition.ASLEEP)) {
        active.marker.addMarker(this.ASLEEP_MARKER, this);
        active.removeSpecialCondition(SpecialCondition.ASLEEP);
      }
      if (active.specialConditions.includes(SpecialCondition.PARALYZED)) {
        active.marker.addMarker(this.PARALYZED_MARKER, this);
        active.removeSpecialCondition(SpecialCondition.PARALYZED);
      }
    }

    if (effect instanceof EndTurnEffect) {
      const slot = StateUtils.findPokemonSlot(state, this);
      if (slot === undefined || !slot.trainers.cards.includes(this)) {
        return state;
      }

      if (slot.marker.hasMarker(this.ASLEEP_MARKER, this)) {
        slot.addSpecialCondition(SpecialCondition.ASLEEP);
        slot.marker.removeMarker(this.ASLEEP_MARKER, this);
      }

      if (slot.marker.hasMarker(this.PARALYZED_MARKER, this)) {
        slot.addSpecialCondition(SpecialCondition.PARALYZED);
        slot.marker.removeMarker(this.PARALYZED_MARKER, this);
      }
    }

    return state;
  }
}
