import {
  AttackEffect,
  CardType,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  HealEffect,
  PokemonCard,
  Stage,
  State,
  StoreLike,
  SuperType,
} from '@ptcg/common';

export class KaBiShouH extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16324,
      name: '卡比兽',
      yorenCode: 'Y1461',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '158/204',
        rarityLabel: 'U',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        hp: 160,
        evolveText: '基础',
        weakness: '斗 ×2',
        retreatCost: 4,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/429.png',
      ruleLines: [],
      attacks: [
        {
          id: 1,
          name: '填饱肚子',
          text: '选择自己手牌中的1张能量，附着于这只宝可梦身上。然后，回复这只宝可梦「60」HP。',
          cost: ['无色'],
          damage: '',
        },
        {
          id: 2,
          name: '重磅冲击',
          text: '',
          cost: ['无色', '无色', '无色', '无色'],
          damage: '160',
        },
      ],
      features: [],
      illustratorNames: ['5ban Graphics'],
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/429.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 160;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [
    CardType.COLORLESS,
    CardType.COLORLESS,
    CardType.COLORLESS,
    CardType.COLORLESS,
  ];

  public attacks = [
    {
      name: '填饱肚子',
      cost: [CardType.COLORLESS],
      damage: '',
      text: '选择自己手牌中的1张能量，附着于这只宝可梦身上。然后，回复这只宝可梦「60」HP。',
    },
    {
      name: '重磅冲击',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '160',
      text: '',
    },
  ];

  public set: string = 'set_h';

  public name: string = '卡比兽';

  public fullName: string = '卡比兽 158/204';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const energyCards = effect.player.hand.cards.filter(card => card.superType === SuperType.ENERGY);
      if (energyCards.length > 0) {
        return store.prompt(
          state,
          new ChooseCardsPrompt(
            effect.player.id,
            GameMessage.CHOOSE_CARD_TO_HAND,
            effect.player.hand,
            { superType: SuperType.ENERGY },
            { min: 1, max: 1, allowCancel: false },
          ),
          selected => {
            if (selected && selected.length > 0) {
              effect.player.hand.moveCardTo(selected[0], effect.player.active.energies);
              const heal = new HealEffect(effect.player, effect.player.active, 60);
              store.reduceEffect(state, heal);
            }
          },
        );
      }

      return state;
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[1] || effect.attack.name === this.attacks[1].name)) {
      effect.damage = 160;
    }

    return state;
  }
}
