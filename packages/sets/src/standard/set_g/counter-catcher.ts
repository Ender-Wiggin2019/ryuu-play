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

export class CounterCatcher extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 15701,
      yorenCode: 'Y147',
      name: '反击捕捉器',
      cardType: '2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '114/128',
      },
      image: 'img\\311\\313.png',
      hash: 'aed23c3046f2630f0114709fd2558867',
    },
    collection: {
      id: 311,
      name: '补充包 真实玄虚',
      commodityCode: 'CSV6C',
      salesDate: '2025-11-07',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/311/313.png',
  };

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'set_g';

  public name: string = 'Counter Catcher';

  public fullName: string = 'Counter Catcher CSV6C';

  public text: string =
    'You can use this card only if you have more Prize cards remaining than your opponent. ' +
    'Switch in 1 of your opponent\'s Benched Pokemon to the Active Spot.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      const playerPrizes = player.prizes.reduce((sum, prize) => sum + prize.cards.length, 0);
      const opponentPrizes = opponent.prizes.reduce((sum, prize) => sum + prize.cards.length, 0);
      const hasBench = opponent.bench.some(b => b.pokemons.cards.length > 0);

      if (playerPrizes <= opponentPrizes || hasBench === false) {
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
        results => {
          const target = results[0];
          opponent.switchPokemon(target);
        }
      );
    }

    return state;
  }
}
