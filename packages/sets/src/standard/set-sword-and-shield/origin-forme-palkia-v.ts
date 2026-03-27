import {
  AttackEffect,
  Card,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  Stage,
  State,
  StoreLike,
  SuperType,
  TrainerType,
  UseAttackEffect,
} from '@ptcg/common';

import { commonMarkers } from '../../common';

function* useRuleTheRegion(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  let cards: Card[] = [];

  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.deck,
      { superType: SuperType.TRAINER, trainerType: TrainerType.STADIUM },
      { min: 0, max: 1, allowCancel: true }
    ),
    selected => {
      cards = selected || [];
      next();
    }
  );

  player.deck.moveCardsTo(cards, player.hand);

  if (cards.length > 0) {
    const opponentId = state.players.find(p => p.id !== player.id)?.id;
    if (opponentId !== undefined) {
      yield store.prompt(state, new ShowCardsPrompt(opponentId, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, cards), () => next());
    }
  }

  yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
    next();
  });

  return state;
}

export class OriginFormePalkiaV extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 9554,
      name: '起源帕路奇亚V',
      yorenCode: 'Y927',
      cardType: '1',
      commodityCode: 'CS5bC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '050/128'
      },
      image: 'img/182/90.png',
      hash: 'fafc1aabc387c793374c1afd4bb3eaf4'
    },
    collection: {
      id: 182,
      commodityCode: 'CS5bC',
      name: '补充包 勇魅群星 勇',
      salesDate: '2024-06-18'
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/182/90.png'
  };

  public tags = [CardTag.POKEMON_V];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 220;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Rule the Region',
      cost: [CardType.WATER],
      damage: '',
      text: 'Search your deck for a Stadium card, reveal it, and put it into your hand. Then, shuffle your deck.',
    },
    {
      name: 'Hydro Break',
      cost: [CardType.WATER, CardType.WATER, CardType.COLORLESS],
      damage: '200',
      text: 'During your next turn, this Pokemon can\'t use Hydro Break.',
    },
  ];

  public set: string = 'SSH';

  public name: string = 'Origin Forme Palkia V';

  public fullName: string = 'Origin Forme Palkia V SSH';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    const duringYourNextTurn = commonMarkers.duringYourNextTurn(this, store, state, effect);

    if (effect instanceof UseAttackEffect && effect.attack === this.attacks[1] && duringYourNextTurn.hasMarker(effect)) {
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useRuleTheRegion(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      duringYourNextTurn.setMarker(effect);
      return state;
    }

    return state;
  }
}
