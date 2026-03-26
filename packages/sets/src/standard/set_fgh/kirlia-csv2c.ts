import {
  AttackEffect,
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class KirliaCsv2C extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 12791,
      name: '奇鲁莉安',
      yorenCode: 'P281',
      cardType: '1',
      commodityCode: 'CSV2C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '133/128',
        rarityLabel: 'AR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 90,
        evolveText: '1阶进化',
        weakness: '恶 ×2',
        resistance: '斗 -30',
        retreatCost: 1,
      },
      image: '/api/v1/cards/12791/image',
      ruleLines: [],
      attacks: [
        {
          id: 6885,
          name: '魔法射击',
          text: '',
          cost: ['超', '无色'],
          damage: '30',
        },
        {
          id: 6886,
          name: '精神强念',
          text: '追加造成对手战斗宝可梦身上附着的能量数量×20伤害。',
          cost: ['超', '超', '无色'],
          damage: '60+',
        },
      ],
      features: [],
      illustratorNames: ['Jiro Sasumo'],
      pokemonCategory: '感情宝可梦',
      pokedexCode: '0281',
      pokedexText: '可以通过操纵精神力量扭曲周围的空间来看清未来。',
      height: 0.8,
      weight: 20.2,
      deckRuleLimit: null,
    },
    collection: {
      id: 253,
      commodityCode: 'CSV2C',
      name: '补充包 奇迹启程',
    },
    image_url: 'http://localhost:3000/api/v1/cards/12791/image',
  };

  public stage: Stage = Stage.STAGE_1;
  public evolvesFrom = '拉鲁拉丝';
  public cardTypes: CardType[] = [CardType.PSYCHIC];
  public hp: number = 90;
  public weakness = [{ type: CardType.DARK }];
  public resistance = [{ type: CardType.FIGHTING, value: -30 }];
  public retreat = [CardType.COLORLESS];
  public attacks = [
    {
      name: '魔法射击',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: '30',
      text: '',
    },
    {
      name: '精神强念',
      cost: [CardType.PSYCHIC, CardType.PSYCHIC, CardType.COLORLESS],
      damage: '60+',
      text: '追加造成对手战斗宝可梦身上附着的能量数量×20伤害。',
    },
  ];
  public set: string = 'set_g';
  public name: string = '奇鲁莉安';
  public fullName: string = '奇鲁莉安 CSV2C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.damage = 60 + effect.opponent.active.energies.cards.length * 20;
    }

    return state;
  }
}
