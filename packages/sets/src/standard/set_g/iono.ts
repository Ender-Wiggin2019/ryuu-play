import {
  Effect,
  State,
  StateUtils,
  StoreLike,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

export class Iono extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 17271,
      name: '奇树',
      yorenCode: 'Y1294',
      cardType: '2',
      commodityCode: 'promosvPaldea',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '205/SV-P'
      },
      image: 'img/456/4.png',
      hash: '5c7e1412fe89a88ed26e05f5d334e851'
    },
    collection: {
      id: 456,
      commodityCode: 'promosvPaldea',
      name: '帕底亚训练家合影卡挂件套装&对战礼盒',
      salesDate: '2026-03-13'
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/456/4.png'
  };

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_g';

  public name: string = 'Iono';

  public fullName: string = 'Iono CSV8C';

  public text: string =
    'Each player shuffles all cards in their hand and puts them on the bottom of their deck. ' +
    'Then, each player draws cards equal to their remaining Prize cards.';

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const playerHandCards = player.hand.cards.filter(card => card !== this);
      const opponentHandCards = opponent.hand.cards.slice();
      const playerMovedCount = playerHandCards.length;
      const opponentMovedCount = opponentHandCards.length;

      player.hand.moveCardsToBottom(playerHandCards, player.deck);
      opponent.hand.moveCardsToBottom(opponentHandCards, opponent.deck);

      if (playerMovedCount + opponentMovedCount > 0) {
        opponent.deck.moveTo(opponent.hand, opponent.getPrizeLeft());
        player.deck.moveTo(player.hand, player.getPrizeLeft());
      }
    }

    return state;
  }
}
