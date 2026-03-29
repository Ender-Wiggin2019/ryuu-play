import {
  ChoosePokemonPrompt,
  CoinFlipPrompt,
  Effect,
  HealEffect,
  GameError,
  GameMessage,
  PlayerType,
  SlotType,
  State,
  StoreLike,
  TrainerEffect,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  const hasPokemon = player.active.getPokemonCard() !== undefined
    || player.bench.some(bench => bench.getPokemonCard() !== undefined);

  if (!hasPokemon) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  effect.preventDefault = true;

  let targets: any[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_HEAL,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { allowCancel: false }
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
  let heads = 0;
  while (true) {
    let flip = false;
    yield store.prompt(state, new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP), result => {
      flip = result === true;
      next();
    });
    if (!flip) {
      break;
    }
    heads += 1;
  }

  if (heads > 0) {
    store.reduceEffect(state, new HealEffect(player, target, heads * 40));
  }

  player.hand.moveCardTo(effect.trainerCard, player.discard);
  return state;
}

export class Honey extends VariantTrainerCard {
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
