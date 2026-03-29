import {
  AttackEffect,
  CardTag,
  CardType,
  ChoosePokemonPrompt,
  Effect,
  GameMessage,
  PlayerType,
  PokemonCard,
  PutDamageEffect,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

function* useApexDragon(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  const cards = player.deck.cards.slice(0, 3);

  if (cards.length === 0) {
    return state;
  }

  player.deck.moveCardsTo(cards, player.discard);

  cards.forEach(card => {
    if (card.superType === SuperType.ENERGY) {
      player.discard.moveCardTo(card, player.active.energies);
    }
  });

  return state;
}

function* useDragonLaser(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const opponent = StateUtils.getOpponent(state, effect.player);
  const opponentPlayerType = state.players[0] === effect.player ? PlayerType.TOP_PLAYER : PlayerType.BOTTOM_PLAYER;
  const hasBenched = opponent.bench.some(slot => slot.getPokemonCard() !== undefined);

  if (!hasBenched) {
    return state;
  }

  let targets: any[] = [];
  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      effect.player.id,
      GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
      opponentPlayerType,
      [SlotType.BENCH],
      { allowCancel: false }
    ),
    result => {
      targets = result || [];
      next();
    }
  );

  if (targets.length === 0) {
    return state;
  }

  const damageEffect = new PutDamageEffect(effect, 30);
  damageEffect.target = targets[0];
  store.reduceEffect(state, damageEffect);

  return state;
}

export class RegidragoV extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10988,
      name: '雷吉铎拉戈V',
      yorenCode: 'Y1167',
      cardType: '1',
      commodityCode: 'CS6.5C',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '054/072',
        rarityLabel: 'RR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '龙',
        pokemonTypeLabel: '宝可梦V',
        specialCardLabel: null,
        hp: 220,
        evolveText: '基础',
        weakness: null,
        resistance: null,
        retreatCost: 3,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/222/93.png',
      ruleLines: ['当宝可梦V【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 2522,
          name: '天之呐喊',
          text: '将自己牌库上方3张卡牌放于弃牌区，将其中所有能量，附着于这只宝可梦身上。',
          cost: ['无色'],
          damage: '',
        },
        {
          id: 2523,
          name: '巨龙镭射',
          text: '给对手的1只备战宝可梦，也造成30点伤害。[备战宝可梦不计算弱点、抗性。]',
          cost: ['草', '草', '火'],
          damage: '130',
        },
      ],
      features: [],
      illustratorNames: ['N-DESIGN Inc.'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 222,
      commodityCode: 'CS6.5C',
      name: '强化包 胜象星引',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/222/93.png',
  };

  public tags = [CardTag.POKEMON_V];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.DRAGON];

  public hp = 220;

  public weakness = [];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '天之呐喊',
      cost: [CardType.COLORLESS],
      damage: '',
      text: '将自己牌库上方3张卡牌放于弃牌区，将其中所有能量，附着于这只宝可梦身上。',
    },
    {
      name: '巨龙镭射',
      cost: [CardType.GRASS, CardType.GRASS, CardType.FIRE],
      damage: '130',
      text: '给对手的1只备战宝可梦，也造成30点伤害。[备战宝可梦不计算弱点、抗性。]',
    },
  ];

  public set = 'set_f';

  public name = '雷吉铎拉戈V';

  public fullName = '雷吉铎拉戈V 054/072#10988';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useApexDragon(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = useDragonLaser(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
