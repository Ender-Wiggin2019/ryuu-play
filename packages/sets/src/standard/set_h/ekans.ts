import {
  AddSpecialConditionsEffect,
  AttackEffect,
  CardType,
  CoinFlipPrompt,
  Effect,
  GameMessage,
  PokemonCard,
  SpecialCondition,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class Ekans extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16716,
      name: '阿柏蛇',
      yorenCode: 'P023',
      cardType: '1',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '135/204',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/370.png',
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/370.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.DARK];

  public hp: number = 60;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '混合毒液',
      cost: [CardType.DARK],
      damage: '',
      text: '抛掷1次硬币如果为正面，则令对手的战斗宝可梦陷入【中毒】和【混乱】状态。',
    },
    {
      name: '咬住',
      cost: [CardType.DARK, CardType.DARK],
      damage: '30',
      text: '',
    },
  ];

  public set: string = 'set_h';

  public name: string = '阿柏蛇';

  public fullName: string = '阿柏蛇 CSV7C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      return store.prompt(state, [new CoinFlipPrompt(effect.player.id, GameMessage.COIN_FLIP)], result => {
        if (result === true) {
          const specialCondition = new AddSpecialConditionsEffect(effect, [
            SpecialCondition.POISONED,
            SpecialCondition.CONFUSED,
          ]);
          store.reduceEffect(state, specialCondition);
        }
      });
    }

    return state;
  }
}
