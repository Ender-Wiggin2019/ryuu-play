import {
  AttackEffect,
  CardType,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PokemonCard,
  PowerEffect,
  PowerType,
  SpecialCondition,
  Stage,
  State,
  StoreLike,
  UseAttackEffect,
} from '@ptcg/common';

export class BruteBonnet extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 15722,
      name: '猛恶菇',
      yorenCode: 'P0986',
      cardType: '1',
      commodityCode: 'CSV6C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '135/128',
        rarityLabel: 'AR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '恶',
        pokemonTypeLabel: null,
        specialCardLabel: '古代',
        hp: 120,
        evolveText: '基础',
        weakness: '草 ×2',
        resistance: null,
        retreatCost: 3,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/364.png',
      ruleLines: [],
      attacks: [
        {
          id: 980,
          name: '暴走重锤',
          text: '在下一个自己的回合，这只宝可梦无法使用招式。',
          cost: ['恶', '恶', '无色'],
          damage: '120',
        },
      ],
      features: [
        {
          id: 125,
          name: '烈毒粉尘',
          text: '如果这只宝可梦身上放有「驱劲能量 古代」的话，则在自己的回合可以使用1次。令双方的战斗宝可梦，各陷入【中毒】状态。',
        },
      ],
    },
    collection: {
      id: 311,
      commodityCode: 'CSV6C',
      name: '补充包 真实玄虚',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/364.png',
  };

  public stage = Stage.BASIC;

  public cardTypes = [CardType.DARK];

  public hp = 120;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: '烈毒粉尘',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '如果这只宝可梦身上放有「驱劲能量 古代」的话，则在自己的回合可以使用1次。令双方的战斗宝可梦，各陷入【中毒】状态。',
    },
  ];

  public attacks = [
    {
      name: '暴走重锤',
      cost: [CardType.DARK, CardType.DARK, CardType.COLORLESS],
      damage: '120',
      text: '在下一个自己的回合，这只宝可梦无法使用招式。',
    },
  ];

  public set = 'set_g';

  public name = '猛恶菇';

  public fullName = '猛恶菇 135/128#15722';

  public lockedAttackTurn = -1;

  public readonly RAGING_HAMMER_MARKER = 'RAGING_HAMMER_MARKER';

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const hasAncientEnergy = player.active.getPokemonCard() === this
        ? player.active.energies.cards.some(card => card.name === '驱劲能量 古代')
        : false;

      if (!hasAncientEnergy) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.marker.hasMarker(this.RAGING_HAMMER_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      const opponent = state.players.find(p => p !== player);
      if (opponent) {
        opponent.active.addSpecialCondition(SpecialCondition.POISONED);
      }
      player.marker.addMarker(this.RAGING_HAMMER_MARKER, this);
      return state;
    }

    if (effect instanceof UseAttackEffect && effect.player.active.getPokemonCard() === this && this.lockedAttackTurn === state.turn) {
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      this.lockedAttackTurn = state.turn + 1;
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.RAGING_HAMMER_MARKER, this);
      return state;
    }

    return state;
  }
}
