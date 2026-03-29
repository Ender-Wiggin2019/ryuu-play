import {
  Attack,
  AttackEffect,
  CheckAttackCostEffect,
  CheckProvidedEnergyEffect,
  EndTurnEffect,
  Effect,
  GameError,
  GameMessage,
  Player,
  State,
  StateUtils,
  StoreLike,
  TrainerCard,
  UseTrainerInPlayEffect,
} from '@ptcg/common';

export function ensureTmActiveUse(effect: UseTrainerInPlayEffect): void {
  if (effect.target !== effect.player.active) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }
}

export function prepareTmAttack(
  store: StoreLike,
  state: State,
  effect: UseTrainerInPlayEffect,
  attack: Attack
): { state: State; player: Player; opponent: Player; attackEffect: AttackEffect } {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const checkAttackCost = new CheckAttackCostEffect(player, attack);
  state = store.reduceEffect(state, checkAttackCost);

  const checkProvidedEnergy = new CheckProvidedEnergyEffect(player, effect.target);
  state = store.reduceEffect(state, checkProvidedEnergy);

  if (StateUtils.checkEnoughEnergy(checkProvidedEnergy.energyMap, checkAttackCost.cost) === false) {
    throw new GameError(GameMessage.NOT_ENOUGH_ENERGY);
  }

  const attackEffect = new AttackEffect(player, opponent, attack);
  return { state, player, opponent, attackEffect };
}

function isTmTool(card: TrainerCard): boolean {
  return card.name.startsWith('招式学习器 ');
}

export function finishTmUse(store: StoreLike, state: State, player: Player, trainerCard: TrainerCard): State {
  return store.reduceEffect(state, new EndTurnEffect(player));
}

export function discardTmAtEndTurn(state: State, effect: Effect, self: TrainerCard): State {
  if (!(effect instanceof EndTurnEffect)) {
    return state;
  }

  if (!isTmTool(self)) {
    return state;
  }

  const cardList = StateUtils.findCardList(state, self);
  const owner = StateUtils.findOwner(state, cardList);
  if (owner !== undefined && effect.player === owner) {
    cardList.moveCardTo(self, owner.discard);
  }

  return state;
}
