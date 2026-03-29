import {
  CardList,
  Effect,
  GameMessage,
  ShowCardsPrompt,
  State,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  player.deck.moveTo(player.hand, Math.min(2, player.deck.cards.length));

  const prizeCards = new CardList();
  player.prizes.forEach(prize => {
    prizeCards.cards.push(...prize.cards);
  });

  if (prizeCards.cards.length > 0) {
    yield store.prompt(state, new ShowCardsPrompt(player.id, GameMessage.REVEAL_PRIZE_CARD, prizeCards.cards), () =>
      next()
    );
  }

  return state;
}

export class NaiNaiMeiDeXieZhu extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public rawData = {
    raw_card: {
      id: 14389,
      name: '奈奈美的协助',
      yorenCode: 'Y1324',
      cardType: '2',
      commodityCode: 'CSV4C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '150/129',
        rarityLabel: 'SR',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/379.png',
      ruleLines: [
        '从自己牌库上方抽取2张卡牌。查看所有反面朝上的自己的奖赏卡，再放回原处。',
        '在自己的回合只可以使用1张支援者卡。'
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Fumie Kittaka'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 285,
      commodityCode: 'CSV4C',
      name: '补充包 嘉奖回合',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/379.png',
  };

  public set: string = 'set_g';

  public name: string = '奈奈美的协助';

  public fullName: string = '奈奈美的协助 150/129#14389';

  public text: string = '从自己牌库上方抽取2张卡牌。查看所有反面朝上的自己的奖赏卡，再放回原处。\n在自己的回合只可以使用1张支援者卡。';

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
