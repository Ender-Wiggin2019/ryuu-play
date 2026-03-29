import {
  AfterDamageEffect,
  ApplyWeaknessEffect,
  AttackEffect,
  Card,
  CardList,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

function* useShenYuanTanQiu(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  const topCards = new CardList();
  topCards.cards = player.deck.cards.splice(0, Math.min(4, player.deck.cards.length));
  const chooseCount = Math.min(2, topCards.cards.length);

  if (chooseCount === 0) {
    return state;
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_HAND,
      topCards,
      {},
      { min: chooseCount, max: chooseCount, allowCancel: false }
    ),
    cards => {
      selected = (cards || []) as Card[];
      next();
    }
  );

  if (selected.length !== chooseCount) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const chosenSet = new Set(selected);
  const toHand = topCards.cards.filter(card => chosenSet.has(card));
  const toLostZone = topCards.cards.filter(card => !chosenSet.has(card));

  topCards.moveCardsTo(toHand, player.hand);
  topCards.moveCardsTo(toLostZone, player.lostzone);

  return state;
}

export class GiratinaV extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10410,
      name: '骑拉帝纳V',
      yorenCode: 'Y1098',
      cardType: '1',
      commodityCode: 'CS6bC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '107/131',
        rarityLabel: 'RR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '龙',
        pokemonTypeLabel: '宝可梦V',
        specialCardLabel: null,
        hp: 220,
        evolveText: '基础',
        weakness: null,
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/197.png',
      ruleLines: ['当宝可梦V【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 2437,
          name: '深渊探求',
          text: '查看自己牌库上方4张卡牌，选择其中2张卡牌，加入手牌。将剩余的卡牌放于放逐区。',
          cost: ['无色'],
          damage: null,
        },
        {
          id: 2438,
          name: '撕裂',
          text: '这个招式的伤害，不计算对手的战斗宝可梦身上所附加的效果。',
          cost: ['草', '超', '无色'],
          damage: '160',
        },
      ],
      features: [],
      illustratorNames: ['PLANETA Mochizuki'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 206,
      commodityCode: 'CS6bC',
      name: '补充包 碧海暗影 逐',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/197.png',
  };

  public tags = [CardTag.POKEMON_V];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.DRAGON];

  public hp: number = 220;

  public weakness = [];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '深渊探求',
      cost: [CardType.COLORLESS],
      damage: '',
      text: '查看自己牌库上方4张卡牌，选择其中2张卡牌，加入手牌。将剩余的卡牌放于放逐区。',
    },
    {
      name: '撕裂',
      cost: [CardType.GRASS, CardType.PSYCHIC, CardType.COLORLESS],
      damage: '160',
      text: '这个招式的伤害，不计算对手的战斗宝可梦身上所附加的效果。',
    },
  ];

  public set: string = 'set_f';
  public name: string = '骑拉帝纳V';
  public fullName: string = '骑拉帝纳V CS6bC';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useShenYuanTanQiu(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const opponent = StateUtils.getOpponent(state, effect.player);
      const applyWeakness = new ApplyWeaknessEffect(effect, 160);
      store.reduceEffect(state, applyWeakness);

      effect.damage = 0;
      if (applyWeakness.damage > 0) {
        opponent.active.damage += applyWeakness.damage;
        const afterDamage = new AfterDamageEffect(effect, applyWeakness.damage);
        state = store.reduceEffect(state, afterDamage);
      }
      return state;
    }

    return state;
  }
}
