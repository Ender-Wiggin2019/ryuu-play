import {
  CardTarget,
  ChoosePokemonPrompt,
  Effect,
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
  const blocked: CardTarget[] = [];
  let hasTarget = false;

  if (player.active.pokemons.cards.length === 0) {
    blocked.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 });
  } else {
    hasTarget = true;
  }

  player.bench.forEach((bench, index) => {
    if (bench.pokemons.cards.length === 0) {
      blocked.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index });
      return;
    }
    hasTarget = true;
  });

  if (!hasTarget) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selected: any[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_PICK_UP,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.ACTIVE, SlotType.BENCH],
      { allowCancel: false, blocked }
    ),
    result => {
      selected = result || [];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  const target = selected[0];
  target.energies.moveTo(player.discard);
  target.trainers.moveTo(player.discard);
  target.pokemons.moveTo(player.hand);
  target.clearEffects();

  return state;
}

export class FuTuBoShiDeJuBen extends VariantTrainerCard {
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
