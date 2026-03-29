import {
  AddSpecialConditionsEffect,
  AttackEffect,
  CardType,
  Effect,
  PokemonCard,
  SpecialCondition,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class Klawf extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 15938,
      name: '毛崖蟹',
      yorenCode: 'P0950',
      cardType: '1',
      commodityCode: 'CSV6C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '080/128',
        rarityLabel: 'U★★★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '斗',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 110,
        evolveText: '基础',
        weakness: '草 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/225.png',
      ruleLines: [],
      attacks: [
        {
          id: 955,
          name: '歇斯底里巨钳',
          text: '如果这只宝可梦处于特殊状态的话，则追加造成160伤害。',
          cost: ['无色', '无色'],
          damage: '30+',
        },
        {
          id: 956,
          name: '沸腾压制',
          text: '令这只宝可梦陷入【灼伤】状态。',
          cost: ['斗', '斗'],
          damage: '80',
        },
      ],
      features: [],
    },
    collection: {
      id: 311,
      commodityCode: 'CSV6C',
      name: '补充包 真实玄虚',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/225.png',
  };

  public stage = Stage.BASIC;

  public cardTypes = [CardType.FIGHTING];

  public hp = 110;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '歇斯底里巨钳',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '30+',
      text: '如果这只宝可梦处于特殊状态的话，则追加造成160伤害。',
    },
    {
      name: '沸腾压制',
      cost: [CardType.FIGHTING, CardType.FIGHTING],
      damage: '80',
      text: '令这只宝可梦陷入【灼伤】状态。',
    },
  ];

  public set = 'set_g';

  public name = '毛崖蟹';

  public fullName = '毛崖蟹 080/128#15938';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = effect.player.active.specialConditions.length > 0 ? 190 : 30;
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const burned = new AddSpecialConditionsEffect(effect, [SpecialCondition.BURNED]);
      burned.target = effect.player.active;
      store.reduceEffect(state, burned);
      return state;
    }

    return state;
  }
}
