import {
  Card,
  CardList,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
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
  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const topCard = new CardList();
  player.deck.moveTo(topCard, 1);

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      topCard,
      {},
      { min: 1, max: 1, allowCancel: true }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length > 0) {
    topCard.moveCardsTo(selected, player.hand);
    return state;
  }

  topCard.moveTo(player.discard);
  player.deck.moveTo(player.hand, Math.min(1, player.deck.cards.length));
  return state;
}

export class TrekkingShoes extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 15560,
      name: '健行鞋',
      yorenCode: 'Y1150',
      cardType: '2',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '152/207',
      },
      image: 'img\\308\\151.png',
      hash: '3f66812f0438fc03b929c2dfc355350c',
    },
    collection: {
      id: 308,
      commodityCode: 'CSVE2C2',
      name: '对战派对 耀梦 下',
      salesDate: '2025-10-17',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/308/151.png',
  };

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'set_f';

  public name: string = 'Trekking Shoes';

  public fullName: string = 'Trekking Shoes CSVE2C2';

  public text: string =
    'Look at the top card of your deck. You may put that card into your hand. ' +
    'If you don\'t, discard that card and draw a card.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
