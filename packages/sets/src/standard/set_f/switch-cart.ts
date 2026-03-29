import {
  ChoosePokemonPrompt,
  Effect,
  GameError,
  GameMessage,
  HealEffect,
  PlayerType,
  PokemonCard,
  PokemonSlot,
  SlotType,
  Stage,
  State,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const activePokemon = player.active.getPokemonCard();
  const hasBench = player.bench.some(b => b.pokemons.cards.length > 0);

  if (!(activePokemon instanceof PokemonCard) || activePokemon.stage !== Stage.BASIC || !hasBench) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  effect.preventDefault = true;

  let targets: PokemonSlot[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_SWITCH,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.BENCH],
      { min: 1, max: 1, allowCancel: true }
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
  player.switchPokemon(targets[0]);
  state = store.reduceEffect(state, new HealEffect(player, player.active, 30));

  return state;
}

export class SwitchCart extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.ITEM;

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
