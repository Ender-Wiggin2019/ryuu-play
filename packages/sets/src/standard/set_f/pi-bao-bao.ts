import {
  AttackEffect,
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class PiBaoBao extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 14283,
      name: '皮宝宝',
      yorenCode: 'P173',
      cardType: '1',
      commodityCode: 'CSV4C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '044/129',
        rarityLabel: 'C',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 30,
        evolveText: '基础',
        weakness: '钢 ×2',
        resistance: null,
        retreatCost: 0,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/121.png',
      ruleLines: [],
      attacks: [
        {
          id: 371,
          name: '握握抽取',
          text: '从牌库上方抽取卡牌，直到自己的手牌变为7张为止。',
          cost: [],
          damage: '',
        },
      ],
      features: [],
      illustratorNames: ['Mina Nakai'],
      pokemonCategory: '星形宝可梦',
      pokedexCode: '0173',
      pokedexText: '有着星星一样的轮廓。由于那外形，人们相信它是乘着流星而来的。',
      height: 0.3,
      weight: 3,
      deckRuleLimit: null,
    },
    collection: {
      id: 285,
      commodityCode: 'CSV4C',
      name: '补充包 嘉奖回合',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/285/121.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp = 30;

  public weakness = [{ type: CardType.METAL }];

  public retreat: CardType[] = [];

  public attacks = [
    {
      name: '握握抽取',
      cost: [],
      damage: '',
      text: '从牌库上方抽取卡牌，直到自己的手牌变为7张为止。',
    },
  ];

  public set = 'set_g';

  public name = '皮宝宝';

  public fullName = '皮宝宝 044/129#14283';

  public reduceEffect(_store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const drawCount = Math.max(0, 7 - effect.player.hand.cards.length);
      effect.player.deck.moveTo(effect.player.hand, Math.min(drawCount, effect.player.deck.cards.length));
      return state;
    }

    return state;
  }
}
