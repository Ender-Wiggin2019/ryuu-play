import {
  CardType,
  CheckProvidedEnergyEffect,
  DealDamageEffect,
  Effect,
  EnergyCard,
  EnergyType,
  State,
  StoreLike,
} from '@ptcg/common';

export class DoubleTurboEnergy extends EnergyCard {
  public provides: CardType[] = [CardType.COLORLESS];
  public energyType = EnergyType.SPECIAL;
  public set: string = 'set_f';
  public name = '双重涡轮能量';
  public fullName = '双重涡轮能量 set_f';
  public text = '只要这张卡牌，被附着于宝可梦身上，就被视作2个【无】能量。身上附有这张卡牌的宝可梦所使用的招式，给对手的宝可梦造成的伤害「-20」。';

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckProvidedEnergyEffect && effect.source.energies.cards.includes(this)) {
      effect.energyMap.forEach(item => {
        if (item.card === this) {
          item.provides = [CardType.COLORLESS, CardType.COLORLESS];
        }
      });
      return state;
    }

    if (effect instanceof DealDamageEffect && effect.source.energies.cards.includes(this) && effect.damage > 0) {
      effect.damage = Math.max(0, effect.damage - 20);
      return state;
    }

    return state;
  }
}
