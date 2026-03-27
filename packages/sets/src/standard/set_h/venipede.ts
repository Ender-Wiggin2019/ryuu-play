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

export class Venipede extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17932,
      name: '百足蜈蚣',
      yorenCode: 'P543',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '128/207',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/357.png',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/357.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.DARK];

  public hp: number = 80;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '毒液',
      cost: [CardType.DARK],
      damage: '',
      text: '令对手的战斗宝可梦陷入【中毒】状态。',
    },
    {
      name: '回转攻击',
      cost: [CardType.DARK, CardType.COLORLESS, CardType.COLORLESS],
      damage: '40',
      text: '',
    },
  ];

  public set: string = 'set_h';

  public name: string = '百足蜈蚣';

  public fullName: string = '百足蜈蚣 CSV8C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialCondition = new AddSpecialConditionsEffect(effect, [SpecialCondition.POISONED]);
      store.reduceEffect(state, specialCondition);
      return state;
    }

    return state;
  }
}
