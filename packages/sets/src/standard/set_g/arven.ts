import {
  Card,
  ChooseCardsPrompt,
  Effect,
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

const REQUIRED_TRAINER_TYPES = [TrainerType.ITEM, TrainerType.TOOL];

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const selectedCards: Card[] = [];

  for (const requiredType of REQUIRED_TRAINER_TYPES) {
    const blocked: number[] = [];
    let availableCards = 0;

    player.deck.cards.forEach((card, index) => {
      if (card instanceof TrainerCard && card.trainerType === requiredType) {
        availableCards += 1;
      } else {
        blocked.push(index);
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

export class Arven extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 11950,
      name: '派帕',
      yorenCode: 'Y1214',
      cardType: '2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '123/127'
      },
      image: 'img\\244\\338.png',
      hash: '933a00c5d33df74b5d882a1326dbb2a8'
    },
    collection: {
      id: 244,
      commodityCode: 'CSV1C',
      name: '补充包 亘古开来',
      salesDate: '2025-01-17'
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/244/338.png'
  };

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_g';

  public name: string = 'Arven';

  public fullName: string = 'Arven CSV1C';

  public text: string =
    'Search your deck for an Item card and a Pokemon Tool card, reveal them, ' +
    'and put them into your hand. Then, shuffle your deck.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
