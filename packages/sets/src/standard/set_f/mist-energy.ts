import {
  AddMarkerEffect,
  AddSpecialConditionsEffect,
  CardType,
  CheckProvidedEnergyEffect,
  DiscardCardsEffect,
  Effect,
  EnergyCard,
  EnergyType,
  MoveCardsEffect,
  PutCountersEffect,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

function isOpponentAttackEffect(state: State, effect: { player: any; target: any }): boolean {
  const owner = StateUtils.findOwner(state, effect.target);
  return owner !== undefined && owner !== effect.player;
}

export class MistEnergy extends EnergyCard {
  public provides: CardType[] = [CardType.COLORLESS];
  public energyType = EnergyType.SPECIAL;
  public set: string = 'set_h';
  public name = '薄雾能量';
  public fullName = '薄雾能量 set_h';
  public text = '只要这张卡牌，被附着于宝可梦身上，就被视作1个【无】能量。身上附着了这张卡牌的宝可梦，不受到对手宝可梦所使用的招式的效果影响。（已经受到的效果，不会消失。）';

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckProvidedEnergyEffect && effect.source.energies.cards.includes(this)) {
      effect.energyMap.forEach(item => {
        if (item.card === this) {
          item.provides = [CardType.COLORLESS];
        }
      });
      return state;
    }

    if (
      (effect instanceof AddSpecialConditionsEffect
        || effect instanceof DiscardCardsEffect
        || effect instanceof MoveCardsEffect
        || effect instanceof PutCountersEffect
        || effect instanceof AddMarkerEffect)
      && effect.target.energies.cards.includes(this)
      && isOpponentAttackEffect(state, effect)
    ) {
      effect.preventDefault = true;
      return state;
    }

    return state;
  }
}
