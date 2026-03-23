import {
  Card,
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

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  self: PalPad,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  let validSupporterCount = 0;
  const blocked: number[] = [];
  player.discard.cards.forEach((card, index) => {
    if (card instanceof TrainerCard && card.trainerType === TrainerType.SUPPORTER) {
      validSupporterCount += 1;
      return;
    }
    blocked.push(index);
  });

  if (validSupporterCount === 0) {
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
      { min: 1, max: Math.min(2, validSupporterCount), allowCancel: true, blocked }
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

export class PalPad extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 15750,
      name: '朋友手册',
      yorenCode: 'Y87',
      cardType: '2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '163/128',
      },
      image: 'img\\311\\392.png',
      hash: '1d171118b5f8c8c93e185bbf1e2def88',
    },
    collection: {
      id: 311,
      commodityCode: 'CSV6C',
      name: '补充包 真实玄虚',
      salesDate: '2025-11-07',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/311/392.png',
  };

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'set_g';

  public name: string = 'Pal Pad';

  public fullName: string = 'Pal Pad CSV6C';

  public text: string = 'Shuffle up to 2 Supporter cards from your discard pile into your deck.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
