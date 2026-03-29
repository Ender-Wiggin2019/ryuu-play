import {
  AttackEffect,
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class HuoKongLong extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 15981,
      name: '火恐龙',
      yorenCode: 'P005',
      cardType: '1',
      commodityCode: 'MISSION05',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '100/SV-P',
        rarityLabel: '无标记',
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 90,
        evolveText: '1阶进化',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/312/0.png',
      ruleLines: [],
      attacks: [
        {
          id: 2489,
          name: '高温冲撞',
          text: '给这只宝可梦也造成20伤害。',
          cost: ['火', '火'],
          damage: '70',
        },
      ],
      features: [],
      illustratorNames: ['Ryota Murayama'],
      pokemonCategory: '火焰宝可梦',
      pokedexCode: '0005',
      pokedexText: '如果它在战斗中亢奋起来，就会喷出灼热的火焰，把周围的东西烧得一干二净。',
      height: 1.1,
      weight: 19,
      deckRuleLimit: null,
    },
    collection: {
      id: 312,
      commodityCode: 'MISSION05',
      name: '任务奖赏包 第五弹',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/312/0.png',
    logic_group_key: 'pokemon:火恐龙:P005:G:hp90:高温冲撞70+self20',
    variant_group_key: 'pokemon:火恐龙:P005:G:hp90:高温冲撞70+self20',
    variant_group_size: 1,
  };

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '小火龙';

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 90;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '高温冲撞',
      cost: [CardType.FIRE, CardType.FIRE],
      damage: '70',
      text: '给这只宝可梦也造成20伤害。',
    },
  ];

  public set: string = 'set_g';

  public name: string = '火恐龙';

  public fullName: string = '火恐龙 100/SV-P#15981';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 70;
      effect.player.active.damage += 20;
    }

    return state;
  }
}
