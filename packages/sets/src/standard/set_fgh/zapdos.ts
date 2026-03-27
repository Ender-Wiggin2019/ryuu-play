import {
  AddSpecialConditionsEffect,
  AttackEffect,
  CardType,
  CoinFlipPrompt,
  DiscardCardsEffect,
  Effect,
  GameMessage,
  PokemonCard,
  SpecialCondition,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class Zapdos extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16667,
      name: '闪电鸟',
      yorenCode: 'P145',
      cardType: '1',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '077/204',
        rarityLabel: 'R★★★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '雷',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 120,
        evolveText: '基础',
        weakness: '雷 ×2',
        resistance: '斗 -30',
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/214.png',
      ruleLines: [],
      attacks: [
        {
          id: 2126,
          name: '电磁波',
          text: '抛掷1次硬币如果为正面，则令对手的战斗宝可梦陷入【麻痹】状态。',
          cost: ['LIGHTNING'],
          damage: null,
        },
        {
          id: 2127,
          name: '十万伏特',
          text: '将这只宝可梦身上附着的能量，全部放于弃牌区。',
          cost: ['LIGHTNING', 'LIGHTNING', 'COLORLESS'],
          damage: '190',
        },
      ],
      features: [],
      illustratorNames: ['GOSSAN'],
      pokemonCategory: '电击宝可梦',
      pokedexCode: '0145',
      pokedexText: '能够随心所欲地操纵雷电。据传说，它的巢穴处在漆黑的雷云中。',
      height: 1.6,
      weight: 52.6,
      deckRuleLimit: null,
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/214.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp: number = 120;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '电磁波',
      cost: [CardType.LIGHTNING],
      damage: '',
      text: '抛掷1次硬币如果为正面，则令对手的战斗宝可梦陷入【麻痹】状态。',
    },
    {
      name: '十万伏特',
      cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.COLORLESS],
      damage: '190',
      text: '将这只宝可梦身上附着的能量，全部放于弃牌区。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '闪电鸟';

  public fullName: string = '闪电鸟 CSV7C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      return store.prompt(state, [new CoinFlipPrompt(effect.player.id, GameMessage.COIN_FLIP)], result => {
        if (result) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.PARALYZED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const cards = effect.player.active.energies.cards.slice();
      const discardEnergy = new DiscardCardsEffect(effect, cards);
      discardEnergy.target = effect.player.active;
      store.reduceEffect(state, discardEnergy);
      return state;
    }

    return state;
  }
}
