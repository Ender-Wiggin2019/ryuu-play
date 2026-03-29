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

export class JuQianTangLang extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 14320,
      name: '巨钳螳螂',
      yorenCode: 'P134',
      cardType: '1',
      commodityCode: 'CSV4C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '081/129',
        rarityLabel: 'R',
        cardTypeLabel: '宝可梦',
        attributeLabel: '钢',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 140,
        evolveText: '1阶进化',
        weakness: '火 ×2',
        resistance: '草 -30',
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/224.png',
      ruleLines: [],
      attacks: [
        {
          id: 806,
          name: '惩罚巨钳',
          text: '追加造成对手场上拥有特性的宝可梦数量×50伤害。',
          cost: ['钢'],
          damage: '10+',
        },
        {
          id: 807,
          name: '居合劈',
          text: '',
          cost: ['钢', '钢'],
          damage: '70',
        },
      ],
      features: [],
      illustratorNames: ['Mitsuhiro Arita'],
      pokemonCategory: '钳子宝可梦',
      pokedexCode: '0212',
      pokedexText: '会用双钳精确地夹住猎物。只要一夹住就不会松开。',
      height: 1.8,
      weight: 118,
      deckRuleLimit: null,
    },
    collection: {
      id: 285,
      commodityCode: 'CSV4C',
      name: '补充包 嘉奖回合',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/224.png',
  };

  public tags = [];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '飞天螳螂';

  public cardTypes: CardType[] = [CardType.METAL];

  public hp: number = 140;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '惩罚巨钳',
      cost: [CardType.METAL],
      damage: '10+',
      text: '追加造成对手场上拥有特性的宝可梦数量×50伤害。',
    },
    {
      name: '居合劈',
      cost: [CardType.METAL, CardType.METAL],
      damage: '70',
      text: '',
    },
  ];

  public set: string = 'set_g';

  public name: string = '巨钳螳螂';

  public fullName: string = '巨钳螳螂 081/129#14320';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = StateUtils.getOpponent(state, effect.player);
      const abilityCount = [opponent.active, ...opponent.bench].filter(slot => {
        const card = slot.getPokemonCard();
        return card !== undefined && (card.powers?.length || 0) > 0;
      }).length;

      effect.damage = 10 + (abilityCount * 50);
    }

    return state;
  }
}
