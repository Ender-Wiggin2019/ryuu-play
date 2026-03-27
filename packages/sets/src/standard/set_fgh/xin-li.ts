import {
  Card,
  CardList,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  State,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.deck.cards.length < 2) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const topCards = new CardList();
  topCards.cards = player.deck.cards.splice(0, Math.min(4, player.deck.cards.length));

  if (topCards.cards.length < 2) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      topCards,
      {},
      { min: 2, max: 2, allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  topCards.moveCardsTo(selected, player.hand);
  topCards.moveToBottom(player.deck);

  return state;
}

export class XinLi extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public rawData = {
    raw_card: {
      id: 17270,
      name: '辛俐',
      yorenCode: 'Y1323',
      cardType: '2',
      commodityCode: 'promosvPaldea',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '204/SV-P',
        rarityLabel: '无标记',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/456/3.png',
      ruleLines: [
        '查看自己牌库上方4张卡牌，选择其中2张卡牌，加入手牌。将剩余的卡牌全部翻到反面重洗，放回牌库下方。',
        '在自己的回合只可以使用1张支援者卡。'
      ],
      attacks: [],
      features: [],
      illustratorNames: ['GIDORA'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 456,
      commodityCode: 'promosvPaldea',
      name: '帕底亚训练家合影卡挂件套装&对战礼盒',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/456/3.png',
  };

  public set: string = 'set_g';

  public name: string = '辛俐';

  public fullName: string = '辛俐 204/SV-P#17270';

  public text: string = '查看自己牌库上方4张卡牌，选择其中2张卡牌，加入手牌。将剩余的卡牌全部翻到反面重洗，放回牌库下方。\n在自己的回合只可以使用1张支援者卡。';

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
