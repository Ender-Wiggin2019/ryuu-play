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
        collectionNumber: '049/128',
        rarityLabel: 'RR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '水',
        pokemonTypeLabel: '宝可梦V',
        hp: 170,
        evolveText: '基础',
        weakness: '雷 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/182/89.png',
      ruleLines: ['当宝可梦V【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 9734,
          name: '水流回转',
          text: '将这只宝可梦，以及放于其身上的所有卡牌，放回自己的牌库并重洗牌库。',
          cost: ['WATER', 'COLORLESS', 'COLORLESS'],
          damage: '120',
        },
      ],
      features: [
        {
          id: 1306,
          name: '夜光信号',
          text: '在自己的回合，当将这张卡牌从手牌使出放于备战区时，可使用1次。选择自己牌库中的1张支援者，在给对手看过之后，加入手牌。并重洗牌库。',
        },
      ],
    },
    collection: {
      id: 182,
      commodityCode: 'CS5bC',
      name: '补充包 勇魅群星 勇',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/182/89.png',
  };

  public tags = [CardTag.POKEMON_V];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 170;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '夜光信号',
      powerType: PowerType.ABILITY,
      text: '在自己的回合，当将这张卡牌从手牌使出放于备战区时，可使用1次。选择自己牌库中的1张支援者，在给对手看过之后，加入手牌。并重洗牌库。',
    },
  ];

  public attacks = [
    {
      name: '水流回转',
      cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
      damage: '120',
      text: '将这只宝可梦，以及放于其身上的所有卡牌，放回自己的牌库并重洗牌库。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '霓虹鱼V';

  public fullName: string = '霓虹鱼V CS5bC';

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
