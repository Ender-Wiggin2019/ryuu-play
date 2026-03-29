import {
  CardTarget,
  CardType,
  ChoosePokemonPrompt,
  DealDamageEffect,
  Effect,
  GameError,
  GameMessage,
  PlayerType,
  PokemonSlot,
  SlotType,
  State,
  StoreLike,
  TrainerType,
  UseTrainerInPlayEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';
import { discardTmAtEndTurn, ensureTmActiveUse, finishTmUse, prepareTmAttack } from './tm-tool-utils';

const attack = {
  name: '暗中奇袭',
  cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
  damage: '100',
  text: '选择对手身上有伤害指示物的1只宝可梦，造成100伤害。若选择的是备战宝可梦则不计算弱点和抗性。',
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

  const opponent = prepared.opponent;
  const blocked: CardTarget[] = [];
  let hasTarget = false;

  opponent.forEachPokemon(PlayerType.TOP_PLAYER, (pokemonSlot, _, target) => {
    if (pokemonSlot.damage <= 0) {
      blocked.push(target);
      return;
    }
    hasTarget = true;
  });

  if (!hasTarget) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let targets: PokemonSlot[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      effect.player.id,
      GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
      PlayerType.TOP_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { allowCancel: false, blocked }
    ),
    result => {
      targets = result || [];
      next();
    }
  );

  if (targets.length === 0) {
    return state;
  }

  const target = targets[0];
  const dealDamage = new DealDamageEffect(prepared.attackEffect, 100);
  dealDamage.target = target;
  if (target !== opponent.active) {
    prepared.attackEffect.ignoreWeakness = true;
    prepared.attackEffect.ignoreResistance = true;
  }

  state = store.reduceEffect(state, dealDamage);
  return finishTmUse(store, state, effect.player, effect.trainerCard);
}

export class AnZhongQiXi extends VariantTrainerCard {
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
