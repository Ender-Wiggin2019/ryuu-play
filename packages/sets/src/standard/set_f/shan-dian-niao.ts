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

export class ShanDianNiao extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10642,
      name: '闪电鸟',
      yorenCode: 'P145',
      cardType: '1',
      commodityCode: 'CS6aC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '057/131',
        rarityLabel: 'R',
        cardTypeLabel: '宝可梦',
        attributeLabel: '雷',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 120,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/208/104.png',
      ruleLines: [],
      attacks: [
        {
          id: 441,
          name: '雷电球',
          text: '',
          cost: ['雷', '雷', '无色'],
          damage: '110',
        },
      ],
      features: [
        {
          id: 74,
          name: '电气象征',
          text: '只要这只宝可梦在场上，自己【雷】属性的【基础】宝可梦（除「闪电鸟」外）使用的招式，给对手战斗宝可梦造成的伤害「+10」。',
        },
      ],
      illustratorNames: ['GOSSAN'],
      pokemonCategory: '电击宝可梦',
      pokedexCode: '0145',
      pokedexText: '能够随心所欲地操纵雷电。据传说，它的巢穴处在漆黑的雷云中。',
      height: 1.6,
      weight: 52.6,
      deckRuleLimit: null,
    },
    collection: {
      id: 208,
      name: '补充包 碧海暗影 啸',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/208/104.png',
  };

  public tags = [];

  public stage = Stage.BASIC;

  public cardTypes = [CardType.LIGHTNING];

  public hp = 120;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '雷电球',
      cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.COLORLESS],
      damage: '110',
      text: '',
    },
  ];

  public set: string = 'set_f';

  public name: string = '闪电鸟';

  public fullName: string = '闪电鸟 057/131#10642';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    const pokemonSlot = StateUtils.findPokemonSlot(state, this);
    if (pokemonSlot === undefined) {
      return state;
    }

    if (effect instanceof AttackEffect) {
      const sourceCard = effect.player.active.getPokemonCard();
      if (
        sourceCard !== undefined
        && sourceCard !== this
        && sourceCard.name !== this.name
        && sourceCard.stage === Stage.BASIC
        && sourceCard.cardTypes.includes(CardType.LIGHTNING)
      ) {
        effect.damage += 10;
      }
    }

    return state;
  }
}
