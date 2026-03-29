import {
  Card,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  SelectPrompt,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  if (opponent.hand.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DECK,
      opponent.hand,
      {},
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length > 0) {
    opponent.hand.moveCardsToBottom(selected, opponent.deck);
  }

  let choice = 0;
  yield store.prompt(
    state,
    new SelectPrompt(opponent.id, GameMessage.CHOOSE_OPTION, ['不抽取', '抽1张牌'], { allowCancel: false, defaultValue: 0 }),
    result => {
      choice = result ?? 0;
      next();
    }
  );

  if (choice === 1 && opponent.deck.cards.length > 0) {
    opponent.deck.moveTo(opponent.hand, 1);
  }

  return state;
}

export class AoErDiJia extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public rawData = {
    raw_card: {
      id: 14387,
      name: '奥尔迪加',
      yorenCode: 'Y1322',
      cardType: '2',
      commodityCode: 'CSV4C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '148/129',
        rarityLabel: 'SR',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/377.png',
      ruleLines: [
        '查看对手的手牌，选择其中任意1张卡牌，放回对手的牌库下方。然后，对手若希望，可从牌库上方抽取1张卡牌。',
        '在自己的回合只可以使用1张支援者卡。'
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Naoki Saito'],
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
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/377.png',
  };

  public set: string = 'set_g';

  public name: string = '奥尔迪加';

  public fullName: string = '奥尔迪加 148/129#14387';

  public text: string = '查看对手的手牌，选择其中任意1张卡牌，放回对手的牌库下方。然后，对手若希望，可从牌库上方抽取1张卡牌。\n在自己的回合只可以使用1张支援者卡。';

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
