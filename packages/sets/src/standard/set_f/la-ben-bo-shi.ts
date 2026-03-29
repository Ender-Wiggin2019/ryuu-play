import {
  Card,
  CardList,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  PokemonCard,
  ShowCardsPrompt,
  State,
  StateUtils,
  StoreLike,
  TrainerEffect,
  TrainerType,
} from '@ptcg/common';

import { VariantTrainerCard, VariantTrainerSeed } from './variant-trainer-card';

function* playCard(
  next: Function,
  store: StoreLike,
  state: State,
  effect: TrainerEffect,
): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const targetCards = player.discard.cards.filter(card =>
    card instanceof PokemonCard && card.name.includes('洗翠')
  );

  if (targetCards.length === 0) {
    return state;
  }

  const discardList = new CardList();
  discardList.cards = targetCards.slice();

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      discardList,
      {},
      { min: 0, max: Math.min(3, discardList.cards.length), allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length > 0) {
    yield store.prompt(
      state,
      new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, selected),
      () => next()
    );
    player.discard.moveCardsTo(selected, player.hand);
  }

  return state;
}

export class LaBenBoShi extends VariantTrainerCard {
  constructor(seed: VariantTrainerSeed) {
    super(seed);
    this.fullName = seed.fullName;
  }

  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'set_f';

  public name: string = '拉苯博士';

  public fullName: string = '拉苯博士 156/S-P';

  public text: string = '从弃牌区选择最多3张名字中带有「洗翠」的宝可梦，在给对手看过之后加入手牌。';

  public rawData = {
    raw_card: {
      id: 10071,
      name: '拉苯博士',
      yorenCode: 'Y1038',
      cardType: '2',
      commodityCode: 'PROMO3',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '156/S-P',
        rarityLabel: '无标记',
        cardTypeLabel: '训练家',
        trainerTypeLabel: '支援者',
        hp: null,
        evolveText: null,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/32/155.png',
      ruleLines: [
        '选择自己弃牌区中，名字中带有「洗翠」的宝可梦最多3张，在给对手看过之后，加入手牌。',
        '在自己的回合只可以使用1张支援者卡。',
      ],
      attacks: [],
      features: [],
      illustratorNames: ['Ken Sugimori'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 32,
      commodityCode: 'PROMO3',
      name: '特典卡·剑&盾',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/32/155.png',
  };

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
