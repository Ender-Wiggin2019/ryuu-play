import {
  AttackEffect,
  CardType,
  CheckRetreatCostEffect,
  Effect,
  PokemonCard,
  PowerEffect,
  PowerType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class Ariados extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16172,
      name: '阿利多斯',
      yorenCode: 'P168',
      cardType: '1',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '006/204',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/15.png',
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/15.png',
  };

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '圆丝蛛';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 90;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '大网',
      powerType: PowerType.ABILITY,
      text: '只要这只宝可梦在场上，对手战斗场上的进化宝可梦【撤退】所需能量，就会增加1个。',
    },
  ];

  public attacks = [
    {
      name: '丝线缠绕',
      cost: [CardType.GRASS],
      damage: '10+',
      text: '追加造成对手战斗宝可梦【撤退】所需能量数量×30伤害。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '阿利多斯';

  public fullName: string = '阿利多斯 CSV7C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckRetreatCostEffect) {
      const slot = StateUtils.findPokemonSlot(state, this);
      if (slot === undefined) {
        return state;
      }

      const owner = StateUtils.findOwner(state, slot);
      if (effect.player.id === owner.id || !effect.player.active.isEvolved()) {
        return state;
      }

      try {
        const powerEffect = new PowerEffect(owner, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch {
        return state;
      }

      effect.cost.push(CardType.COLORLESS);
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = StateUtils.getOpponent(state, effect.player);
      const retreatCost = new CheckRetreatCostEffect(opponent);
      store.reduceEffect(state, retreatCost);
      effect.damage += retreatCost.cost.length * 30;
      return state;
    }

    return state;
  }
}
