import {
  Card,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  PokemonSlot,
  ShuffleDeckPrompt,
  Stage,
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
  self: NestBall,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const slots: PokemonSlot[] = player.bench.filter(b => b.pokemons.cards.length === 0);

  if (slots.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const blocked: number[] = [];
  let available = 0;
  player.deck.cards.forEach((card, index) => {
    if (card instanceof PokemonCard && card.stage === Stage.BASIC) {
      available += 1;
      return;
    }
    blocked.push(index);
  });

  if (available === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  effect.preventDefault = true;

  let cards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
      player.deck,
      { superType: SuperType.POKEMON, stage: Stage.BASIC },
      { min: 1, max: 1, allowCancel: true, blocked }
    ),
    selected => {
      cards = selected || [];
      next();
    }
  );

  if (cards.length === 0) {
    return state;
  }

  player.hand.moveCardTo(self, player.discard);
  player.deck.moveCardTo(cards[0], slots[0].pokemons);
  slots[0].pokemonPlayedTurn = state.turn;

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class NestBall extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 12768,
      yorenCode: 'Y30',
      name: '巢穴球',
      cardType: '2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '110/128',
      },
      image: 'img\\253\\301.png',
      hash: 'eb7574725620980fd3f18f219cfb3553',
    },
    collection: {
      id: 253,
      name: '补充包 奇迹启程',
      commodityCode: 'CSV2C',
      salesDate: '2025-03-21',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/253/301.png',
  };

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'set_g';

  public name: string = 'Nest Ball';

  public fullName: string = 'Nest Ball CSV2C';

  public text: string =
    'Search your deck for a Basic Pokemon and put it onto your Bench. Then, shuffle your deck.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
