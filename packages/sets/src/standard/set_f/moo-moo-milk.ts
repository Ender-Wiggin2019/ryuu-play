import {
  CardTarget,
  ChoosePokemonPrompt,
  Effect,
  GameError,
  GameMessage,
  HealEffect,
  PlayerType,
  PokemonSlot,
  SlotType,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const playerType = state.players[0] === player ? PlayerType.BOTTOM_PLAYER : PlayerType.TOP_PLAYER;

  if (player.getPrizeLeft() <= opponent.getPrizeLeft()) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const blocked: CardTarget[] = [];
  let hasPokemonWithDamage = false;
  player.forEachPokemon(playerType, (pokemonSlot, card, target) => {
    if (pokemonSlot.damage === 0) {
      blocked.push(target);
    } else {
      hasPokemonWithDamage = true;
    }
  });

  if (!hasPokemonWithDamage) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  effect.preventDefault = true;

  let targets: PokemonSlot[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_HEAL,
      playerType,
      [SlotType.ACTIVE, SlotType.BENCH],
      { allowCancel: true, blocked }
    ),
    results => {
      targets = results || [];
      next();
    }
  );

  if (targets.length === 0) {
    return state;
  }

  player.hand.moveCardTo(effect.trainerCard, player.discard);
  const healEffect = new HealEffect(player, targets[0], 60);
  store.reduceEffect(state, healEffect);

  return state;
}

export class MooMooMilk extends VariantTrainerCard {
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
