import {
  AttackEffect,
  CardTag,
  CardType,
  CheckAttackCostEffect,
  Effect,
  PokemonCard,
  PowerType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export const GUANG_HUI_PEN_HUO_LONG_LOGIC_GROUP_KEY = 'pokemon:光辉喷火龙:Y1064:F:hp160:振奋之心:炎爆250';
export const GUANG_HUI_PEN_HUO_LONG_VARIANT_GROUP_KEY = 'pokemon:光辉喷火龙:Y1064:F:hp160:振奋之心:炎爆250';

export class GuangHuiPenHuoLong extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 13130,
      yorenCode: 'Y1064',
      cardType: '1',
      commodityCode: 'CSVE1pC2',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '013/024',
        rarityLabel: '无标记',
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        pokemonTypeLabel: '光辉宝可梦',
        hp: 160,
        evolveText: '基础',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 3,
      },
      image: '/api/v1/cards/13130/image',
      ruleLines: ['1副卡组中只能放入1张光辉宝可梦卡。'],
      attacks: [
        {
          id: 6681,
          name: '炎爆',
          text: '在下一个自己的回合，这只宝可梦无法使用「炎爆」。',
          cost: ['火', '无色', '无色', '无色', '无色'],
          damage: '250',
        },
      ],
      features: [
        {
          id: 891,
          name: '振奋之心',
          text: '这只宝可梦使用招式所需能量会减少与对手已经获得的奖赏卡张数相同数量的【无】能量。',
        },
      ],
      illustratorNames: ['Kouki Saitou'],
      pokemonCategory: '火焰宝可梦',
      pokedexCode: '006',
      pokedexText: '能够喷出猛烈的火焰，仿佛连岩石都能烤焦。有时会引发森林火灾。',
      height: 1.7,
      weight: 90.5,
      deckRuleLimit: 1,
    },
    collection: {
      id: 257,
      commodityCode: 'CSVE1pC2',
      name: '对战派对 共梦 下 奖赏包',
    },
    image_url: 'http://localhost:3000/api/v1/cards/13130/image',
    logic_group_key: GUANG_HUI_PEN_HUO_LONG_LOGIC_GROUP_KEY,
    variant_group_key: GUANG_HUI_PEN_HUO_LONG_VARIANT_GROUP_KEY,
    variant_group_size: 1,
  };

  public tags = [CardTag.RADIANT];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 160;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '炎爆',
      cost: [CardType.FIRE, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '250',
      text: '在下一个自己的回合，这只宝可梦无法使用「炎爆」。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '光辉喷火龙';

  public fullName: string = '光辉喷火龙 013/024#13130';

  public readonly INFERNO_MARKER = 'INFERNO_MARKER';
  public lockedAttackTurn = -1;

  public powers = [
    {
      name: '振奋之心',
      powerType: PowerType.ABILITY,
      text: '这只宝可梦使用招式所需能量会减少与对手已经获得的奖赏卡张数相同数量的【无】能量。',
    },
  ];

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckAttackCostEffect && effect.player.active.getPokemonCard() === this) {
      const opponent = StateUtils.getOpponent(state, effect.player);
      const reduction = Math.max(0, 6 - opponent.getPrizeLeft());
      if (reduction <= 0) {
        return state;
      }

      for (let i = 0; i < reduction; i++) {
        const colorlessIndex = effect.cost.findIndex(cardType => cardType === CardType.COLORLESS);
        if (colorlessIndex === -1) {
          break;
        }
        effect.cost.splice(colorlessIndex, 1);
      }
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
