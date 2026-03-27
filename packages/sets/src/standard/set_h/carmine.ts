import {
  Effect,
  State,
  StoreLike,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

export class Carmine extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 17632,
      name: '丹瑜',
      yorenCode: 'Y1440',
      cardType: '2',
      commodityCode: 'CSV8C',
      trainerType: '2',
      text:
        '这张卡牌，即使是先攻玩家的最初回合也可以使用。\n' +
        '将自己的手牌全部放于弃牌区，从牌库上方抽取5张卡牌。\n' +
        '在自己的回合只可以使用1张支援者卡。',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '255/207',
        rarityLabel: 'SAR',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/606.png',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/606.png',
  };

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public canUseOnFirstTurn = true;

  public set: string = 'set_h';

  public name: string = 'Carmine';

  public fullName: string = 'Carmine CSV8C';

  public text: string =
    'You can use this card even if you go first on your first turn. ' +
    'Discard your hand and draw 5 cards.';

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;
      const cardsInHand = player.hand.cards.slice();

      player.hand.moveCardsTo(cardsInHand, player.discard);
      player.deck.moveTo(player.hand, Math.min(5, player.deck.cards.length));
    }

    return state;
  }
}
