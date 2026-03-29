import {
  CardTarget,
  ChoosePokemonPrompt,
  Effect,
  GameError,
  GameMessage,
  HealEffect,
  PlayerType,
  SlotType,
  State,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const blocked: CardTarget[] = [];
  let hasValidTarget = false;

  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (pokemonSlot, _card, target) => {
    const remainingHp = _card.hp - pokemonSlot.damage;
    if (remainingHp > 30) {
      blocked.push(target);
      return;
    }

    hasValidTarget = true;
  });

  if (!hasValidTarget) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let targets: any[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_HEAL,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { allowCancel: false, blocked },
    ),
    result => {
      targets = result || [];
      next();
    },
  );

  if (targets.length > 0) {
    const target = targets[0];
    const healEffect = new HealEffect(player, target, target.damage);
    store.reduceEffect(state, healEffect);
  }

  return state;
}

export class BaiLuDeZhenXin extends VariantTrainerCard {
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
