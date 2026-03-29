import {
  AttackEffect,
  CardTag,
  CardType,
  Effect,
  GameError,
  GameMessage,
  HealEffect,
  PokemonCard,
  PowerEffect,
  PowerType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  DealDamageEffect,
} from '@ptcg/common';

export class XiCuiNianMeiLongVSTAR extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 2185,
      name: '洗翠 黏美龙VSTAR',
      yorenCode: 'Y1073',
      cardType: '1',
      commodityCode: 'CS5.5C',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '053/066',
        rarityLabel: 'RRR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '龙',
        pokemonTypeLabel: '宝可梦VSTAR',
        specialCardLabel: null,
        hp: 270,
        evolveText: 'V进化',
        weakness: null,
        resistance: null,
        retreatCost: 3,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/202/95.png',
      ruleLines: ['当宝可梦VSTAR【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 2905,
          name: '钢铁滚动',
          text: '在下一个对手的回合，这只宝可梦所受到的招式的伤害「-80」。',
          cost: ['WATER', 'METAL', 'COLORLESS'],
          damage: '200',
        },
      ],
      features: [
        {
          id: 1,
          name: '润泽星耀',
          text: '在自己的回合可以使用1次。将这只宝可梦的全部伤害治愈。',
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
      id: 202,
      commodityCode: 'CS5.5C',
      name: '强化包 暗影夺辉',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/202/95.png',
  };

  public tags = [CardTag.POKEMON_VSTAR];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '洗翠 黏美龙V';

  public cardTypes: CardType[] = [CardType.DRAGON];

  public hp: number = 270;

  public weakness = [];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '钢铁滚动',
      cost: [CardType.WATER, CardType.METAL, CardType.COLORLESS],
      damage: '200',
      text: '在下一个对手的回合，这只宝可梦所受到的招式的伤害「-80」。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '洗翠 黏美龙VSTAR';

  public fullName: string = '洗翠 黏美龙VSTAR CS5.5C';

  public steelRollingTurn = -1;

  public powers = [
    {
      name: '润泽星耀',
      useWhenInPlay: true,
      useVSTARPower: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合可以使用1次。将这只宝可梦的全部伤害治愈。',
    },
  ];

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);

      if (pokemonSlot === undefined) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const healEffect = new HealEffect(effect.player, pokemonSlot, pokemonSlot.damage);
      return store.reduceEffect(state, healEffect);
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      this.steelRollingTurn = state.turn + 1;
      return state;
    }

    if (effect instanceof DealDamageEffect) {
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);
      if (pokemonSlot === undefined) {
        return state;
      }

      const owner = StateUtils.findOwner(state, pokemonSlot);
      if (effect.player === owner) {
        return state;
      }

      if (state.turn !== this.steelRollingTurn || effect.target !== pokemonSlot) {
        return state;
      }

      effect.damage = Math.max(0, effect.damage - 80);
      return state;
    }

    return state;
  }
}
