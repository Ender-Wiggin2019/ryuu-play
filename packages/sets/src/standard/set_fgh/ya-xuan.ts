import {
  Card,
  CardList,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  MoveDeckCardsToDiscardEffect,
  ShowCardsPrompt,
  State,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const opponent = state.players.find(p => p.id !== player.id);

  if (player.deck.cards.length === 0 || opponent === undefined) {
    return state;
  }

  const topCards = new CardList();
  topCards.cards = player.deck.cards.splice(0, Math.min(5, player.deck.cards.length));

  yield store.prompt(
    state,
    new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, topCards.cards),
    () => next()
  );

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      opponent.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      topCards,
      {},
      { min: Math.min(2, topCards.cards.length), max: Math.min(2, topCards.cards.length), allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length > 0) {
    state = store.reduceEffect(state, new MoveDeckCardsToDiscardEffect(player, player, topCards, selected));
  }

  topCards.moveTo(player.hand);

  return state;
}

export class YaXuan extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.fullName = seed.fullName;
  }

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_fgh';

  public name: string = '亚玄';

  public fullName: string = '亚玄 162/S-P';

  public text: string = '翻开牌库上方5张，对手从中选择2张弃牌，剩余加入手牌。';

  public rawData = {
    raw_card: {
      id: 10077,
      name: '亚玄',
      yorenCode: 'Y1044',
      cardType: '2',
      commodityCode: 'PROMO3',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '162/S-P',
        rarityLabel: '无标记',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
        hp: null,
        evolveText: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/32/161.png',
      ruleLines: [
        '将自己牌库上方5张卡牌翻成正面，让对手选择其中2张卡牌。自己将被选择的卡牌放于弃牌区，将剩余的卡牌加入手牌。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Ken Sugimori'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 32,
      commodityCode: 'PROMO3',
      name: '特典卡·剑&盾',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/32/161.png',
  };

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
