import {
  AttackEffect,
  CardType,
  Effect,
  PlayerType,
  PokemonCard,
  PowerEffect,
  PowerType,
  PutDamageEffect,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class Manaphy extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 9556,
      name: '玛纳霏',
      yorenCode: 'P490',
      cardType: '1',
      commodityCode: 'CS5bC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '052/128',
        rarityLabel: 'U',
        cardTypeLabel: '宝可梦',
        attributeLabel: '水',
        hp: 70,
        evolveText: '基础',
        weakness: '雷 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/182/92.png',
      attacks: [
        {
          id: 9738,
          name: '泼水',
          text: '',
          cost: ['WATER'],
          damage: '20',
        },
      ],
      features: [
        {
          id: 1307,
          name: '浪花水帘',
          text: '只要这只宝可梦在场上，自己所有的备战宝可梦，不会受到对手招式的伤害。',
        },
      ],
    },
    collection: {
      id: 182,
      commodityCode: 'CS5bC',
      name: '补充包 勇魅群星 勇',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/182/92.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 70;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '浪花水帘',
      powerType: PowerType.ABILITY,
      text: '只要这只宝可梦在场上，自己所有的备战宝可梦，不会受到对手招式的伤害。',
    },
  ];

  public attacks = [
    {
      name: '泼水',
      cost: [CardType.WATER],
      damage: '20',
      text: '',
    },
  ];

  public set: string = 'set_f';

  public name: string = '玛纳霏';

  public fullName: string = '玛纳霏 CS5bC';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PutDamageEffect) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (effect.target === player.active || effect.target === opponent.active) {
        return state;
      }

      if (!(effect.attackEffect instanceof AttackEffect)) {
        return state;
      }

      const targetPlayer = StateUtils.findOwner(state, effect.target);

      let isManaphyInPlay = false;
      targetPlayer.forEachPokemon(PlayerType.BOTTOM_PLAYER, (_cardList, card) => {
        if (card === this) {
          isManaphyInPlay = true;
        }
      });

      if (!isManaphyInPlay) {
        return state;
      }

      try {
        const powerEffect = new PowerEffect(player, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch {
        return state;
      }

      effect.preventDefault = true;
    }

    return state;
  }
}
