import {
  Card,
  ChooseCardsPrompt,
  EndTurnEffect,
  Effect,
  EnergyCard,
  EnergyType,
  GameMessage,
  State,
  StoreLike,
  SuperType,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, self: LiZhiShaLou, effect: EndTurnEffect): IterableIterator<State> {
  const player = effect.player;
  const pokemon = player.active.getPokemonCard();
  if (pokemon === undefined || !player.active.trainers.cards.includes(self)) {
    return state;
  }

  const basicEnergyCount = player.discard.cards.filter(card => card instanceof EnergyCard && card.energyType === EnergyType.BASIC).length;
  if (basicEnergyCount === 0) {
    return state;
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.discard,
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
      { min: 0, max: 1, allowCancel: true }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  player.discard.moveCardTo(selected[0], player.active.energies);
  return state;
}

export class LiZhiShaLou extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof EndTurnEffect && effect.player.active.trainers.cards.includes(this)) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
