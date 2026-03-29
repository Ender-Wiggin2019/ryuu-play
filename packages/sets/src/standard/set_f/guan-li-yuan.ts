import { Effect, ShuffleDeckPrompt, State, StateUtils, StoreLike, TrainerEffect, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_h',
  name: '管理员',
  fullName: '管理员 235/207#17612',
  text: '从自己牌库上方抽取2张卡牌。然后，如果场上有「公民馆」的话，则不将这张「管理员」放于弃牌区，而是放回牌库并重洗牌库。\n在自己的回合只可以使用1张支援者卡。',
  trainerType: TrainerType.SUPPORTER,
  rawData: {
    raw_card: {
      id: 17612,
      name: '管理员',
      yorenCode: 'Y1483',
      cardType: '2',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '235/207',
        rarityLabel: 'SR',
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
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/586.png',
      ruleLines: [
        '从自己牌库上方抽取2张卡牌。然后，如果场上有「公民馆」的话，则不将这张「管理员」放于弃牌区，而是放回牌库并重洗牌库。',
        '在自己的回合只可以使用1张支援者卡。',
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
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/586.png',
  },
};

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const stadium = StateUtils.getStadiumCard(state);

  player.deck.moveTo(player.hand, Math.min(2, player.deck.cards.length));

  if (stadium !== undefined && stadium.name === '公民馆') {
    player.hand.moveCardTo(effect.trainerCard, player.deck);
    return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
      player.deck.applyOrder(order);
    });
  }

  return state;
}

export class GuanLiYuan extends VariantTrainerCard {
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
