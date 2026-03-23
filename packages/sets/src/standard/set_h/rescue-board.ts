import {
  CheckHpEffect,
  CheckRetreatCostEffect,
  Effect,
  State,
  StoreLike,
  TrainerCard,
  TrainerType,
} from '@ptcg/common';

export class RescueBoard extends TrainerCard {
  public rawData = {
    raw_card: {
      id: 17353,
      name: '紧急滑板',
      yorenCode: 'Y1411',
      cardType: '2',
      commodityCode: 'PROMOSVEVENT02',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '197/SV-P',
      },
      image: 'img/453/70.png',
      hash: 'd133c20cb47d171e3bee16d3fd915d80',
    },
    collection: {
      id: 453,
      name: '活动特别包 第二弹',
      commodityCode: 'PROMOSVEVENT02',
      salesDate: '2026-03-13',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/453/70.png',
  };

  public trainerType: TrainerType = TrainerType.TOOL;

  public set: string = 'set_h';

  public name: string = 'Rescue Board';

  public fullName: string = 'Rescue Board PROMOSVEVENT02';

  public text: string =
    'The Retreat Cost of the Pokemon this card is attached to is C less. ' +
    'If that Pokemon\'s remaining HP is 30 or less, it has no Retreat Cost.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckRetreatCostEffect && effect.player.active.trainers.cards.includes(this)) {
      const checkHp = new CheckHpEffect(effect.player, effect.player.active);
      state = store.reduceEffect(state, checkHp);
      const remainingHp = checkHp.hp - effect.player.active.damage;

      if (remainingHp <= 30) {
        effect.cost = [];
        return state;
      }

      if (effect.cost.length > 0) {
        effect.cost.splice(0, 1);
      }
    }

    return state;
  }
}
