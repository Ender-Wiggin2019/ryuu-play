import { Effect, GameMessage, SelectPrompt, State, StoreLike, TrainerEffect, TrainerType } from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const opponent = state.players.find(p => p.id !== player.id);

  if (opponent === undefined) {
    return state;
  }

  player.deck.moveTo(player.hand, 3);

  let choice = 0;
  yield store.prompt(
    state,
    new SelectPrompt(opponent.id, GameMessage.CHOOSE_OPTION, ['不抽', '抽1张'], { allowCancel: false }),
    result => {
      choice = result ?? 0;
      next();
    }
  );

  if (choice === 1) {
    opponent.deck.moveTo(opponent.hand, 1);
    player.deck.moveTo(player.hand, 1);
  }

  return state;
}

export class MiKeLi extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.fullName = seed.fullName;
  }

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_f';

  public name: string = '米可利';

  public fullName: string = '米可利 165/131';

  public text: string = '抽3张牌。对手可选择再抽1张；若如此，你再抽1张。';

  public rawData = {
    raw_card: {
      id: 10750,
      name: '米可利',
      yorenCode: 'Y1138',
      cardType: '2',
      commodityCode: 'CS6aC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '165/131',
        rarityLabel: 'HR',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
        hp: null,
        evolveText: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/208/272.png',
      ruleLines: [
        '从自己牌库上方抽取3张卡牌。对手若希望，可从牌库上方抽取1张卡牌。在这种情况下，自己额外从牌库上方抽取1张卡牌。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Ryuta Fuse'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 208,
      commodityCode: 'CS6aC',
      name: '补充包 碧海暗影 啸',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/208/272.png',
  };

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
