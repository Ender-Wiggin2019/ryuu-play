import {
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  ShuffleDeckPrompt,
  State,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.deck.cards.length === 0 && player.hand.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  player.hand.moveTo(player.deck);

  yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
  });

  player.deck.moveTo(player.hand, Math.min(8, player.deck.cards.length));

  return store.reduceEffect(state, new EndTurnEffect(player));
}

export class AFeng extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public rawData = {
    raw_card: {
      id: 12804,
      name: '阿枫',
      yorenCode: 'Y1258',
      cardType: '2',
      commodityCode: 'CSV2C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '146/128',
        rarityLabel: 'SR',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/253/375.png',
      ruleLines: [
        '如果使用了这张卡牌的话，则自己的回合结束。',
        '将自己的手牌全部放回牌库并重洗牌库。然后，从牌库上方抽取8张卡牌。',
        '在自己的回合只可以使用1张支援者卡。'
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Akira Komayama'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 253,
      commodityCode: 'CSV2C',
      name: '补充包 奇迹启程',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/253/375.png',
  };

  public set: string = 'set_g';

  public name: string = '阿枫';

  public fullName: string = '阿枫 146/128#12804';

  public text: string = '如果使用了这张卡牌的话，则自己的回合结束。\n将自己的手牌全部放回牌库并重洗牌库。然后，从牌库上方抽取8张卡牌。\n在自己的回合只可以使用1张支援者卡。';

  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.fullName = seed.fullName;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
