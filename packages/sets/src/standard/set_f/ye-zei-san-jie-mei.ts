import {
  Card,
  CardList,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  TrainerCard,
  MoveDeckCardsToDiscardEffect,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  if (opponent.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const topCards = new CardList();
  topCards.cards = opponent.deck.cards.splice(0, Math.min(5, opponent.deck.cards.length));
  const itemCount = topCards.cards.filter(
    card => card instanceof TrainerCard && card.superType === SuperType.TRAINER && card.trainerType === TrainerType.ITEM
  ).length;

  if (itemCount > 0) {
    let selected: Card[] = [];
    yield store.prompt(
      state,
      new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_DECK,
        topCards,
        { superType: SuperType.TRAINER, trainerType: TrainerType.ITEM },
        { min: 0, max: itemCount, allowCancel: false }
      ),
      cards => {
        selected = cards || [];
        next();
      }
    );

    if (selected.length > 0) {
      state = store.reduceEffect(state, new MoveDeckCardsToDiscardEffect(player, opponent, topCards, selected));
      yield store.prompt(state, new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selected), () =>
        next()
      );
    }
  }

  topCards.moveTo(opponent.deck);

  return store.prompt(state, new ShuffleDeckPrompt(opponent.id), order => {
    opponent.deck.applyOrder(order);
  });
}

export class YeZeiSanJieMei extends VariantTrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public rawData = {
    raw_card: {
      id: 10751,
      name: '野贼三姐妹',
      yorenCode: 'Y1139',
      cardType: '2',
      commodityCode: 'CS6aC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '166/131',
        rarityLabel: 'HR',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/208/273.png',
      ruleLines: [
        '查看对手牌库上方5张卡牌，选择其中任意数量的物品，放于弃牌区。将剩余的卡牌放回牌库并重洗牌库。',
        '在自己的回合只可以使用1张支援者卡。'
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Souichirou Gunjima'],
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
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/208/273.png',
  };

  public set: string = 'set_f';

  public name: string = '野贼三姐妹';

  public fullName: string = '野贼三姐妹 166/131#10751';

  public text: string = '查看对手牌库上方5张卡牌，选择其中任意数量的物品，放于弃牌区。将剩余的卡牌放回牌库并重洗牌库。\n在自己的回合只可以使用1张支援者卡。';

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
