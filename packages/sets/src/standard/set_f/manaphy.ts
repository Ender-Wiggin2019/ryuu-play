import {
  CardType,
  Effect,
  PokemonCard,
  PowerType,
  PutDamageEffect,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class Manaphy extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 9556,
      yorenCode: 'P490',
      cardType: '1',
      nameSamePokemonId: 1982,
      details: {
        id: 9556,
        evolveText: '基础',
        cardName: '玛纳霏',
        regulationMarkText: 'F',
        collectionNumber: '052/128',
        rarity: '2',
        rarityText: 'U',
        hp: 70,
        attribute: '3',
        yorenCode: 'P490',
        cardType: '1',
        cardTypeText: '宝可梦',
        featureFlag: '1',
        cardFeatureItemList: [
          {
            featureName: '浪花水帘',
            featureDesc: '只要这只宝可梦在场上，自己所有的备战宝可梦，不会受到对手招式的伤害。',
          },
        ],
        abilityItemList: [
          {
            abilityName: '泼水',
            abilityText: 'none',
            abilityCost: '3',
            abilityDamage: '20',
          },
        ],
        ruleText: '',
        pokemonCategory: '回游宝可梦',
        weaknessType: '4',
        weaknessFormula: '×2',
        retreatCost: 1,
        pokedexCode: '490',
        pokedexText: '拥有神奇的能力，能与任何宝可梦心意相通。',
        height: 0.3,
        weight: 1.4,
        illustratorName: ['HYOGONOSUKE'],
        commodityList: [
          {
            commodityName: '补充包 勇魅群星 勇',
            commodityCode: 'CS5bC',
          },
        ],
        collectionFlag: 0,
        skills: [],
        special_shiny_type: 0,
      },
      name: '玛纳霏',
      image: 'img\\182\\92.png',
      hash: '767c055a181408cb6f5a878a380c62fa',
    },
    collection: {
      id: 182,
      name: '补充包 勇魅群星 勇',
      commodityCode: 'CS5bC',
      salesDate: '2024-06-18',
      series: '2',
      seriesText: '剑&盾',
      goodsType: '1',
      linkType: 0,
      image: 'img/182/cover.png',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/182/92.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 70;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: 'Wave Veil',
      powerType: PowerType.ABILITY,
      text: 'Prevent all damage done to your Benched Pokemon by attacks from your opponent\'s Pokemon.',
    },
  ];

  public attacks = [
    {
      name: 'Rain Splash',
      cost: [CardType.WATER],
      damage: '20',
      text: '',
    },
  ];

  public set: string = 'set_f';

  public name: string = 'Manaphy';

  public fullName: string = 'Manaphy CS5bC';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PutDamageEffect) {
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);
      if (!pokemonSlot) {
        return state;
      }

      const owner = StateUtils.findOwner(state, pokemonSlot);
      const opponent = StateUtils.getOpponent(state, owner);
      const isFromOpponentAttack = effect.player === opponent;
      const isOwnerBenchTarget = owner.bench.includes(effect.target);

      if (isFromOpponentAttack && isOwnerBenchTarget) {
        effect.preventDefault = true;
      }
    }

    return state;
  }
}
