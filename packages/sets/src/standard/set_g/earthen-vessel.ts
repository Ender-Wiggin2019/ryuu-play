import {
  Card,
  CardList,
  ChooseCardsPrompt,
  Effect,
  EnergyType,
  GameError,
  GameMessage,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  self: EarthenVessel,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const cardsInHand = player.hand.cards.filter(card => card !== self);
  if (cardsInHand.length < 1) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  effect.preventDefault = true;

  const handWithoutSelf = new CardList();
  handWithoutSelf.cards = cardsInHand;

  let discardedCards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      handWithoutSelf,
      {},
      { min: 1, max: 1, allowCancel: true }
    ),
    selected => {
      discardedCards = selected || [];
      next();
    }
  );

  if (discardedCards.length === 0) {
    return state;
  }

  player.hand.moveCardTo(self, player.discard);
  player.hand.moveCardsTo(discardedCards, player.discard);

  let selectedCards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.deck,
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
      { min: 0, max: 2, allowCancel: true }
    ),
    selected => {
      selectedCards = selected || [];
      next();
    }
  );

  player.deck.moveCardsTo(selectedCards, player.hand);

  if (selectedCards.length > 0) {
    yield store.prompt(
      state,
      new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selectedCards),
      () => next()
    );
  }

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class EarthenVessel extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 15702,
      yorenCode: 'Y1371',
      name: '大地容器',
      cardType: '2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '115/128',
      },
      image: 'img\\311\\316.png',
      hash: '3208fcf1343128ba5364398baec1f7a2',
    },
    collection: {
      id: 311,
      name: '补充包 真实玄虚',
      commodityCode: 'CSV6C',
      salesDate: '2025-11-07',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/316.png',
  };

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'set_g';

  public name: string = 'Earthen Vessel';

  public fullName: string = 'Earthen Vessel CSV6C';

  public text: string =
    'You can use this card only if you discard a card from your hand. Search your deck for up to 2 Basic Energy cards, ' +
    'reveal them, and put them into your hand. Then, shuffle your deck.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
