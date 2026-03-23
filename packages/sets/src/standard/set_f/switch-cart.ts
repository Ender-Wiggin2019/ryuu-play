import {
  ChoosePokemonPrompt,
  Effect,
  GameError,
  GameMessage,
  HealEffect,
  PlayerType,
  PokemonSlot,
  SlotType,
  State,
  StoreLike,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const hasBench = player.bench.some(b => b.pokemons.cards.length > 0);

  if (!player.active.isBasic() || !hasBench) {
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
      { allowCancel: true }
    ),
    results => {
      targets = results || [];
      next();
    }
  );

  if (targets.length === 0) {
    return state;
  }

  const switchedOut = player.active;
  player.hand.moveCardTo(effect.trainerCard, player.discard);
  player.switchPokemon(targets[0]);

  if (switchedOut.damage > 0) {
    const healEffect = new HealEffect(player, switchedOut, 30);
    store.reduceEffect(state, healEffect);
  }

  return state;
}

export class SwitchCart extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 9772,
      name: '交替推车',
      yorenCode: 'Y951',
      cardType: '2',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '116/128',
      },
      image: 'img\\182\\205.png',
      hash: '153db11c495ce1b6e454d53507785008',
    },
    collection: {
      id: 182,
      commodityCode: 'CS5bC',
      name: '补充包 勇魅群星 勇',
      salesDate: '2024-06-18',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/182/205.png',
  };

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'set_f';

  public name: string = 'Switch Cart';

  public fullName: string = 'Switch Cart CS5bC';

  public text: string =
    'Switch your Active Basic Pokemon with 1 of your Benched Pokemon. ' +
    'If you do, heal 30 damage from the Pokemon you moved to your Bench.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
