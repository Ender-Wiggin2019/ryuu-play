import {
  AttackEffect,
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class Drifloon extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 12718,
      yorenCode: 'P425',
      cardType: '1',
      nameSamePokemonId: 528,
      details: {
        id: 12718,
        evolveText: '基础',
        cardName: '飘飘球',
        regulationMarkText: 'G',
        collectionNumber: '060/128',
        rarity: '1',
        rarityText: 'C',
        hp: 70,
        attribute: '5',
        yorenCode: 'P425',
        cardType: '1',
        cardTypeText: '宝可梦',
        featureFlag: '2',
        abilityItemList: [
          {
            abilityName: '起风',
            abilityText: 'none',
            abilityCost: '11,11',
            abilityDamage: '10',
          },
          {
            abilityName: '气球炸弹',
            abilityText: '造成这只宝可梦身上放置的伤害指示物数量×30伤害。',
            abilityCost: '5,5',
            abilityDamage: '30×',
          },
        ],
        pokemonCategory: '气球宝可梦',
        weaknessType: '7',
        weaknessFormula: '×2',
        resistanceType: '6',
        resistanceFormula: '-30',
        retreatCost: 1,
        pokedexCode: '0425',
        pokedexText: '据说把它误认成气球而拿在手上的小孩，有的会就此消失无踪。',
        height: 0.4,
        weight: 1.2,
        illustratorName: ['Taira Akitsu'],
        commodityList: [
          {
            commodityName: '补充包 奇迹启程',
            commodityCode: 'CSV2C',
          },
        ],
        collectionFlag: 0,
        special_shiny_type: 0,
      },
      name: '飘飘球',
      image: 'img\\253\\165.png',
      hash: 'cbc13b6c833e243d987f84a5fda1449b',
    },
    collection: {
      id: 253,
      name: '补充包 奇迹启程',
      commodityCode: 'CSV2C',
      salesDate: '2025-03-21',
      series: '3',
      seriesText: '朱&紫',
      goodsType: '1',
      linkType: 0,
      image: 'img/253/cover.png',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/253/165.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 70;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Gust',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '10',
      text: '',
    },
    {
      name: 'Balloon Blast',
      cost: [CardType.PSYCHIC, CardType.PSYCHIC],
      damage: '30x',
      text: 'This attack does 30 damage for each damage counter on this Pokemon.',
    },
  ];

  public set: string = 'set_g';

  public name: string = 'Drifloon';

  public fullName: string = 'Drifloon CSV2C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);
      if (!pokemonSlot) {
        return state;
      }

      effect.damage = Math.floor(pokemonSlot.damage / 10) * 30;
      return state;
    }

    return state;
  }
}
