import {
  AttackEffect,
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class Drifloon extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16067,
      name: '飘飘球',
      yorenCode: 'P425',
      cardType: '1',
      commodityCode: 'CSVL2C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '074/052',
        rarityLabel: '无标记',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 70,
        evolveText: '基础',
        weakness: '恶 ×2',
        resistance: '斗 -30',
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/314/73.png',
      ruleLines: [],
      attacks: [
        {
          id: 2404,
          name: '起风',
          text: '',
          cost: ['无色', '无色'],
          damage: '10',
        },
        {
          id: 2405,
          name: '气球炸弹',
          text: '造成这只宝可梦身上放置的伤害指示物数量×30伤害。',
          cost: ['超', '超'],
          damage: '30×',
        },
      ],
      features: [],
      illustratorNames: ['Kyoko Umemoto'],
      pokemonCategory: '气球宝可梦',
      pokedexCode: '0425',
      pokedexText: '据说把它误认成气球而拿在手上的小孩，有的会就此消失无踪。',
      height: 0.4,
      weight: 1.2,
      deckRuleLimit: null,
    },
    collection: {
      id: 314,
      commodityCode: 'CSVL2C',
      name: '游历专题包',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/314/73.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 70;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '起风',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '10',
      text: '',
    },
    {
      name: '气球炸弹',
      cost: [CardType.PSYCHIC, CardType.PSYCHIC],
      damage: '30×',
      text: '造成这只宝可梦身上放置的伤害指示物数量×30伤害。',
    },
  ];

  public set: string = 'set_g';

  public name: string = '飘飘球';

  public fullName: string = '飘飘球 CSVL2C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.damage = Math.floor(effect.player.active.damage / 10) * 30;
      return state;
    }

    return state;
  }
}
