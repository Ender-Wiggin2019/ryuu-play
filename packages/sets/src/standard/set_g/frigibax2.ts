import {
  AttackEffect,
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class Frigibax2 extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 15263,
      name: '凉脊龙',
      yorenCode: 'P0996',
      cardType: '1',
      commodityCode: 'CSVH3pC',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '001/006',
        rarityLabel: '无标记',
        cardTypeLabel: '宝可梦',
        attributeLabel: '水',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 70,
        evolveText: '基础',
        weakness: '钢 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/294/0.png',
      ruleLines: [],
      attacks: [
        {
          id: 1412,
          name: '招来',
          text: '从自己牌库上方抽取1张卡牌。',
          cost: ['水'],
          damage: null,
        },
        {
          id: 1413,
          name: '敲打',
          text: '',
          cost: ['水', '无色'],
          damage: '20',
        },
      ],
      features: [],
    },
    collection: {
      id: 294,
      commodityCode: 'CSVH3pC',
      name: '嗨皮组合 七夕青鸟&拉帝欧斯&烈焰猴&一家鼠 奖赏包',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/294/0.png',
  };

  public stage = Stage.BASIC;

  public cardTypes = [CardType.WATER];

  public hp = 70;

  public weakness = [{ type: CardType.METAL }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '招来',
      cost: [CardType.WATER],
      damage: '',
      text: '从自己牌库上方抽取1张卡牌。',
    },
    {
      name: '敲打',
      cost: [CardType.WATER, CardType.COLORLESS],
      damage: '20',
      text: '',
    },
  ];

  public set = 'set_g';

  public name = '凉脊龙';

  public fullName = '凉脊龙 001/006#15263';

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.player.deck.moveTo(effect.player.hand, Math.min(1, effect.player.deck.cards.length));
      return state;
    }

    return state;
  }
}
