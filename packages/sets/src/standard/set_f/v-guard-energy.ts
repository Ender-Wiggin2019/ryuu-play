import {
  AttackEffect,
  CardTag,
  CardType,
  CheckProvidedEnergyEffect,
  DealDamageEffect,
  Effect,
  EnergyCard,
  EnergyType,
  State,
  StoreLike,
} from '@ptcg/common';

function isPokemonVFamily(card: any): boolean {
  if (card === undefined) {
    return false;
  }

  if (card.tags.includes(CardTag.POKEMON_V) || card.tags.includes(CardTag.POKEMON_VSTAR)) {
    return true;
  }

  const labels = [
    card.rawData?.raw_card?.details?.pokemonTypeLabel,
    card.rawData?.api_card?.pokemonTypeLabel,
  ];

  return labels.some((value: unknown) => typeof value === 'string' && value.includes('宝可梦VMAX'));
}

export class VGuardEnergy extends EnergyCard {
  public provides: CardType[] = [CardType.COLORLESS];

  public energyType = EnergyType.SPECIAL;

  public set: string = 'set_f';

  public name: string = 'V防守能量';

  public fullName: string = 'V防守能量 CS6.5C';

  public text: string =
    '只要这张卡牌，被附着于宝可梦身上，就被视作1个【无】能量。' +
    '身上附有这张卡牌的宝可梦，受到对手「宝可梦V」的招式的伤害「-30」。这个效果，无论身上附有多少张「V防守能量」，都不会叠加。';

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckProvidedEnergyEffect && effect.source.energies.cards.includes(this)) {
      effect.energyMap.forEach(item => {
        if (item.card === this) {
          item.provides = [CardType.COLORLESS];
        }
      });
      return state;
    }

    if (effect instanceof DealDamageEffect && effect.target.energies.cards.includes(this) && effect.damage > 0) {
      if (!(effect.attackEffect instanceof AttackEffect)) {
        return state;
      }

      const sourceCard = effect.source.getPokemonCard();
      const isPokemonV = isPokemonVFamily(sourceCard);

      if (isPokemonV && effect.target.energies.cards.find(card => card instanceof VGuardEnergy) === this) {
        effect.damage = Math.max(0, effect.damage - 30);
      }
    }

    return state;
  }
}
