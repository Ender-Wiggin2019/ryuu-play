import {
  AttachEnergyEffect,
  CardType,
  CheckProvidedEnergyEffect,
  Effect,
  EnergyCard,
  EnergyType,
  State,
  StoreLike,
} from '@ptcg/common';

export class JetEnergy extends EnergyCard {
  public provides: CardType[] = [CardType.COLORLESS];
  public energyType = EnergyType.SPECIAL;
  public set: string = 'set_g';
  public name = '喷射能量';
  public fullName = '喷射能量 set_g';
  public text = '只要这张卡牌，被附着于宝可梦身上，就被视作1个【无】能量。当将这张卡牌从手牌附着于备战宝可梦身上时，将该宝可梦与战斗宝可梦互换。';

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
      effect instanceof AttachEnergyEffect
      && effect.energyCard === this
      && effect.player.hand.cards.includes(this)
      && effect.target !== effect.player.active
    ) {
      effect.player.switchPokemon(effect.target);
      return state;
    }

    return state;
  }
}
