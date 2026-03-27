import {
  CardTag,
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

export class LegacyEnergy extends EnergyCard {
  public rawData = {
    raw_card: {
      id: 17584,
      name: '遗赠能量',
      yorenCode: 'Y1494',
      cardType: '3',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '207/207'
      },
      image: 'img/458/558.png',
      hash: '8fde2b4c8350686f3397e9acf39b2562'
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
      salesDate: '2026-03-13'
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/558.png'
  };

  public provides: CardType[] = [CardType.COLORLESS];

  public energyType = EnergyType.SPECIAL;

  public tags = [CardTag.ACE_SPEC];

  public set: string = 'set_h';

  public name: string = '遗赠能量';

  public fullName: string = '遗赠能量 CSV8C';

  public readonly LEGACY_ENERGY_MARKER = 'LEGACY_ENERGY_MARKER';

  public text: string =
    '只要这张卡牌，被附着于宝可梦身上，就被视作1个所有属性的能量。' +
    '身上附着了这张卡牌的宝可梦，受到对手宝可梦的招式的伤害而【昏厥】时，对手拿取的奖赏卡将减少1张。对战中，自己的「遗赠能量」的这个效果，只会生效1次。';

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckProvidedEnergyEffect && effect.source.energies.cards.includes(this)) {
      effect.energyMap.forEach(item => {
        if (item.card === this) {
          item.provides = [CardType.ANY];
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

      if (!effect.player.marker.hasMarker(this.LEGACY_ENERGY_MARKER)) {
        effect.prizeCount = Math.max(0, effect.prizeCount - 1);
        effect.player.marker.addMarker(this.LEGACY_ENERGY_MARKER, this);
      }
    }

    return state;
  }
}
