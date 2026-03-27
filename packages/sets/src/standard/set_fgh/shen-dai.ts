import { Effect, GameError, GameMessage, State, StateUtils, StoreLike, TrainerEffect, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class ShenDai extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.fullName = seed.fullName;
  }

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_fgh';

  public name: string = '神代';

  public fullName: string = '神代 166/131';

  public text: string = '仅在手牌只剩这1张时可用。抽取与双方备战宝可梦总数相同数量的牌。';

  public rawData = {
    raw_card: {
      id: 10469,
      name: '神代',
      yorenCode: 'Y1108',
      cardType: '2',
      commodityCode: 'CS6bC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '166/131',
        rarityLabel: 'HR',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
        hp: null,
        evolveText: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/275.png',
      ruleLines: [
        '这张卡牌，只有在自己的手牌只剩这1张时才可使用。',
        '从自己牌库上方抽取与双方备战宝可梦合计数量相同数量的卡牌。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Hideki Ishikawa'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 206,
      commodityCode: 'CS6bC',
      name: '补充包 碧海暗影 逐',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/275.png',
  };

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;

      if (player.hand.cards.length !== 0) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      const opponent = StateUtils.getOpponent(state, player);
      const benchCount =
        player.bench.reduce((sum, slot) => sum + (slot.pokemons.cards.length > 0 ? 1 : 0), 0) +
        opponent.bench.reduce((sum, slot) => sum + (slot.pokemons.cards.length > 0 ? 1 : 0), 0);

      player.deck.moveTo(player.hand, benchCount);
    }

    return state;
  }
}
