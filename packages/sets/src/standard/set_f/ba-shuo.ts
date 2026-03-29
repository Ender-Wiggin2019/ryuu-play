import {
  Card,
  CardList,
  ChooseCardsPrompt,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  KnockOutEffect,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

const defaultSeed: VariantTrainerSeed = {
  set: 'set_h',
  name: '八朔',
  fullName: '八朔 233/204#16399',
  text: '这张卡牌，只有在上一个对手的回合，自己的宝可梦【昏厥】时才可使用。\n查看自己牌库上方8张卡牌，选择其中最多3张卡牌，加入手牌。将剩余的卡牌放回牌库并重洗牌库。\n在自己的回合只可以使用1张支援者卡。',
  trainerType: TrainerType.SUPPORTER,
  rawData: {
    raw_card: {
      id: 16399,
      name: '八朔',
      cardType: '2',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '233/204',
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
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/578.png',
      ruleLines: [
        '这张卡牌，只有在上一个对手的回合，自己的宝可梦【昏厥】时才可使用。',
        '查看自己牌库上方8张卡牌，选择其中最多3张卡牌，加入手牌。将剩余的卡牌放回牌库并重洗牌库。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/578.png',
  },
};

function shuffleCards<K>(cards: K[]): K[] {
  const shuffled = cards.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const index = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[index];
    shuffled[index] = temp;
  }
  return shuffled;
}

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  self: BaShuo,
  effect: TrainerEffect
): IterableIterator<State> {
  const player = effect.player;

  if (!player.marker.hasMarker(self.BA_SHUO_MARKER, self)) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  player.marker.removeMarker(self.BA_SHUO_MARKER, self);

  const topCards = new CardList();
  topCards.cards = player.deck.cards.splice(0, Math.min(8, player.deck.cards.length));
  if (topCards.cards.length === 0) {
    return state;
  }

  let selectedCards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      topCards,
      {},
      { min: 0, max: Math.min(3, topCards.cards.length), allowCancel: false }
    ),
    cards => {
      selectedCards = cards || [];
      next();
    }
  );

  if (selectedCards.length > 0) {
    topCards.moveCardsTo(selectedCards, player.hand);
  }

  if (topCards.cards.length > 0) {
    topCards.cards = shuffleCards(topCards.cards);
  }

  topCards.moveToTop(player.deck);
  return state;
}

export class BaShuo extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public readonly BA_SHUO_MARKER = 'BA_SHUO_MARKER';

  constructor(seed: VariantTrainerSeed = defaultSeed) {
    super(seed);
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    if (effect instanceof KnockOutEffect) {
      const cardList = StateUtils.findCardList(state, this);
      const owner = StateUtils.findOwner(state, cardList);
      if (owner !== undefined) {
        const opponent = StateUtils.getOpponent(state, owner);
        if (state.players[state.activePlayer] === opponent && effect.player === owner) {
          owner.marker.addMarker(this.BA_SHUO_MARKER, this);
        }
      }
    }

    if (effect instanceof EndTurnEffect) {
      const cardList = StateUtils.findCardList(state, this);
      const owner = StateUtils.findOwner(state, cardList);
      if (owner !== undefined && effect.player === owner) {
        owner.marker.removeMarker(this.BA_SHUO_MARKER, this);
      }
    }

    return state;
  }
}
