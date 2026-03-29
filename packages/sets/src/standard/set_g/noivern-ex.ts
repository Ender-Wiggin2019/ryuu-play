import {
  AttackEffect,
  AttachEnergyEffect,
  CardTag,
  CardType,
  Effect,
  EndTurnEffect,
  EnergyType,
  GameError,
  GameMessage,
  PlayStadiumEffect,
  PokemonCard,
  PutDamageEffect,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

const COVERT_FLIGHT_MARKER = 'COVERT_FLIGHT_MARKER';
const DOMINATING_ECHO_MARKER = 'DOMINATING_ECHO_MARKER';

export class NoivernEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 14384,
      name: '音波龙ex',
      yorenCode: 'P0715',
      cardType: '1',
      commodityCode: 'CSV4C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '145/129',
        rarityLabel: 'SR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '龙',
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: null,
        hp: 260,
        evolveText: '1阶进化',
        weakness: null,
        resistance: null,
        retreatCost: 0,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/374.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 1538,
          name: '隐秘飞行',
          text: '在下一个对手的回合，这只宝可梦不会受到【基础】宝可梦的招式的伤害。',
          cost: ['无色', '无色'],
          damage: '70',
        },
        {
          id: 1539,
          name: '支配回响',
          text: '在下一个对手的回合，对手无法从手牌使出并附着特殊能量，也无法放置竞技场。',
          cost: ['超', '恶'],
          damage: '140',
        },
      ],
      features: [],
    },
    collection: {
      id: 285,
      commodityCode: 'CSV4C',
      name: '补充包 嘉奖回合',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/374.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage = Stage.STAGE_1;

  public evolvesFrom = '嗡蝠';

  public cardTypes = [CardType.DRAGON];

  public hp = 260;

  public weakness: { type: CardType }[] = [];

  public resistance: { type: CardType; value: number }[] = [];

  public retreat: CardType[] = [];

  public attacks = [
    {
      name: '隐秘飞行',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '70',
      text: '在下一个对手的回合，这只宝可梦不会受到【基础】宝可梦的招式的伤害。',
    },
    {
      name: '支配回响',
      cost: [CardType.PSYCHIC, CardType.DARK],
      damage: '140',
      text: '在下一个对手的回合，对手无法从手牌使出并附着特殊能量，也无法放置竞技场。',
    },
  ];

  public set = 'set_g';

  public name = '音波龙ex';

  public fullName = '音波龙ex 145/129#14384';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.opponent.marker.addMarker(COVERT_FLIGHT_MARKER, this);
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.opponent.marker.addMarker(DOMINATING_ECHO_MARKER, this);
      return state;
    }

    if (effect instanceof PutDamageEffect && effect.target.getPokemonCard() === this) {
      if (!effect.player.marker.hasMarker(COVERT_FLIGHT_MARKER, this)) {
        return state;
      }
      if (!effect.source.isBasic()) {
        return state;
      }
      effect.preventDefault = true;
      return state;
    }

    if (effect instanceof AttachEnergyEffect && effect.player.marker.hasMarker(DOMINATING_ECHO_MARKER, this)) {
      if (effect.energyCard.energyType === EnergyType.SPECIAL) {
        throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
      }
    }

    if (effect instanceof PlayStadiumEffect && effect.player.marker.hasMarker(DOMINATING_ECHO_MARKER, this)) {
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(DOMINATING_ECHO_MARKER, this);
      effect.player.marker.removeMarker(COVERT_FLIGHT_MARKER, this);
      return state;
    }

    return state;
  }
}
