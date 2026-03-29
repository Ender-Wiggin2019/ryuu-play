import {
  AttackEffect,
  Card,
  CardType,
  ChooseCardsPrompt,
  Effect,
  GameMessage,
  PokemonCard,
  ShuffleDeckPrompt,
  Stage,
  State,
  StoreLike,
  SuperType,
} from '@ptcg/common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type BoBoRawData = {
  raw_card: {
    id: number;
    name: string;
    yorenCode: string;
    cardType: string;
    commodityCode: string;
    details: {
      regulationMarkText: string;
      collectionNumber: string;
      rarityLabel: string;
      cardTypeLabel: string;
      attributeLabel: string;
      specialCardLabel: string | null;
      hp: number;
      evolveText: string;
      weakness: string;
      resistance: string;
      retreatCost: number;
    };
    image: string;
    ruleLines: string[];
    attacks: Array<{
      id: number;
      name: string;
      text: string;
      cost: string[];
      damage: string;
    }>;
    features: unknown[];
  };
  collection: {
    id: number;
    commodityCode: string;
    name: string;
  };
  image_url: string;
  logic_group_key: string;
  variant_group_key: string;
  variant_group_size: number;
};

type BoBoVariantCapable = {
  name: string;
  fullName: string;
  rawData: BoBoRawData;
};

export type BoBoVariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  commodityCode?: string;
};

export const BO_BO_LOGIC_GROUP_KEY = 'pokemon:波波:P016:G:hp50:呼朋引伴+撞击';
export const BO_BO_VARIANT_GROUP_KEY = 'pokemon:波波:P016:G:hp50';

export function seedBoBoVariant<T extends BoBoVariantCapable>(instance: T, options: BoBoVariantSeed): T {
  const commodityCode = options.commodityCode || instance.rawData.raw_card.commodityCode;
  instance.rawData = {
    ...instance.rawData,
    raw_card: {
      ...instance.rawData.raw_card,
      id: options.id,
      commodityCode,
      image: getCardImageUrl(options.id),
      details: {
        ...instance.rawData.raw_card.details,
        collectionNumber: options.collectionNumber,
        rarityLabel: options.rarityLabel,
      },
    },
    image_url: getR2CardImageUrl(options.id),
    logic_group_key: BO_BO_LOGIC_GROUP_KEY,
    variant_group_key: BO_BO_VARIANT_GROUP_KEY,
  };
  instance.fullName = `${instance.name} ${commodityCode} ${options.collectionNumber}#${options.id}`;
  return instance;
}

export function seedBoBoVariants<T extends BoBoVariantCapable>(
  factory: () => T,
  variants: BoBoVariantSeed[]
): T[] {
  return variants.map(variant => seedBoBoVariant(factory(), variant));
}

function* useBirdCall(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  const emptySlots = player.bench.filter(slot => slot.pokemons.cards.length === 0);
  const basicCards = player.deck.cards.filter(card => {
    return card.superType === SuperType.POKEMON && (card as PokemonCard).stage === Stage.BASIC;
  });

  if (emptySlots.length === 0 || basicCards.length === 0) {
    return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
      player.deck.applyOrder(order);
      next();
    });
  }

  const max = Math.min(2, emptySlots.length, basicCards.length);
  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
      player.deck,
      { superType: SuperType.POKEMON, stage: Stage.BASIC },
      { min: 0, max, allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  selected.forEach((card, index) => {
    player.deck.moveCardTo(card, emptySlots[index].pokemons);
    emptySlots[index].pokemonPlayedTurn = state.turn;
  });

  return store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
    player.deck.applyOrder(order);
    next();
  });
}

export class BoBo extends PokemonCard {
  public rawData: BoBoRawData = {
    raw_card: {
      id: 11516,
      name: '波波',
      yorenCode: 'P016',
      cardType: '1',
      commodityCode: '151C4',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '153/151',
        rarityLabel: 'S',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        specialCardLabel: null,
        hp: 50,
        evolveText: '基础',
        weakness: '雷 ×2',
        resistance: '斗 -30',
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/280/430.png',
      ruleLines: [],
      attacks: [
        {
          id: 4925,
          name: '呼朋引伴',
          text: '选择自己牌库中最多2张【基础】宝可梦，放于备战区。并重洗牌库。',
          cost: ['COLORLESS'],
          damage: '',
        },
        {
          id: 4926,
          name: '撞击',
          text: '',
          cost: ['COLORLESS', 'COLORLESS'],
          damage: '20',
        },
      ],
      features: [],
    },
    collection: {
      id: 280,
      commodityCode: '151C4',
      name: '收集啦151 聚',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/280/430.png',
    logic_group_key: BO_BO_LOGIC_GROUP_KEY,
    variant_group_key: BO_BO_VARIANT_GROUP_KEY,
    variant_group_size: 5,
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 50;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '呼朋引伴',
      cost: [CardType.COLORLESS],
      damage: '',
      text: '选择自己牌库中最多2张【基础】宝可梦，放于备战区。并重洗牌库。',
    },
    {
      name: '撞击',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '20',
      text: '',
    },
  ];

  public set: string = 'set_g';

  public name: string = '波波';

  public fullName: string = '波波 151C4 153/151#11516';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useBirdCall(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
