import {
  Effect,
  ShuffleDeckPrompt,
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
  self: Judge,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const playerHand = player.hand.cards.filter(card => card !== self);

  player.hand.moveCardsTo(playerHand, player.deck);
  opponent.hand.moveTo(opponent.deck);

  yield store.prompt(
    state,
    [new ShuffleDeckPrompt(player.id), new ShuffleDeckPrompt(opponent.id)],
    deckOrder => {
      player.deck.applyOrder(deckOrder[0]);
      opponent.deck.applyOrder(deckOrder[1]);
      next();
    }
  );

  player.deck.moveTo(player.hand, Math.min(4, player.deck.cards.length));
  opponent.deck.moveTo(opponent.hand, Math.min(4, opponent.deck.cards.length));
  return state;
}

export class Judge extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 9416,
      name: '裁判',
      yorenCode: 'Y219',
      cardType: '2',
      details: {
        regulationMarkText: 'E',
        collectionNumber: '141/153',
      },
      image: 'img\\181\\140.png',
      hash: '6985efccf64ba111458e336d4cced910',
    },
    collection: {
      id: 181,
      commodityCode: 'CS5DC',
      name: '勇魅群星 V起始卡组',
      salesDate: '2024-06-18',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/181/140.png',
  };

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_e';

  public name: string = 'Judge';

  public fullName: string = 'Judge CS5DC';

  public text: string = 'Each player shuffles their hand into their deck and draws 4 cards.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
