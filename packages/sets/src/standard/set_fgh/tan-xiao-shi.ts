import {
  AttackEffect,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StoreLike,
  SuperType,
} from '@ptcg/common';

export class TanXiaoShi extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17853,
      name: '炭小侍',
      yorenCode: 'P0935',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '039/207',
        rarityLabel: 'C★★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 80,
        evolveText: '基础',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/110.png',
      ruleLines: [],
      attacks: [
        {
          id: 602,
          name: '殴打',
          text: '',
          cost: ['火'],
          damage: '10',
        },
        {
          id: 603,
          name: '喷射火焰',
          text: '选择这只宝可梦身上附着的1个能量，放于弃牌区。',
          cost: ['火', '火', '无色'],
          damage: '70',
        },
      ],
      features: [],
      illustratorNames: ['Mékayu'],
      pokemonCategory: '小火星宝可梦',
      pokedexCode: '0935',
      pokedexText: '一旦进入战斗状态，火力就会上升至摄氏１０００度。喜欢吃油脂含量高的树果。',
      height: 0.6,
      weight: 10.5,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/110.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 80;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '殴打',
      cost: [CardType.FIRE],
      damage: '10',
      text: '',
    },
    {
      name: '喷射火焰',
      cost: [CardType.FIRE, CardType.FIRE, CardType.COLORLESS],
      damage: '70',
      text: '选择这只宝可梦身上附着的1个能量，放于弃牌区。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '炭小侍';

  public fullName: string = '炭小侍 039/207#17853';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 10;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      if (player.active.energies.cards.length === 0) {
        return state;
      }

      effect.damage = 70;
      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_DISCARD,
          player.active.energies,
          { superType: SuperType.ENERGY },
          { min: 1, max: 1, allowCancel: false }
        ),
        cards => {
          const selected = cards || [];
          if (selected.length > 0) {
            player.active.energies.moveCardsTo(selected, player.discard);
          }
        }
      );
    }

    return state;
  }
}
