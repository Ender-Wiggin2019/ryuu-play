import {
  Card,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StoreLike,
  AttackEffect,
  CardType,
} from '@ptcg/common';

export class YaoQuanEr extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17945,
      name: '钥圈儿',
      yorenCode: 'P707',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '146/207',
        rarityLabel: 'C★★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '钢',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 70,
        evolveText: '基础',
        weakness: '火 ×2',
        resistance: '草 -30',
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/401.png',
      ruleLines: [],
      attacks: [
        {
          id: 742,
          name: '开锁抽取',
          text: '将自己的1张手牌放于弃牌区。然后，从自己牌库上方抽取2张卡牌。',
          cost: ['无色'],
          damage: null,
        },
        {
          id: 743,
          name: '钩住',
          text: '',
          cost: ['无色'],
          damage: '20',
        },
      ],
      features: [],
      illustratorNames: ['mingo'],
      pokemonCategory: '钥匙串宝可梦',
      pokedexCode: '0707',
      pokedexText: '过去的贵族会将掌管金库钥匙的钥圈儿一代代地传承下去，好好珍惜。',
      height: 0.2,
      weight: 3,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/401.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.METAL];

  public hp: number = 70;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '开锁抽取',
      cost: [CardType.COLORLESS],
      damage: '',
      text: '将自己的1张手牌放于弃牌区。然后，从自己牌库上方抽取2张卡牌。',
    },
    {
      name: '钩住',
      cost: [CardType.COLORLESS],
      damage: '20',
      text: '',
    },
  ];

  public set: string = 'set_h';

  public name: string = '钥圈儿';

  public fullName: string = '钥圈儿 146/207#17945';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      if (player.hand.cards.length === 0) {
        return state;
      }

      let cards: Card[] = [];
      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_DISCARD,
          player.hand,
          {},
          { min: 1, max: 1, allowCancel: false }
        ),
        selected => {
          cards = selected || [];
          if (cards.length > 0) {
            player.hand.moveCardsTo(cards, player.discard);
            player.deck.moveTo(player.hand, Math.min(2, player.deck.cards.length));
          }
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.damage = 20;
      return state;
    }

    return state;
  }
}
