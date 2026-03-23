import {
  Card,
  CardList,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  PokemonCard,
  ShowCardsPrompt,
  Stage,
  State,
  StoreLike,
  TrainerCard,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

function shuffleCards(cards: Card[]): Card[] {
  const shuffled = cards.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[randomIndex];
    shuffled[randomIndex] = temp;
  }
  return shuffled;
}

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  self: HisuianHeavyBall,
  effect: TrainerEffect
): IterableIterator<State> {
  const player = effect.player;
  const opponent = state.players.find(p => p.id !== player.id)!;
  const secretPrizes = player.prizes.filter(prize => prize.isSecret && prize.cards.length > 0);

  secretPrizes.forEach(prize => {
    prize.isSecret = false;
  });

  const prizeCards = new CardList();
  secretPrizes.forEach(prize => {
    prize.cards.forEach(card => prizeCards.cards.push(card));
  });

  const blocked: number[] = [];
  prizeCards.cards.forEach((card, index) => {
    if (!(card instanceof PokemonCard) || card.stage !== Stage.BASIC) {
      blocked.push(index);
    }
  });

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_PRIZE_CARD,
      prizeCards,
      {},
      { min: 0, max: 1, allowCancel: true, blocked }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  secretPrizes.forEach(prize => {
    prize.isSecret = true;
  });

  if (selected.length === 0) {
    return state;
  }

  const selectedCard = selected[0];
  const selectedPrize = player.prizes.find(prize => prize.cards.includes(selectedCard));
  if (!selectedPrize) {
    return state;
  }

  yield store.prompt(
    state,
    new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, [selectedCard]),
    () => next()
  );

  effect.preventDefault = true;
  selectedPrize.moveCardTo(selectedCard, player.hand);
  player.hand.moveCardTo(self, selectedPrize);

  const hiddenPrizeSlots = player.prizes.filter(prize => prize.isSecret && prize.cards.length > 0);
  const hiddenPrizeCards = hiddenPrizeSlots.map(prize => prize.cards[0]);
  const shuffledHiddenPrizeCards = shuffleCards(hiddenPrizeCards);
  hiddenPrizeSlots.forEach((prize, index) => {
    prize.cards = [shuffledHiddenPrizeCards[index]];
  });

  return state;
}

export class HisuianHeavyBall extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 15561,
      name: '洗翠的沉重球',
      yorenCode: 'Y1078',
      cardType: '2',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '157/207',
      },
      image: 'img\\308\\159.png',
      hash: '6510edef51f359c2752e70ca5fa5f162',
    },
    collection: {
      id: 308,
      name: '对战派对 耀梦 下',
      commodityCode: 'CSVE2C2',
      salesDate: '2025-10-17',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/308/159.png',
  };

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'set_f';

  public name: string = 'Hisuian Heavy Ball';

  public fullName: string = 'Hisuian Heavy Ball CSVE2C2';

  public text: string =
    'Look at your face-down Prize cards. You may reveal a Basic Pokemon you find there, put it into your hand, ' +
    'and put this Hisuian Heavy Ball in its place as a face-down Prize card. ' +
    '(If you don\'t reveal a Basic Pokemon, put this card in the discard pile.) Then, shuffle your face-down Prize cards.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
