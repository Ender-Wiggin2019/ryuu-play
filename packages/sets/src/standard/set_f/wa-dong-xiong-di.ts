import {
  Card,
  CardList,
  ChooseCardsPrompt,
  CoinFlipPrompt,
  Effect,
  GameError,
  GameMessage,
  ShuffleDeckPrompt,
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

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let heads = false;
  yield store.prompt(state, new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP), result => {
    heads = result === true;
    next();
  });

  const count = heads ? 8 : 3;
  const bottomCards = new CardList();
  bottomCards.cards = player.deck.cards.slice(-Math.min(count, player.deck.cards.length));

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      bottomCards,
      {},
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length > 0) {
    player.deck.moveCardsTo(selected, player.hand);
  }

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class WaDongXiongDi extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.fullName = seed.fullName;
  }

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_f';

  public name: string = '挖洞兄弟';

  public fullName: string = '挖洞兄弟 193/S-P';

  public text: string = '投1次硬币。正面看牌库下方8张，反面看下方3张，选择1张加入手牌，其余重洗。';

  public rawData = {
    raw_card: {
      id: 10918,
      name: '挖洞兄弟',
      yorenCode: 'Y1154',
      cardType: '2',
      commodityCode: 'PROMO3',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '193/S-P',
        rarityLabel: '无标记',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
        hp: null,
        evolveText: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/32/192.png',
      ruleLines: [
        '抛掷1次硬币。如果为正面则查看自己牌库下方8张卡牌，如果为反面则查看自己牌库下方3张卡牌，选择其中1张卡牌，加入手牌。将剩余的卡牌放回牌库并重洗牌库。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Yuu Nishida'],
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
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/32/192.png',
  };

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
