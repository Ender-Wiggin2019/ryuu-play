import {
  AttackEffect,
  CardTag,
  CardType,
  DealDamageEffect,
  Effect,
  PokemonCard,
  PowerType,
  PutDamageEffect,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

function hasAbility(card: PokemonCard | undefined): boolean {
  if (card === undefined) {
    return false;
  }

  return card.powers.some(power => power.powerType === PowerType.ABILITY);
}

export class CornerstoneMaskOgerponEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17498,
      name: '厄诡椪 础石面具ex',
      yorenCode: 'Y1452',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '121/207',
        rarityLabel: 'RR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '斗',
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: '太晶',
        hp: 210,
        evolveText: '基础',
        weakness: '草 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/336.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 307,
          name: '打爆',
          text: '这个招式的伤害，不计算弱点、抗性以及对手战斗宝可梦身上所附加的效果。',
          cost: ['斗', '无色', '无色'],
          damage: '140',
        },
      ],
      features: [
        {
          id: 54,
          name: '础石之姿',
          text: '这只宝可梦，不受到对手拥有特性的宝可梦的招式的伤害。',
        },
      ],
      illustratorNames: ['Yano Keiji'],
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/336.png',
  };

  public tags = [CardTag.POKEMON_EX, CardTag.TERA];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 210;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '础石之姿',
      powerType: PowerType.ABILITY,
      text: '这只宝可梦，不受到对手拥有特性的宝可梦的招式的伤害。',
    },
  ];

  public attacks = [
    {
      name: '打爆',
      cost: [CardType.FIGHTING, CardType.COLORLESS, CardType.COLORLESS],
      damage: '140',
      text: '这个招式的伤害，不计算弱点、抗性以及对手战斗宝可梦身上所附加的效果。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '厄诡椪 础石面具ex';

  public fullName: string = '厄诡椪 础石面具ex CSV8C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof DealDamageEffect || effect instanceof PutDamageEffect) {
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);
      if (pokemonSlot === undefined) {
        return state;
      }

      const owner = StateUtils.findOwner(state, pokemonSlot);
      if (effect.player !== StateUtils.getOpponent(state, owner)) {
        return state;
      }

      if (effect.target !== pokemonSlot) {
        return state;
      }

      if (!hasAbility(effect.source.getPokemonCard())) {
        return state;
      }

      effect.preventDefault = true;
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.ignoreWeakness = true;
      effect.ignoreResistance = true;
      return state;
    }

    return state;
  }
}
