import {
  ChoosePokemonPrompt,
  Effect,
  GameError,
  GameMessage,
  PlayerType,
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
  const hasBench = opponent.bench.some(b => b.pokemons.cards.length > 0);

  if (!hasBench) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  return store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_SWITCH,
      PlayerType.TOP_PLAYER,
      [SlotType.BENCH],
      { allowCancel: false }
    ),
    result => {
      const target = result[0];
      opponent.switchPokemon(target);
      next();
    }
  );
}

export class BosssOrders extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 17052,
      name: '老大的指令',
      yorenCode: 'Y487',
      cardType: '2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '219/SV-P',
      },
      image: 'img\\334\\8.png',
      hash: 'cb0e8a9a5356428ff126920b2ad5aa74',
    },
    collection: {
      id: 334,
      commodityCode: 'PROMOGIFT01',
      name: '活动奖赏包 第一弹',
      salesDate: '2026-01-16',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/334/8.png',
  };

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_g';

  public name: string = 'Boss\'s Orders';

  public fullName: string = 'Boss\'s Orders PROMOGIFT01';

  public text: string = 'Switch in 1 of your opponent\'s Benched Pokemon to the Active Spot.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
