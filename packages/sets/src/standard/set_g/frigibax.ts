import {
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class Frigibax extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 13294,
      name: '凉脊龙',
      yorenCode: 'P0996',
      cardType: '1',
      commodityCode: 'CSV3C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '131/130',
        rarityLabel: 'AR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '水',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 60,
        evolveText: '基础',
        weakness: '钢 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/362.png',
      ruleLines: [],
      attacks: [
        {
          id: 1040,
          name: '撞击',
          text: '',
          cost: ['水', '无色'],
          damage: '30',
        },
      ],
      features: [],
    },
    collection: {
      id: 270,
      commodityCode: 'CSV3C',
      name: '补充包 无畏太晶',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/362.png',
  };

  public stage = Stage.BASIC;

  public cardTypes = [CardType.WATER];

  public hp = 60;

  public weakness = [{ type: CardType.METAL }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '撞击',
      cost: [CardType.WATER, CardType.COLORLESS],
      damage: '30',
      text: '',
    },
  ];

  public set = 'set_g';

  public name = '凉脊龙';

  public fullName = '凉脊龙 131/130#13294';

  public reduceEffect(_store: StoreLike, state: State, _effect: Effect): State {
    return state;
  }
}
