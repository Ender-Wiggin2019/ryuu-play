import {
  Card,
  CardList,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  MoveDeckCardsToDiscardEffect,
  OrderCardsPrompt,
  State,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.deck.cards.length === 0) {
    return state;
  }

  const topCards = new CardList();
  topCards.cards = player.deck.cards.splice(0, Math.min(5, player.deck.cards.length));

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      topCards,
      {},
      { min: 0, max: topCards.cards.length, allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length > 0) {
    state = store.reduceEffect(state, new MoveDeckCardsToDiscardEffect(player, player, topCards, selected));
  }

  if (topCards.cards.length > 0) {
    let order: number[] = [];
    yield store.prompt(
      state,
      new OrderCardsPrompt(player.id, GameMessage.CHOOSE_CARDS_ORDER, topCards, { allowCancel: false }),
      result => {
        order = result || [];
        next();
      }
    );

    topCards.applyOrder(order);
  }

  topCards.moveToTop(player.deck);
  return state;
}

export class LeiHe extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public rawData = {
    raw_card: {
      id: 15581,
      name: '蕾荷',
      yorenCode: 'Y1326',
      cardType: '2',
      commodityCode: 'CSVE2C2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '195/207',
        rarityLabel: '无标记',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/203.png',
      ruleLines: [
        '查看自己牌库上方5张卡牌，选择其中任意数量的卡牌，放于弃牌区。将剩余的卡牌以任意顺序重新排列，放回牌库上方。',
        '在自己的回合只可以使用1张支援者卡。'
      ],
      attacks: [],
      features: [],
      illustratorNames: ['hncl'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 308,
      commodityCode: 'CSVE2C2',
      name: '对战派对 耀梦 下',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/203.png',
  };

  public set: string = 'set_g';

  public name: string = '蕾荷';

  public fullName: string = '蕾荷 195/207#15581';

  public text: string = '查看自己牌库上方5张卡牌，选择其中任意数量的卡牌，放于弃牌区。将剩余的卡牌以任意顺序重新排列，放回牌库上方。\n在自己的回合只可以使用1张支援者卡。';

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.fullName = seed.fullName;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
