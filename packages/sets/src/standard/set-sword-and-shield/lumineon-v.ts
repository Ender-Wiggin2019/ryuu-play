import {
  AttackEffect,
  Card,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  PlayPokemonEffect,
  PokemonCard,
  PowerEffect,
  PowerType,
  ShowCardsPrompt,
  ShuffleDeckPrompt,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
  TrainerType,
} from '@ptcg/common';

function* useLuminousSign(
  next: Function,
  store: StoreLike,
  state: State,
  self: LumineonV,
  effect: PlayPokemonEffect
): IterableIterator<State> {
  const player = effect.player;

  if (player.deck.cards.length === 0) {
    return state;
  }

  try {
    const powerEffect = new PowerEffect(player, self.powers[0], self);
    store.reduceEffect(state, powerEffect);
  } catch {
    return state;
  }

  let cards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      player.deck,
      { superType: SuperType.TRAINER, trainerType: TrainerType.SUPPORTER },
      { min: 0, max: 1, allowCancel: true }
    ),
    selected => {
      cards = selected || [];
      next();
    }
  );

  player.deck.moveCardsTo(cards, player.hand);

  if (cards.length > 0) {
    const opponent = StateUtils.getOpponent(state, player);
    yield store.prompt(state, new ShowCardsPrompt(opponent.id, GameMessage.CARDS_SHOWED_BY_THE_OPPONENT, cards), () => next());
  }

  yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
    next();
  });

  return state;
}

export class LumineonV extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 9553,
      name: '霓虹鱼V',
      yorenCode: 'Y972',
      cardType: '1',
      commodityCode: 'CS5bC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '049/128'
      },
      image: 'img/182/89.png',
      hash: 'f7aac4d15e6f675f7052a28539daf5de'
    },
    collection: {
      id: 182,
      commodityCode: 'CS5bC',
      name: '补充包 勇魅群星 勇',
      salesDate: '2024-06-18'
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/182/89.png'
  };

  public tags = [CardTag.POKEMON_V];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 170;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: 'Luminous Sign',
      powerType: PowerType.ABILITY,
      text:
        'When you play this Pokemon from your hand onto your Bench during your turn, you may search your deck for a Supporter card, reveal it, and put it into your hand. Then, shuffle your deck.',
    },
  ];

  public attacks = [
    {
      name: 'Aqua Return',
      cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
      damage: '120',
      text: 'Shuffle this Pokemon and all attached cards into your deck.',
    },
  ];

  public set: string = 'SSH';

  public name: string = 'Lumineon V';

  public fullName: string = 'Lumineon V SSH';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const generator = useLuminousSign(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      player.active.moveTo(player.deck);
      player.active.clearEffects();

      return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
        player.deck.applyOrder(order);
      });
    }

    return state;
  }
}
