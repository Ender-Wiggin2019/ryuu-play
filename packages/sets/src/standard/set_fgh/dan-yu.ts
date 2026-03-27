import { Effect, State, StoreLike, TrainerEffect, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_h',
  name: '丹瑜',
  fullName: '丹瑜 255/207#17632',
  text: '这张卡牌，即使是先攻玩家的最初回合也可以使用。\n将自己的手牌全部放于弃牌区，从牌库上方抽取5张卡牌。\n在自己的回合只可以使用1张支援者卡。',
  trainerType: TrainerType.SUPPORTER,
  canUseOnFirstTurn: true,
  rawData: {
    raw_card: {
      id: 17632,
      name: '丹瑜',
      yorenCode: 'Y1440',
      cardType: '2',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '255/207',
        rarityLabel: 'SAR',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
        attributeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: null,
        evolveText: null,
        weakness: null,
        resistance: null,
        retreatCost: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/606.png',
      ruleLines: [
        '这张卡牌，即使是先攻玩家的最初回合也可以使用。',
        '将自己的手牌全部放于弃牌区，从牌库上方抽取5张卡牌。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
      illustratorNames: ['OKACHEKE'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/606.png',
  },
};

function* playCard(_next: Function, _store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const cardsInHand = player.hand.cards.slice();

  player.hand.moveCardsTo(cardsInHand, player.discard);
  player.deck.moveTo(player.hand, Math.min(5, player.deck.cards.length));
  return state;
}

export class DanYu extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
