import {
  CheckHpEffect,
  Effect,
  State,
  StoreLike,
  TrainerCard,
  TrainerType,
} from '@ptcg/common';

export class BraveryCharm extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 17637,
      name: '勇气护符',
      yorenCode: 'Y1211',
      cardType: '2',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '260/207',
      },
      image: 'img/458/611.png',
      hash: '4bf88c52ff79c49f3da9ea942b117b34',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
      salesDate: '2026-03-13',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/458/611.png',
  };

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'set_g';

  public name: string = 'Bravery Charm';

  public fullName: string = 'Bravery Charm CSV8C';

  public text: string = 'The Basic Pokemon this card is attached to gets +50 HP.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckHpEffect && effect.target.trainers.cards.includes(this) && effect.target.isBasic()) {
      effect.hp += 50;
    }

    return state;
  }
}
