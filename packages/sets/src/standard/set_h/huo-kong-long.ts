import {
  ChooseCardsPrompt,
  AttackEffect,
  CardType,
  Effect,
  EnergyCard,
  GameMessage,
  PokemonCard,
  SuperType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class HuoKongLong extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 11368,
      name: '火恐龙',
      yorenCode: 'P005',
      cardType: '1',
      commodityCode: '151C4',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '005/151',
        rarityLabel: 'U',
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 100,
        evolveText: '1阶进化',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/280/10.png',
      ruleLines: [],
      attacks: [
        {
          id: 4694,
          name: '烈焰',
          text: '',
          cost: ['火'],
          damage: '20',
        },
        {
          id: 4695,
          name: '大字爆炎',
          text: '选择这只宝可梦身上附着的1个能量，放于弃牌区。',
          cost: ['火', '火', '火'],
          damage: '90',
        },
      ],
      features: [],
      illustratorNames: ['GIDORA'],
      pokemonCategory: '火焰宝可梦',
      pokedexCode: '0005',
      pokedexText: '如果它在战斗中亢奋起来，就会喷出灼热的火焰，把周围的东西烧得一干二净。',
      height: 1.1,
      weight: 19,
      deckRuleLimit: null,
    },
    collection: {
      id: 280,
      commodityCode: '151C4',
      name: '收集啦151 聚',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/280/10.png',
  };

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '小火龙';

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 100;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '烈焰',
      cost: [CardType.FIRE],
      damage: '20',
      text: '',
    },
    {
      name: '大字爆炎',
      cost: [CardType.FIRE, CardType.FIRE, CardType.FIRE],
      damage: '90',
      text: '选择这只宝可梦身上附着的1个能量，放于弃牌区。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '火恐龙';

  public fullName: string = '火恐龙 151C4';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 20;
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      if (player.active.energies.cards.length === 0) {
        return state;
      }

      effect.damage = 90;
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
          const selected = (cards || []) as EnergyCard[];
          if (selected.length > 0) {
            player.active.energies.moveCardsTo(selected, player.discard);
          }
        }
      );
    }

    return state;
  }
}
