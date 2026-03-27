import {
  Card,
  CardList,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  ShuffleDeckPrompt,
  State,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_h',
  name: '暗码迷的解读',
  fullName: '暗码迷的解读 245/204#16411',
  text: '选择自己牌库中任意2张卡牌。将剩余的牌库重洗，将选择的卡牌以任意顺序重新排列，放回牌库上方。\n在自己的回合只可以使用1张支援者卡。',
  trainerType: TrainerType.SUPPORTER,
  rawData: {
    raw_card: {
      id: 16411,
      name: '暗码迷的解读',
      cardType: '2',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '245/204',
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
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/590.png',
      ruleLines: [
        '选择自己牌库中任意2张卡牌。将剩余的牌库重洗，将选择的卡牌以任意顺序重新排列，放回牌库上方。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/590.png',
  },
};

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.deck.cards.length < 2) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let selectedCards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.deck,
      {},
      { min: 2, max: 2, allowCancel: false }
    ),
    cards => {
      selectedCards = cards || [];
      next();
    }
  );

  if (selectedCards.length !== 2) {
    return state;
  }

  const selectedList = new CardList();
  selectedList.cards = selectedCards.slice();
  player.deck.moveCardsTo(selectedCards, selectedList);

  if (player.deck.cards.length > 0) {
    yield store.prompt(state, new ShuffleDeckPrompt(player.id), deckOrder => {
      player.deck.applyOrder(deckOrder);
      next();
    });
  }

  selectedList.moveToTop(player.deck);
  return state;
}

export class AnMaMiDeJieDu extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

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
