import {
  CardType,
  DealDamageEffect,
  Effect,
  GameError,
  GameMessage,
  State,
  StoreLike,
  TrainerType,
  UseTrainerInPlayEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';
import { discardTmAtEndTurn, ensureTmActiveUse, finishTmUse, prepareTmAttack } from './tm-tool-utils';

const attack = {
  name: '临危一击',
  cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
  damage: '280',
  text: '如果对手只剩1张奖赏卡，则此招式才可使用。',
};

function* useCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: UseTrainerInPlayEffect
): IterableIterator<State> {
  ensureTmActiveUse(effect);
  const prepared = prepareTmAttack(store, state, effect, attack);
  state = prepared.state;

  if (prepared.opponent.getPrizeLeft() !== 1) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  const dealDamage = new DealDamageEffect(prepared.attackEffect, 280);
  state = store.reduceEffect(state, dealDamage);
  return finishTmUse(store, state, effect.player, effect.trainerCard);
}

export class LinWeiYiJi extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.TOOL;
  public useWhenInPlay = true;
  public attacks = [attack];

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.trainerType = TrainerType.TOOL;
    this.useWhenInPlay = true;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof UseTrainerInPlayEffect && effect.trainerCard === this) {
      const generator = useCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return discardTmAtEndTurn(state, effect, this);
  }
}
