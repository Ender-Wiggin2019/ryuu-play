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

export class SandyShocksG extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 15669,
      name: '爬地翅',
      yorenCode: 'P0988',
      cardType: '1',
      commodityCode: 'CSV6C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '082/128',
        rarityLabel: 'U',
        cardTypeLabel: '宝可梦',
        attributeLabel: '斗',
        specialCardLabel: '古代',
        hp: 140,
        evolveText: '基础',
        weakness: '超 ×2',
        resistance: null,
        retreatCost: 3,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/227.png',
      ruleLines: [],
      attacks: [
        {
          id: 1,
          name: '踏平',
          text: '将对手牌库上方1张卡牌放于弃牌区。',
          cost: ['斗'],
          damage: 'none',
        },
        {
          id: 2,
          name: '烫伤怒涛',
          text: '给这只宝可梦也造成90伤害。令对手的战斗宝可梦陷入【灼伤】状态。',
          cost: ['斗', '斗'],
          damage: '120',
        },
      ],
      features: [],
      illustratorNames: ['Anesaki Dynamic'],
      deckRuleLimit: null,
    },
    collection: {
      id: 311,
      commodityCode: 'CSV6C',
      name: '补充包 真实玄虚',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/311/227.png',
  };

  public stage: Stage = Stage.BASIC;
  public cardTypes: CardType[] = [CardType.FIGHTING];
  public hp = 140;
  public weakness = [{ type: CardType.PSYCHIC }];
  public resistance = [];
  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '踏平',
      cost: [CardType.FIGHTING],
      damage: '',
      text: '将对手牌库上方1张卡牌放于弃牌区。',
    },
    {
      name: '烫伤怒涛',
      cost: [CardType.FIGHTING, CardType.FIGHTING],
      damage: '120',
      text: '给这只宝可梦也造成90伤害。令对手的战斗宝可梦陷入【灼伤】状态。',
    },
  ];

  public set = 'set_g';
  public name = '爬地翅';
  public fullName = '爬地翅 CSV6C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      effect.opponent.deck.moveTo(effect.opponent.discard, 1);
      return state;
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[1] || effect.attack.name === this.attacks[1].name)) {
      effect.player.active.damage += 90;
      const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.BURNED]);
      specialConditionEffect.target = effect.opponent.active;
      return store.reduceEffect(state, specialConditionEffect);
    }

    return state;
  }
}
