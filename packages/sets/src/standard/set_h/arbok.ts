import {
  AddSpecialConditionsEffect,
  AttackEffect,
  CardType,
  Effect,
  PokemonCard,
  SpecialCondition,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class Arbok extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16374,
      name: '阿柏怪',
      yorenCode: 'P024',
      cardType: '1',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '208/204',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/553.png',
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/553.png',
  };

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '阿柏蛇';

  public cardTypes: CardType[] = [CardType.DARK];

  public hp: number = 130;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '恐慌毒液',
      cost: [CardType.DARK],
      damage: '',
      text: '令对手的战斗宝可梦陷入【中毒】和【灼伤】和【混乱】状态。',
    },
    {
      name: '暗之牙',
      cost: [CardType.DARK, CardType.DARK],
      damage: '70',
      text: '',
    },
  ];

  public set: string = 'set_h';

  public name: string = '阿柏怪';

  public fullName: string = '阿柏怪 CSV7C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialCondition = new AddSpecialConditionsEffect(effect, [
        SpecialCondition.POISONED,
        SpecialCondition.BURNED,
        SpecialCondition.CONFUSED,
      ]);
      store.reduceEffect(state, specialCondition);
      return state;
    }

    return state;
  }
}
