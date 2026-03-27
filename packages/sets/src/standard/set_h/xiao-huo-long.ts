import {
  AttackEffect,
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class XiaoHuoLong extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 11367,
      name: '小火龙',
      yorenCode: 'P004',
      cardType: '1',
      commodityCode: '151C4',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '004/151',
        rarityLabel: 'C',
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 70,
        evolveText: '基础',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/280/7.png',
      ruleLines: [],
      attacks: [
        {
          id: 4692,
          name: '烧光',
          text: '将场上的竞技场放于弃牌区。',
          cost: ['火'],
          damage: null,
        },
        {
          id: 4693,
          name: '吐火',
          text: '',
          cost: ['火', '火'],
          damage: '30',
        },
      ],
      features: [],
      illustratorNames: ['GIDORA'],
      pokemonCategory: '蜥蜴宝可梦',
      pokedexCode: '0004',
      pokedexText: '生下来的时候，尾巴上就有火焰在燃烧。火焰熄灭时，它的生命也会结束。',
      height: 0.6,
      weight: 8.5,
      deckRuleLimit: null,
    },
    collection: {
      id: 280,
      commodityCode: '151C4',
      name: '收集啦151 聚',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/280/7.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 70;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '烧光',
      cost: [CardType.FIRE],
      damage: '',
      text: '将场上的竞技场放于弃牌区。',
    },
    {
      name: '吐火',
      cost: [CardType.FIRE, CardType.FIRE],
      damage: '30',
      text: '',
    },
  ];

  public set: string = 'set_h';

  public name: string = '小火龙';

  public fullName: string = '小火龙 151C4';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const stadiumCard = StateUtils.getStadiumCard(state);
      if (stadiumCard === undefined) {
        return state;
      }

      const owner = StateUtils.findOwner(state, StateUtils.findCardList(state, stadiumCard));
      owner.stadium.moveCardTo(stadiumCard, owner.discard);
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.damage = 30;
      return state;
    }

    return state;
  }
}
