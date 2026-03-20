import {
  AttackEffect,
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';
import { commonAttacks } from '../../common';

export class Gimmighoul2 extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 15986,
      yorenCode: 'P0999',
      name: '索财灵',
      cardType: '1',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '105/SV-P'
      },
      image: 'img\\312\\5.png',
      hash: '9d9daba74c404e3e2c74482a687e62f5'
    },
    collection: {
      id: 312,
      name: '任务奖赏包 第五弹',
      commodityCode: 'MISSION05',
      salesDate: '2025-11-07'
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/312/5.png'
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 50;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Call for Family',
      cost: [CardType.COLORLESS],
      damage: '',
      text: 'Search your deck for a Basic Pokemon and put it onto your Bench. Then, shuffle your deck.'
    },
    {
      name: 'Push Down',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '20',
      text: ''
    }
  ];

  public set: string = 'set_g';

  public name: string = 'Gimmighoul';

  public fullName: string = 'Gimmighoul CSV4C 2';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    const callForFamily = commonAttacks.callForFamily(this, store, state, effect);

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      return callForFamily.use(effect, {});
    }

    return state;
  }
}
