import {
  Effect,
  GameError,
  GameMessage,
  ShuffleDeckPrompt,
  State,
  StateUtils,
  StoreLike,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

export class Roxanne extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 14224,
      name: '杜娟',
      yorenCode: 'Y1083',
      cardType: '2',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '185/207',
      },
      image: 'img\\308\\189.png',
      hash: 'b69d47af224a77f02bef97c6371ad0e5',
    },
    collection: {
      id: 308,
      name: '对战派对 耀梦 下',
      commodityCode: 'CSVE2C2',
      salesDate: '2025-10-17',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/308/189.png',
  };

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_f';

  public name: string = 'Roxanne';

  public fullName: string = 'Roxanne CSVE2C2';

  public text: string =
    'You can use this card only if your opponent has 3 or fewer Prize cards remaining. ' +
    'Each player shuffles their hand into their deck. Then, you draw 6 cards, and your opponent draws 2 cards.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (opponent.getPrizeLeft() > 3) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      const playerCards = player.hand.cards.filter(card => card !== this);
      const opponentCards = opponent.hand.cards.slice();

      player.hand.moveCardsTo(playerCards, player.deck);
      opponent.hand.moveCardsTo(opponentCards, opponent.deck);

      return store.prompt(
        state,
        [new ShuffleDeckPrompt(player.id), new ShuffleDeckPrompt(opponent.id)],
        order => {
          player.deck.applyOrder(order[0]);
          opponent.deck.applyOrder(order[1]);
          player.deck.moveTo(player.hand, Math.min(6, player.deck.cards.length));
          opponent.deck.moveTo(opponent.hand, Math.min(2, opponent.deck.cards.length));
        }
      );
    }

    return state;
  }
}
