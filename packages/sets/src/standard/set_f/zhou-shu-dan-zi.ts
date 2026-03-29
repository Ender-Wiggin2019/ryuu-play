import {
  Card,
  ChooseCardsPrompt,
  Effect,
  GamePhase,
  GameMessage,
  KnockOutEffect,
  State,
  StateUtils,
  StoreLike,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: KnockOutEffect): IterableIterator<State> {
  const owner = effect.player;
  const opponent = StateUtils.getOpponent(state, owner);

  if (state.phase !== GamePhase.ATTACK || opponent.hand.cards.length === 0) {
    return state;
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(owner.id, GameMessage.CHOOSE_CARD_TO_DISCARD, opponent.hand, {}, { min: 1, max: 1, allowCancel: false }),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length > 0) {
    opponent.hand.moveCardsTo(selected, opponent.discard);
  }

  return state;
}

export class ZhouShuDanZi extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof KnockOutEffect && effect.target.trainers.cards.includes(this)) {
      const owner = StateUtils.findOwner(state, effect.target);
      if (effect.player !== owner) {
        return state;
      }

      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
