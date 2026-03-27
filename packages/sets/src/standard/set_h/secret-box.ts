import {
  Card,
  CardList,
  CardTag,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  State,
  StateUtils,
  StoreLike,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

const REQUIRED_TRAINER_TYPES = [
  TrainerType.ITEM,
  TrainerType.TOOL,
  TrainerType.SUPPORTER,
  TrainerType.STADIUM,
];

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  self: SecretBox,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const cardsInHand = player.hand.cards.filter(card => card !== self);
  if (cardsInHand.length < 3) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  // We will discard this card after prompt confirmation.
  effect.preventDefault = true;

  const handWithoutSecretBox = new CardList();
  handWithoutSecretBox.cards = cardsInHand;

  let discardedCards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      handWithoutSecretBox,
      {},
      { min: 3, max: 3, allowCancel: true }
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

  const selectedCards: Card[] = [];
  for (const requiredType of REQUIRED_TRAINER_TYPES) {
    const blocked: number[] = [];
    let availableCards = 0;
    player.deck.cards.forEach((card, index) => {
      if (!(card instanceof TrainerCard) || card.trainerType !== requiredType) {
        blocked.push(index);
      } else {
        availableCards += 1;
      }
    });

    if (availableCards === 0) {
      continue;
    }

    let selected: Card[] = [];
    yield store.prompt(
      state,
      new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_HAND,
        player.deck,
        {},
        { min: 0, max: 1, allowCancel: true, blocked }
      ),
      cards => {
        selected = cards || [];
        next();
      }
    );

    if (selected.length > 0) {
      player.deck.moveCardsTo(selected, player.hand);
      selectedCards.push(...selected);
    }
  }

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

export class SecretBox extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 17553,
      name: '秘密箱',
      yorenCode: 'Y1465',
      cardType: '2',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '176/207'
      },
      image: 'img/458/479.png',
      hash: 'caeb47c9cf36bb083a01450f2c59d6de'
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
      salesDate: '2026-03-13'
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/479.png'
  };

  public trainerType: TrainerType = TrainerType.ITEM;

  public tags = [CardTag.ACE_SPEC];

  public set: string = 'set_h';

  public name: string = 'Secret Box';

  public fullName: string = 'Secret Box CSV8C';

  public text: string =
    'You can use this card only if you discard 3 other cards from your hand. ' +
    'Search your deck for an Item card, a Pokemon Tool card, a Supporter card, ' +
    'and a Stadium card, reveal them, and put them into your hand. Then, shuffle your deck.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
