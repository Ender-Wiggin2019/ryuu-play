import {
  CardType,
  CheckProvidedEnergyEffect,
  Effect,
  EnergyCard,
  EnergyType,
  GamePhase,
  KnockOutEffect,
  State,
  StoreLike,
} from '@ptcg/common';

export class GiftEnergy extends EnergyCard {
  public provides: CardType[] = [CardType.COLORLESS];
  public energyType = EnergyType.SPECIAL;
  public set: string = 'set_f';
  public name = '馈赠能量';
  public fullName = '馈赠能量 set_f';
  public text = '只要这张卡牌，被附着于宝可梦身上，就被视作1个【无】能量。身上附有这张卡牌的宝可梦，受到对手宝可梦的招式的伤害而【昏厥】时，从牌库上方抽取卡牌，直到自己的手牌变为7张为止。';

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckProvidedEnergyEffect && effect.source.energies.cards.includes(this)) {
      effect.energyMap.forEach(item => {
        if (item.card === this) {
          item.provides = [CardType.COLORLESS];
        }
      });
      return state;
    }

    if (effect instanceof KnockOutEffect && effect.target.energies.cards.includes(this)) {
      if (state.phase !== GamePhase.ATTACK) {
        return state;
      }

      const attackingPlayer = state.players[state.activePlayer];
      if (attackingPlayer === undefined || attackingPlayer === effect.player) {
        return state;
      }

      const drawCount = Math.max(0, 7 - effect.player.hand.cards.length);
      effect.player.deck.moveTo(effect.player.hand, Math.min(drawCount, effect.player.deck.cards.length));
      return state;
    }

    return state;
  }
}
