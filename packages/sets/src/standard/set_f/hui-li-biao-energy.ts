import {
  AfterDamageEffect,
  CardType,
  CheckProvidedEnergyEffect,
  DiscardCardsEffect,
  Effect,
  EnergyCard,
  EnergyType,
  PlayerType,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class HuiLiBiaoEnergy extends EnergyCard {
  public provides: CardType[] = [CardType.COLORLESS];

  public energyType = EnergyType.SPECIAL;

  public set: string = 'set_h';

  public name: string = '回力镖能量';

  public fullName: string = '回力镖能量 CSV8C';

  public readonly RETURN_MARKER = 'HUILIBIAO_RETURN_MARKER';

  public text: string =
    '只要这张卡牌，被附着于宝可梦身上，就被视作1个【无】能量。' +
    '如果因为身上附着了这张卡牌的宝可梦所使用的招式的效果，而导致这张卡牌被放于弃牌区的话，则在处理完招式的伤害和效果后，将这张卡牌附着回原来的宝可梦身上。';

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckProvidedEnergyEffect && effect.source.energies.cards.includes(this)) {
      effect.energyMap.forEach(item => {
        if (item.card === this) {
          item.provides = [CardType.COLORLESS];
        }
      });
      return state;
    }

    if (effect instanceof DiscardCardsEffect && effect.cards.includes(this) && effect.source.energies.cards.includes(this)) {
      effect.source.marker.addMarker(this.RETURN_MARKER, this);
      return state;
    }

    if (effect instanceof AfterDamageEffect) {
      const slot = StateUtils.findPokemonSlot(state, this);
      if (slot !== undefined) {
        return state;
      }

      state.players.forEach(player => {
        player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (pokemonSlot) => {
          if (pokemonSlot.marker.hasMarker(this.RETURN_MARKER, this) && player.discard.cards.includes(this)) {
            player.discard.moveCardTo(this, pokemonSlot.energies);
            pokemonSlot.marker.removeMarker(this.RETURN_MARKER, this);
          }
        });
      });
    }

    return state;
  }
}
