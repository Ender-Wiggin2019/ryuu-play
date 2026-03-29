import {
  Effect,
  GameError,
  GameMessage,
  State,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const drawCount = state.turn === 2 && state.activePlayer === 1 ? 8 : 4;

  if (player.deck.cards.length === 0 && player.hand.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  player.hand.moveTo(player.deck);
  player.deck.moveTo(player.hand, Math.min(drawCount, player.deck.cards.length));

  return state;
}

export class YangSanJieJie extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public rawData = {
    raw_card: {
      id: 14399,
      name: '阳伞姐姐',
      yorenCode: 'Y1325',
      cardType: '2',
      commodityCode: 'CSV4C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '160/129',
        rarityLabel: 'SAR',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/389.png',
      ruleLines: [
        '将自己的手牌全部放回牌库并重洗牌库。然后，从牌库上方抽取4张卡牌。如果是后攻玩家的最初回合的话，则抽取的卡牌张数变为8张。',
        '在自己的回合只可以使用1张支援者卡。'
      ],
      attacks: [],
      features: [],
      illustratorNames: ['En Morikura'],
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
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/389.png',
  };

  public set: string = 'set_g';

  public name: string = '阳伞姐姐';

  public fullName: string = '阳伞姐姐 160/129#14399';

  public text: string = '将自己的手牌全部放回牌库并重洗牌库。然后，从牌库上方抽取4张卡牌。如果是后攻玩家的最初回合的话，则抽取的卡牌张数变为8张。\n在自己的回合只可以使用1张支援者卡。';

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
