import {
  ChoosePokemonPrompt,
  Effect,
  GameError,
  GameMessage,
  PlayerType,
  PokemonSlot,
  SlotType,
  State,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const hasBench = player.bench.some(slot => slot.pokemons.cards.length > 0);

  if (!hasBench) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const blocked = player.bench
    .map((slot, index) => ({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index }))
    .filter(target => player.bench[target.index].pokemons.cards.length === 0);

  let targets: PokemonSlot[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_SWITCH,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.BENCH],
      { allowCancel: false, blocked }
    ),
    result => {
      targets = result || [];
      next();
    }
  );

  if (targets.length > 0) {
    player.switchPokemon(targets[0]);
  }

  if (player.hand.cards.includes(effect.trainerCard)) {
    player.hand.moveCardTo(effect.trainerCard, player.discard);
  }

  const drawCount = Math.max(0, 5 - player.hand.cards.length);
  player.deck.moveTo(player.hand, Math.min(drawCount, player.deck.cards.length));
  return state;
}

export class ChongLangShou extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

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
