import {
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  GameError,
  GameMessage,
  SuperType,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  if (opponent.active.energies.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }
  if (!player.hand.cards.some(card => card instanceof EnergyCard)) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let chosenOpponentEnergy: EnergyCard[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      opponent.active.energies,
      { superType: SuperType.ENERGY },
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      chosenOpponentEnergy = (cards || []) as EnergyCard[];
      next();
    }
  );

  if (chosenOpponentEnergy.length === 0) {
    return state;
  }

  opponent.active.energies.moveCardTo(chosenOpponentEnergy[0], opponent.hand);

  let chosenPlayerEnergy: EnergyCard[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.ATTACH_ENERGY_TO_ACTIVE,
      player.hand,
      { superType: SuperType.ENERGY },
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      chosenPlayerEnergy = (cards || []) as EnergyCard[];
      next();
    }
  );

  if (chosenPlayerEnergy.length === 0) {
    return state;
  }

  player.hand.moveCardTo(chosenPlayerEnergy[0], opponent.active.energies);
  return state;
}

export class BanMuDeLingDaoLi extends VariantTrainerCard {
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
