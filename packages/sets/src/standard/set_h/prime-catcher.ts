import {
  CardTag,
  ChoosePokemonPrompt,
  Effect,
  GameError,
  GameMessage,
  PlayerType,
  PokemonSlot,
  SlotType,
  State,
  StateUtils,
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
  const opponent = StateUtils.getOpponent(state, player);
  const opponentHasBench = opponent.bench.some(b => b.pokemons.cards.length > 0);

  if (!opponentHasBench) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let opponentTargets: PokemonSlot[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_SWITCH,
      PlayerType.TOP_PLAYER,
      [SlotType.BENCH],
      { allowCancel: false }
    ),
    results => {
      opponentTargets = results || [];
      next();
    }
  );

  if (opponentTargets.length > 0) {
    opponent.switchPokemon(opponentTargets[0]);
  }

  const playerHasBench = player.bench.some(b => b.pokemons.cards.length > 0);
  if (!playerHasBench) {
    return state;
  }

  let playerTargets: PokemonSlot[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_SWITCH,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.BENCH],
      { allowCancel: false }
    ),
    results => {
      playerTargets = results || [];
      next();
    }
  );

  if (playerTargets.length > 0) {
    player.switchPokemon(playerTargets[0]);
  }

  return state;
}

export class PrimeCatcher extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 16346,
      name: '顶尖捕捉器',
      yorenCode: 'Y1406',
      cardType: '2',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '180/204',
      },
      image: 'img\\324\\489.png',
      hash: '99b63b69fdc29a7ac94135fdea43d12c',
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
      salesDate: '2026-01-16',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/324/489.png',
  };

  public trainerType: TrainerType = TrainerType.ITEM;

  public tags = [CardTag.ACE_SPEC];

  public set: string = 'set_h';

  public name: string = 'Prime Catcher';

  public fullName: string = 'Prime Catcher CSV7C';

  public text: string =
    'Switch in 1 of your opponent\'s Benched Pokemon to the Active Spot. ' +
    'If you do, switch your Active Pokemon with 1 of your Benched Pokemon.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
