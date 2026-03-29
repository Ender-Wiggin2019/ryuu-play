import {
  AttackEffect,
  CardTag,
  CardType,
  CheckAttackCostEffect,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
  UseAttackEffect,
} from '@ptcg/common';

const BLOOD_MOON_USED_MARKER = 'BLOOD_MOON_USED_MARKER';
const BLOOD_MOON_BLOCK_MARKER = 'BLOOD_MOON_BLOCK_MARKER';

export class YueYueXiongHeYueEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17635,
      name: '月月熊 赫月ex',
      yorenCode: 'Y1461',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '258/207',
        rarityLabel: 'UR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: null,
        hp: 260,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 3,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/609.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 316,
          name: '血月',
          text: '在下一个自己的回合，这只宝可梦无法使用招式。',
          cost: ['COLORLESS', 'COLORLESS', 'COLORLESS', 'COLORLESS', 'COLORLESS'],
          damage: '240',
        },
      ],
      features: [
        {
          id: 61,
          name: '老练招式',
          text: '这只宝可梦使用「血月」所需能量会减少与对手已经获得的奖赏卡张数相同数量的【无】能量。',
        },
      ],
      illustratorNames: ['aky CG Works'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/609.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 260;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '血月',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '240',
      text: '在下一个自己的回合，这只宝可梦无法使用招式。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '月月熊 赫月ex';

  public fullName: string = '月月熊 赫月ex 258/207#17635';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckAttackCostEffect && effect.player.active.getPokemonCard() === this) {
      const opponent = StateUtils.getOpponent(state, effect.player);
      const taken = 6 - opponent.getPrizeLeft();
      if (taken > 0 && effect.cost.length > 0) {
        effect.cost.splice(0, Math.min(taken, effect.cost.length));
      }
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.player.marker.addMarker(BLOOD_MOON_USED_MARKER, this);
      return state;
    }

    if (effect instanceof UseAttackEffect && effect.player.active.getPokemonCard() === this) {
      if (effect.attack === this.attacks[0] && effect.player.marker.hasMarker(BLOOD_MOON_BLOCK_MARKER, this)) {
        throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
      }
      return state;
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(BLOOD_MOON_USED_MARKER, this)) {
      effect.player.marker.removeMarker(BLOOD_MOON_USED_MARKER, this);
      effect.player.marker.addMarker(BLOOD_MOON_BLOCK_MARKER, this);
      return state;
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(BLOOD_MOON_BLOCK_MARKER, this)) {
      effect.player.marker.removeMarker(BLOOD_MOON_BLOCK_MARKER, this);
      return state;
    }

    return state;
  }
}
