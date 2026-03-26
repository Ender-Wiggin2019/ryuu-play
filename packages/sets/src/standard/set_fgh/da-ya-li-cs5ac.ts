import {
  AttackEffect,
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class DaYaLiCs5aC extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10039,
      name: '大牙狸',
      yorenCode: 'P399',
      cardType: '1',
      commodityCode: 'CS5aC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '104/127',
        rarityLabel: 'C☆★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 70,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: '/api/v1/cards/10039/image',
      ruleLines: [],
      attacks: [
        {
          id: 9649,
          name: '滚动',
          text: '',
          cost: ['COLORLESS', 'COLORLESS'],
          damage: '30',
        },
      ],
      features: [],
    },
    collection: {
      id: 183,
      commodityCode: 'CS5aC',
      name: '补充包 勇魅群星 魅',
    },
    image_url: 'http://localhost:3000/api/v1/cards/10039/image',
    logic_group_key: 'pokemon:P399:大牙狸:70:滚动',
    variant_group_key: 'pokemon:P399:大牙狸:70:滚动',
    variant_group_size: 2,
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 70;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '滚动',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '30',
      text: '',
    },
  ];

  public set: string = 'set_f';

  public name: string = '大牙狸';

  public fullName: string = '大牙狸 104/127#10039';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 30;
      return state;
    }

    return state;
  }
}
