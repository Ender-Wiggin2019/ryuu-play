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

function shuffleCards<T>(cards: T[]): T[] {
  const shuffled = cards.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[randomIndex];
    shuffled[randomIndex] = temp;
  }
  return shuffled;
}

function shufflePrizeSlots(prizes: CardList[]): void {
  const prizeStacks = prizes.map(prize => prize.cards.slice());
  const shuffledStacks = shuffleCards(prizeStacks);

  prizes.forEach((prize, index) => {
    prize.cards = shuffledStacks[index];
  });
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
  effect.preventDefault = true;

  secretPrizes.forEach(prize => {
    prize.isSecret = false;
  });

  const prizeCards = new CardList();
  const prizeByFlatIndex: CardList[] = [];
  secretPrizes.forEach(prize => {
    prize.cards.forEach(card => {
      prizeCards.cards.push(card);
      prizeByFlatIndex.push(prize);
    });
  });

  const blocked: number[] = [];
  prizeCards.cards.forEach((card, index) => {
    if (!(card instanceof PokemonCard) || card.stage !== Stage.BASIC) {
      blocked.push(index);
    }
  });

  let selected: Card[] = [];
  let selectedIndex: number | undefined;
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_PRIZE_CARD,
      prizeCards,
      {},
      { min: 0, max: 1, allowCancel: true, blocked }
    ),
    selectedCards => {
      if (selectedCards === null || selectedCards === undefined || selectedCards.length === 0) {
        selected = [];
        selectedIndex = undefined;
        next();
        return;
      }

      if (typeof selectedCards[0] === 'number') {
        selectedIndex = selectedCards[0] as unknown as number;
        const selectedCard = prizeCards.cards[selectedIndex];
        selected = selectedCard !== undefined ? [selectedCard] : [];
      } else {
        selected = selectedCards as Card[];
        selectedIndex = prizeCards.cards.indexOf(selected[0]);
      }
      next();
    }
  );

  secretPrizes.forEach(prize => {
    prize.isSecret = true;
  });

  if (selected.length === 0) {
    player.hand.moveCardTo(self, player.discard);
    return state;
  }

  const selectedCard = selected[0];
  const selectedPrize =
    (selectedIndex !== undefined ? prizeByFlatIndex[selectedIndex] : undefined)
    || player.prizes.find(prize => prize.cards.includes(selectedCard));
  if (!selectedPrize) {
    player.hand.moveCardTo(self, player.discard);
    return state;
  }

  yield store.prompt(
    state,
    new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, [selectedCard]),
    () => next()
  );

  selectedPrize.moveCardTo(selectedCard, player.hand);
  player.hand.moveCardTo(self, selectedPrize);

  shufflePrizeSlots(secretPrizes);

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
