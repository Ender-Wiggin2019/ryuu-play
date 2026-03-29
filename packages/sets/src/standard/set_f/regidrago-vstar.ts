import {
  Attack,
  AttackEffect,
  Card,
  CardTag,
  CardType,
  ChooseAttackPrompt,
  ChooseCardsPrompt,
  DealDamageEffect,
  Effect,
  GameError,
  GameLog,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StoreLike,
  SuperType,
} from '@ptcg/common';

function* useDragonApex(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  const discardPokemon = player.discard.cards.filter((card): card is PokemonCard => {
    return card instanceof PokemonCard
      && card.cardTypes.includes(CardType.DRAGON)
      && card.attacks.length > 0;
  });

  if (discardPokemon.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  const blocked: number[] = [];
  discardPokemon.forEach((card, index) => {
    if (card.attacks.length === 0) {
      blocked.push(index);
    }
  });

  let selectedCards: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_COPY_EFFECT,
      player.discard,
      { superType: SuperType.POKEMON },
      { min: 1, max: 1, allowCancel: false, blocked }
    ),
    cards => {
      selectedCards = cards || [];
      next();
    }
  );

  const sourceCard = selectedCards[0];
  if (!(sourceCard instanceof PokemonCard) || !sourceCard.cardTypes.includes(CardType.DRAGON)) {
    throw new GameError(GameMessage.INVALID_PROMPT_RESULT);
  }

  let copiedAttack: Attack | null = null;
  if (sourceCard.attacks.length === 1) {
    copiedAttack = sourceCard.attacks[0];
  } else {
    yield store.prompt(
      state,
      new ChooseAttackPrompt(player.id, GameMessage.CHOOSE_ATTACK_TO_COPY, [sourceCard], {
        allowCancel: false,
      }),
      result => {
        copiedAttack = result as Attack;
        next();
      }
    );
  }

  if (copiedAttack === null) {
    throw new GameError(GameMessage.INVALID_PROMPT_RESULT);
  }

  store.log(state, GameLog.LOG_PLAYER_COPIES_ATTACK, {
    name: player.name,
    attack: copiedAttack.name,
  });

  const copiedAttackEffect = new AttackEffect(player, effect.opponent, copiedAttack);
  state = store.reduceEffect(state, copiedAttackEffect);

  if (store.hasPrompts()) {
    yield store.waitPrompt(state, () => next());
  }

  if (copiedAttackEffect.damage > 0) {
    const dealDamage = new DealDamageEffect(copiedAttackEffect, copiedAttackEffect.damage);
    state = store.reduceEffect(state, dealDamage);
  }

  if (store.hasPrompts()) {
    yield store.waitPrompt(state, () => next());
  }

  return state;
}

export class RegidragoVSTAR extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10989,
      name: '雷吉铎拉戈VSTAR',
      yorenCode: 'Y1168',
      cardType: '1',
      commodityCode: 'CS6.5C',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '055/072',
        rarityLabel: 'RRR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '龙',
        pokemonTypeLabel: '1|3',
        specialCardLabel: null,
        hp: 280,
        evolveText: 'V进化',
        weakness: null,
        resistance: null,
        retreatCost: 3,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/222/94.png',
      ruleLines: ['当宝可梦VSTAR【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 2524,
          name: '巨龙无双',
          text: '选择自己弃牌区中的【龙】宝可梦所拥有的1个招式，作为这个招式使用。',
          cost: ['草', '草', '火'],
          damage: '',
        },
      ],
      features: [],
      illustratorNames: ['PLANETA Yamashita'],
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
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/222/94.png',
  };

  public tags = [CardTag.POKEMON_VSTAR];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '雷吉铎拉戈V';

  public cardTypes: CardType[] = [CardType.DRAGON];

  public hp = 280;

  public weakness = [];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '巨龙无双',
      cost: [CardType.GRASS, CardType.GRASS, CardType.FIRE],
      damage: '',
      text: '选择自己弃牌区中的【龙】宝可梦所拥有的1个招式，作为这个招式使用。',
    },
  ];

  public set = 'set_f';

  public name = '雷吉铎拉戈VSTAR';

  public fullName = '雷吉铎拉戈VSTAR 055/072#10989';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useDragonApex(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
