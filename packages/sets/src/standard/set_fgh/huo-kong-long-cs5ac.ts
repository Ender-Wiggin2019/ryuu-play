import {
  AttackEffect,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StoreLike,
  SuperType,
} from '@ptcg/common';

import {
  seedHuoKongLongVariants,
} from './huo-kong-long-variant';

export const HUO_KONG_LONG_CS5AC_LOGIC_GROUP_KEY = 'pokemon:火恐龙:P005:F:hp90:抓+喷射火焰';
export const HUO_KONG_LONG_CS5AC_VARIANT_GROUP_KEY = 'pokemon:火恐龙:P005:F:hp90:抓+喷射火焰';

function* discardFireEnergy(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  const fireEnergies = player.active.energies.cards.filter(card =>
    card instanceof EnergyCard
    && card.energyType === EnergyType.BASIC
    && card.provides.includes(CardType.FIRE)
  );

  if (fireEnergies.length === 0) {
    return state;
  }

  let selected: EnergyCard[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      player.active.energies,
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.FIRE] },
      { min: 1, max: 1, allowCancel: false }
    ),
    cards => {
      selected = (cards || []) as EnergyCard[];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  player.active.energies.moveCardsTo(selected, player.discard);
  return state;
}

export class HuoKongLongCs5aC extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 9962,
      name: '火恐龙',
      yorenCode: 'P005',
      cardType: '1',
      commodityCode: 'CS5aC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '002/127',
        rarityLabel: 'U☆★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 90,
        evolveText: '1阶进化',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/183/3.png',
      ruleLines: [],
      attacks: [
        {
          id: 9541,
          name: '抓',
          text: '',
          cost: ['火', '无色'],
          damage: '30',
        },
        {
          id: 9542,
          name: '喷射火焰',
          text: '选择附着于这只宝可梦身上的1个【火】能量，放于弃牌区。',
          cost: ['火', '火', '无色', '无色'],
          damage: '100',
        },
      ],
      features: [],
      illustratorNames: ['Dsuke'],
      pokemonCategory: '火焰宝可梦',
      pokedexCode: '005',
      pokedexText: '挥动燃烧着火焰的尾巴，用锋利的爪子撕裂对手。性格十分粗暴。',
      height: 1.1,
      weight: 19,
      deckRuleLimit: null,
    },
    collection: {
      id: 183,
      commodityCode: 'CS5aC',
      name: '补充包 勇魅群星 魅',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/183/3.png',
    logic_group_key: HUO_KONG_LONG_CS5AC_LOGIC_GROUP_KEY,
    variant_group_key: HUO_KONG_LONG_CS5AC_VARIANT_GROUP_KEY,
    variant_group_size: 2,
  };

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '小火龙';

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 90;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '抓',
      cost: [CardType.FIRE, CardType.COLORLESS],
      damage: '30',
      text: '',
    },
    {
      name: '喷射火焰',
      cost: [CardType.FIRE, CardType.FIRE, CardType.COLORLESS, CardType.COLORLESS],
      damage: '100',
      text: '选择附着于这只宝可梦身上的1个【火】能量，放于弃牌区。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '火恐龙';

  public fullName: string = '火恐龙 CS5aC 002/127#9962';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 30;
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.damage = 100;
      const generator = discardFireEnergy(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}

export const huoKongLongCs5aCVariants = seedHuoKongLongVariants(
  () => new HuoKongLongCs5aC(),
  [
    {
      id: 9962,
      commodityCode: 'CS5aC',
      collectionId: 183,
      collectionName: '补充包 勇魅群星 魅',
      collectionNumber: '002/127',
      rarityLabel: 'U☆★',
    },
    {
      id: 9786,
      commodityCode: 'CS5aC',
      collectionId: 183,
      collectionName: '补充包 勇魅群星 魅',
      collectionNumber: '002/127',
      rarityLabel: 'U',
    },
  ],
  {
    logicGroupKey: HUO_KONG_LONG_CS5AC_LOGIC_GROUP_KEY,
    variantGroupKey: HUO_KONG_LONG_CS5AC_VARIANT_GROUP_KEY,
    variantGroupSize: 2,
  }
);
