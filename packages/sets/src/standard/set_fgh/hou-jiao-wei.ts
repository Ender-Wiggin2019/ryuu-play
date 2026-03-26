import {
  AttackEffect,
  CardTag,
  CardType,
  ChoosePokemonPrompt,
  Effect,
  GameMessage,
  HealEffect,
  PlayerType,
  PokemonCard,
  SlotType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

type HouJiaoWeiVariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  commodityCode: string;
  collectionId: number;
  collectionName: string;
  specialCardLabel: string | null;
};

type HouJiaoWeiRawData = {
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
      trainerTypeLabel: null;
      energyTypeLabel: null;
      pokemonTypeLabel: null;
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
      damage: string | null;
    }>;
    features: unknown[];
    illustratorNames: string[];
    pokemonCategory: string;
    pokedexCode: string;
    pokedexText: string;
    height: number;
    weight: number;
    deckRuleLimit: null;
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

export const HOU_JIAO_WEI_H_LOGIC_GROUP_KEY = 'pokemon:吼叫尾:H:歌唱激励+巨声';
export const HOU_JIAO_WEI_H_VARIANTS: HouJiaoWeiVariantSeed[] = [
  {
    id: 16692,
    collectionNumber: '107/204',
    rarityLabel: 'C★★★',
    commodityCode: 'CSV7C',
    collectionId: 324,
    collectionName: '补充包 利刃猛醒',
    specialCardLabel: '古代',
  },
  {
    id: 16519,
    collectionNumber: '107/204',
    rarityLabel: 'C☆★',
    commodityCode: 'CSV7C',
    collectionId: 324,
    collectionName: '补充包 利刃猛醒',
    specialCardLabel: '古代',
  },
  {
    id: 16273,
    collectionNumber: '107/204',
    rarityLabel: 'C',
    commodityCode: 'CSV7C',
    collectionId: 324,
    collectionName: '补充包 利刃猛醒',
    specialCardLabel: '古代',
  },
];

function createHouJiaoWeiRawData(seed: HouJiaoWeiVariantSeed): HouJiaoWeiRawData {
  return {
    raw_card: {
      id: seed.id,
      name: '吼叫尾',
      yorenCode: 'P0985',
      cardType: '1',
      commodityCode: seed.commodityCode,
      details: {
        regulationMarkText: 'H',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: seed.specialCardLabel,
        hp: 90,
        evolveText: '基础',
        weakness: '恶 ×2',
        resistance: '斗 -30',
        retreatCost: 1,
      },
      image: `/api/v1/cards/${seed.id}/image`,
      ruleLines: [],
      attacks: [
        {
          id: 2165,
          name: '歌唱激励',
          text: '回复自己备战区中的1只「古代」宝可梦「100」HP。',
          cost: ['无色'],
          damage: null,
        },
        {
          id: 2166,
          name: '巨声',
          text: '',
          cost: ['无色', '无色'],
          damage: '40',
        },
      ],
      features: [],
      illustratorNames: ['kawayoo'],
      pokemonCategory: '悖谬宝可梦',
      pokedexCode: '0985',
      pokedexText: '过去只有１次目击纪录。这只宝可梦与古老的探险记所记载的神秘生物长得很像。',
      height: 1.2,
      weight: 8,
      deckRuleLimit: null,
    },
    collection: {
      id: seed.collectionId,
      commodityCode: seed.commodityCode,
      name: seed.collectionName,
    },
    image_url: `http://localhost:3000/api/v1/cards/${seed.id}/image`,
    logic_group_key: HOU_JIAO_WEI_H_LOGIC_GROUP_KEY,
    variant_group_key: HOU_JIAO_WEI_H_LOGIC_GROUP_KEY,
    variant_group_size: HOU_JIAO_WEI_H_VARIANTS.length,
  };
}

function isAncientPokemon(card: PokemonCard | undefined): boolean {
  if (card === undefined) {
    return false;
  }

  const rawData = card as any;
  const labels = [
    rawData.rawData?.raw_card?.details?.specialCardLabel,
    rawData.rawData?.api_card?.specialCardLabel,
  ];

  return labels.some((label: unknown) => label === '古代');
}

export class HouJiaoWei extends PokemonCard {
  public rawData: HouJiaoWeiRawData = createHouJiaoWeiRawData(HOU_JIAO_WEI_H_VARIANTS[0]);

  public tags = [CardTag.TERA];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 90;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '歌唱激励',
      cost: [CardType.COLORLESS],
      damage: '',
      text: '回复自己备战区中的1只「古代」宝可梦「100」HP。',
    },
    {
      name: '巨声',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '40',
      text: '',
    },
  ];

  public set: string = 'set_h';

  public name: string = '吼叫尾';

  public fullName: string = '吼叫尾 107/204#16692';

  constructor(seed: HouJiaoWeiVariantSeed = HOU_JIAO_WEI_H_VARIANTS[0]) {
    super();
    this.rawData = createHouJiaoWeiRawData(seed);
    this.fullName = `吼叫尾 ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const blocked = player.bench
        .map((slot, index) => {
          if (slot.pokemons.cards.length === 0 || !isAncientPokemon(slot.getPokemonCard())) {
            return { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index };
          }
          return null;
        })
        .filter((target): target is { player: PlayerType; slot: SlotType; index: number } => target !== null);

      if (blocked.length === player.bench.length) {
        return state;
      }

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_POKEMON_TO_HEAL,
          PlayerType.BOTTOM_PLAYER,
          [SlotType.BENCH],
          { allowCancel: false, blocked }
        ),
        targets => {
          const target = (targets || [])[0];
          if (target === undefined) {
            return;
          }
          const healEffect = new HealEffect(player, target, Math.min(100, target.damage));
          store.reduceEffect(state, healEffect);
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.damage = 40;
      return state;
    }

    return state;
  }
}
