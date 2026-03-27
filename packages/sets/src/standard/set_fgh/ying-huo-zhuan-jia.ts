import {
  Card,
  CardList,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
  ShuffleDeckPrompt,
  State,
  StoreLike,
  SuperType,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { searchCardsToHand } from '../../common/utils/search-cards-to-hand';
import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;

  const fireEnergyCount = player.hand.cards.filter(card =>
    card instanceof EnergyCard && card.energyType === EnergyType.BASIC && card.provides.includes(CardType.FIRE)
  ).length;

  if (fireEnergyCount === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  let discarded: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      player.hand,
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.FIRE] },
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      discarded = cards || [];
      next();
    }
  );

  if (discarded.length === 0) {
    return state;
  }

  player.hand.moveCardsTo(discarded, player.discard);

  if (player.deck.cards.length === 0) {
    return state;
  }

  const topCards = new CardList();
  topCards.cards = player.deck.cards.splice(0, Math.min(7, player.deck.cards.length));

  yield* searchCardsToHand(
    next,
    store,
    state,
    player,
    topCards,
    {},
    {
      min: 0,
      max: Math.min(2, topCards.cards.length),
      allowCancel: false,
      showToOpponent: true,
      shuffleAfterSearch: false,
    }
  );

  topCards.moveTo(player.deck);

  if (player.deck.cards.length > 0) {
    return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
      player.deck.applyOrder(order);
    });
  }

  return state;
}

export class YingHuoZhuanJia extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.fullName = seed.fullName;
  }

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_fgh';

  public name: string = '营火专家';

  public fullName: string = '营火专家 176/207';

  public text: string = '将手牌中的1张火能量弃置后，从牌库上方7张卡中选择最多2张加入手牌，其余重洗回牌库。';

  public rawData = {
    raw_card: {
      id: 14218,
      name: '营火专家',
      yorenCode: 'Y1026',
      cardType: '2',
      commodityCode: 'CSVE2C2',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '176/207',
        rarityLabel: '无标记',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
        hp: null,
        evolveText: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/180.png',
      ruleLines: [
        '这张卡牌，只有将自己手牌中的1张【火】能量放于弃牌区后才可使用。',
        '查看自己牌库上方7张卡牌，选择其中最多2张卡牌，加入手牌。将剩余的卡牌放回牌库并重洗牌库。',
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
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/180.png',
  };

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
