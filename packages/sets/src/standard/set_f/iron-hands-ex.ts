import {
  AttackEffect,
  BetweenTurnsEffect,
  CardTag,
  CardType,
  Effect,
  KnockOutEffect,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class IronHandsEx extends PokemonCard {
  public readonly BONUS_PRIZE_MARKER = 'BONUS_PRIZE_MARKER';

  public rawData = {
    raw_card: {
      id: 15739,
      name: '铁臂膀ex',
      yorenCode: 'Y1366',
      cardType: '1',
      commodityCode: 'CSV6C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '152/128',
        rarityLabel: 'SAR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '雷',
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: '未来',
        hp: 230,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 4,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/381.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 2708,
          name: '臂膀压制',
          text: '',
          cost: ['LIGHTNING', 'LIGHTNING', 'COLORLESS'],
          damage: '160',
        },
        {
          id: 2709,
          name: '多谢款待',
          text: '如果因为这个招式的伤害，对手的宝可梦【昏厥】的话，则多拿取1张奖赏卡。',
          cost: ['LIGHTNING', 'COLORLESS', 'COLORLESS', 'COLORLESS'],
          damage: '120',
        },
      ],
      features: [],
      illustratorNames: ['Tonji Matsuno'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 311,
      commodityCode: 'CSV6C',
      name: '补充包 真实玄虚',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/381.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp: number = 230;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [
    CardType.COLORLESS,
    CardType.COLORLESS,
    CardType.COLORLESS,
    CardType.COLORLESS,
  ];

  public attacks = [
    {
      name: '臂膀压制',
      cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.COLORLESS],
      damage: '160',
      text: '',
    },
    {
      name: '多谢款待',
      cost: [CardType.LIGHTNING, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '120',
      text: '如果因为这个招式的伤害，对手的宝可梦【昏厥】的话，则多拿取1张奖赏卡。',
    },
  ];

  public set: string = 'set_g';

  public name: string = '铁臂膀ex';

  public fullName: string = '铁臂膀ex CSV6C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack.name === this.attacks[1].name) {
      effect.player.marker.addMarker(this.BONUS_PRIZE_MARKER, this);
      return state;
    }

    if (effect instanceof KnockOutEffect) {
      const attacker = StateUtils.getOpponent(state, effect.player);
      if (!attacker.marker.hasMarker(this.BONUS_PRIZE_MARKER)) {
        return state;
      }
      if (attacker.active.getPokemonCard() !== this || effect.target !== effect.player.active) {
        return state;
      }

      effect.prizeCount += 1;
      return state;
    }

    if (effect instanceof BetweenTurnsEffect && effect.player.marker.hasMarker(this.BONUS_PRIZE_MARKER)) {
      effect.player.marker.removeMarker(this.BONUS_PRIZE_MARKER);
      return state;
    }

    return state;
  }
}
