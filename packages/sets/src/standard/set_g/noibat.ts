import { CardType, PokemonCard, Stage } from '@ptcg/common';

export class Noibat extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 14602,
      name: '嗡蝠',
      yorenCode: 'P0714',
      cardType: '1',
      commodityCode: 'CSV4C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '094/129',
        rarityLabel: 'C★★★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '龙',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 70,
        evolveText: '基础',
        weakness: null,
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/259.png',
      ruleLines: [],
      attacks: [
        {
          id: 1537,
          name: '起风',
          text: '',
          cost: ['超', '恶'],
          damage: '40',
        },
      ],
      features: [],
    },
    collection: {
      id: 285,
      commodityCode: 'CSV4C',
      name: '补充包 嘉奖回合',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/259.png',
  };

  public stage = Stage.BASIC;

  public cardTypes = [CardType.DRAGON];

  public hp = 70;

  public weakness: { type: CardType }[] = [];

  public resistance: { type: CardType; value: number }[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '起风',
      cost: [CardType.PSYCHIC, CardType.DARK],
      damage: '40',
      text: '',
    },
  ];

  public set = 'set_g';

  public name = '嗡蝠';

  public fullName = '嗡蝠 094/129#14602';
}
