import { Effect, ShuffleDeckPrompt, State, StoreLike, TrainerEffect, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

export class DuanKuXiaoZi extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.fullName = seed.fullName;
  }

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_f';

  public name: string = '短裤小子';

  public fullName: string = '短裤小子 183/207';

  public text: string = '将手牌全部洗回牌库，然后抽5张牌。';

  public rawData = {
    raw_card: {
      id: 14223,
      name: '短裤小子',
      yorenCode: 'Y1243',
      cardType: '2',
      commodityCode: 'CSVE2C2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '183/207',
        rarityLabel: '无标记☆★',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
        hp: null,
        evolveText: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/187.png',
      ruleLines: [
        '将自己的手牌全部放回牌库并重洗牌库。然后，从牌库上方抽取5张卡牌。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Hitoshi Ariga'],
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
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/187.png',
  };

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;
      const cards = player.hand.cards.filter(card => card !== this);
      player.hand.moveCardsTo(cards, player.deck);
      return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
        player.deck.applyOrder(order);
        player.deck.moveTo(player.hand, 5);
      });
    }

    return state;
  }
}
