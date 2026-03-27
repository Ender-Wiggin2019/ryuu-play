import {
  Card,
  CardList,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  State,
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
  self: SuperEnergyRetrieval,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;

  const cardsInHand = player.hand.cards.filter(card => card !== self);
  if (cardsInHand.length < 2) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let basicEnergiesInDiscard = 0;
  player.discard.cards.forEach(card => {
    if (card instanceof EnergyCard && card.energyType === EnergyType.BASIC) {
      basicEnergiesInDiscard += 1;
    }
  });

  if (basicEnergiesInDiscard === 0) {
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
      { min: 2, max: 2, allowCancel: true }
    ),
    selected => {
      discardedCards = selected || [];
      next();
    }
  );

  if (discardedCards.length === 0) {
    return state;
  }

  const max = Math.min(4, basicEnergiesInDiscard);
  let recoveredCards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.discard,
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
      { min: 1, max, allowCancel: true }
    ),
    selected => {
      recoveredCards = selected || [];
      next();
    }
  );

  if (recoveredCards.length === 0) {
    return state;
  }

  player.hand.moveCardTo(self, player.discard);
  player.hand.moveCardsTo(discardedCards, player.discard);
  player.discard.moveCardsTo(recoveredCards, player.hand);

  return state;
}

export class SuperEnergyRetrieval extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 13278,
      yorenCode: 'Y1287',
      name: '超级能量回收',
      cardType: '2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '115/130',
      },
      image: 'img\\270\\314.png',
      hash: '5b306dbce92dbde754afad0fdcb9f877',
    },
    collection: {
      id: 270,
      name: '补充包 无畏太晶',
      commodityCode: 'CSV3C',
      salesDate: '2025-05-16',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/314.png',
  };

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'set_g';

  public name: string = 'Super Energy Retrieval';

  public fullName: string = 'Super Energy Retrieval CSV3C';

  public text: string =
    'You can use this card only if you discard 2 cards from your hand. Put up to 4 Basic Energy cards from your discard pile into your hand. ' +
    '(You can\'t choose cards that were discarded with the effect of this card.)';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
