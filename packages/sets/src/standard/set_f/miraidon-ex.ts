import {
  AttackEffect,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  PowerEffect,
  PowerType,
  ShuffleDeckPrompt,
  Stage,
  State,
  StoreLike,
  SuperType,
} from '@ptcg/common';

function* useTandemUnit(
  next: Function,
  store: StoreLike,
  state: State,
  effect: PowerEffect
): IterableIterator<State> {
  const player = effect.player;
  const openSlots = player.bench.filter(slot => slot.pokemons.cards.length === 0);
  const max = Math.min(2, openSlots.length);

  if (max === 0 || player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  const blocked: number[] = [];
  let available = 0;
  player.deck.cards.forEach((card, index) => {
    if (
      !(card instanceof PokemonCard)
      || card.stage !== Stage.BASIC
      || !card.cardTypes.includes(CardType.LIGHTNING)
    ) {
      blocked.push(index);
      return;
    }
    available += 1;
  });

  if (available === 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let selected = [] as PokemonCard[];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
      player.deck,
      { superType: SuperType.POKEMON, stage: Stage.BASIC },
      { min: 0, max, allowCancel: false, blocked }
    ),
    cards => {
      selected = (cards || []) as PokemonCard[];
      next();
    }
  );

  selected.slice(0, openSlots.length).forEach((card, index) => {
    player.deck.moveCardTo(card, openSlots[index].pokemons);
    openSlots[index].pokemonPlayedTurn = state.turn;
  });

  yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
    next();
  });

  return state;
}

export class MiraidonEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 11877,
      name: '密勒顿ex',
      yorenCode: 'Y1196',
      cardType: '1',
      commodityCode: 'CSV1C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '050/127',
        rarityLabel: 'RR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '雷',
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: null,
        hp: 220,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/244/139.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 445,
          name: '光子引爆',
          text: '在下一个自己的回合，这只宝可梦无法使用招式。',
          cost: ['雷', '雷', '无色'],
          damage: '220',
        },
      ],
      features: [
        {
          id: 76,
          name: '串联装置',
          text: '在自己的回合可以使用1次。选择自己牌库中最多2张【雷】属性的【基础】宝可梦，放于备战区。并重洗牌库。',
        },
      ],
      illustratorNames: ['5ban Graphics'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 244,
      commodityCode: 'CSV1C',
      name: '补充包 亘古开来',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/244/139.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp = 220;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '串联装置',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合可以使用1次。选择自己牌库中最多2张【雷】属性的【基础】宝可梦，放于备战区。并重洗牌库。',
    },
  ];

  public attacks = [
    {
      name: '光子引爆',
      cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.COLORLESS],
      damage: '220',
      text: '在下一个自己的回合，这只宝可梦无法使用招式。',
    },
  ];

  public set = 'set_g';

  public name = '密勒顿ex';

  public fullName = '密勒顿ex 050/127#11877';

  public lockedAttackTurn = -1;

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useTandemUnit(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      if (this.lockedAttackTurn === state.turn) {
        throw new Error('BLOCKED_BY_EFFECT');
      }

      this.lockedAttackTurn = state.turn + 1;
      return state;
    }

    return state;
  }
}
