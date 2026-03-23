import {
  Card,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  PokemonCard,
  ShowCardsPrompt,
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
  self: SuperRod,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  let validCards = 0;
  const blocked: number[] = [];
  player.discard.cards.forEach((card, index) => {
    const isPokemon = card instanceof PokemonCard;
    const isBasicEnergy = card instanceof EnergyCard && card.energyType === EnergyType.BASIC;

    if (isPokemon || isBasicEnergy) {
      validCards += 1;
      return;
    }

    blocked.push(index);
  });

  if (validCards === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  effect.preventDefault = true;

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DECK,
      player.discard,
      {},
      { min: 1, max: Math.min(3, validCards), allowCancel: true, blocked }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  player.hand.moveCardTo(self, player.discard);

  yield store.prompt(
    state,
    new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selected),
    () => next()
  );

  player.discard.moveCardsTo(selected, player.deck);

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class SuperRod extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 11936,
      yorenCode: 'Y1207',
      name: '厉害钓竿',
      cardType: '2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '109/127',
      },
      image: 'img\\244\\296.png',
      hash: 'c12a094d561c7367595a04486b07ee46',
    },
    collection: {
      id: 244,
      name: '补充包 亘古开来',
      commodityCode: 'CSV1C',
      salesDate: '2025-01-17',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/244/296.png',
  };

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'set_g';

  public name: string = 'Super Rod';

  public fullName: string = 'Super Rod CSV1C';

  public text: string =
    'Shuffle up to 3 in any combination of Pokemon and Basic Energy cards from your discard pile into your deck.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
