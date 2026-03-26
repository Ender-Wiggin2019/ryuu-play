import {
  AttackEffect,
  CardType,
  ChoosePokemonPrompt,
  DealDamageEffect,
  Effect,
  GameMessage,
  PlayerType,
  PokemonCard,
  PutDamageEffect,
  SlotType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

type HouJiaoWeiGVariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  commodityCode: string;
  collectionId: number;
  collectionName: string;
  specialCardLabel: string | null;
};

type HouJiaoWeiGRawData = {
  raw_card: {
    id: number;
    name: string;
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

export const HOU_JIAO_WEI_G_LOGIC_GROUP_KEY = 'pokemon:吼叫尾:G:巴掌+凶暴吼叫';
export const HOU_JIAO_WEI_G_VARIANTS: HouJiaoWeiGVariantSeed[] = [
  {
    id: 15924,
    collectionNumber: '065/128',
    rarityLabel: 'U★★★',
    commodityCode: 'CSV6C',
    collectionId: 311,
    collectionName: '补充包 真实玄虚',
    specialCardLabel: '古代',
  },
  {
    id: 15809,
    collectionNumber: '065/128',
    rarityLabel: 'U☆★',
    commodityCode: 'CSV6C',
    collectionId: 311,
    collectionName: '补充包 真实玄虚',
    specialCardLabel: '古代',
  },
  {
    id: 15652,
    collectionNumber: '065/128',
    rarityLabel: 'U',
    commodityCode: 'CSV6C',
    collectionId: 311,
    collectionName: '补充包 真实玄虚',
    specialCardLabel: '古代',
  },
  {
    id: 16097,
    collectionNumber: '104/052',
    rarityLabel: '无标记',
    commodityCode: 'CSVL2C',
    collectionId: 314,
    collectionName: '游历专题包',
    specialCardLabel: '古代',
  },
  {
    id: 16908,
    collectionNumber: '011/033',
    rarityLabel: '无标记',
    commodityCode: 'CSVM1bC',
    collectionId: 329,
    collectionName: '大师战略卡组构筑套装 沙奈朵ex',
    specialCardLabel: null,
  },
];

function createHouJiaoWeiGRawData(seed: HouJiaoWeiGVariantSeed): HouJiaoWeiGRawData {
  return {
    raw_card: {
      id: seed.id,
      name: '吼叫尾',
      cardType: '1',
      commodityCode: seed.commodityCode,
      details: {
        regulationMarkText: 'G',
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
          id: 2449,
          name: '巴掌',
          text: '',
          cost: ['超'],
          damage: '30',
        },
        {
          id: 2450,
          name: '凶暴吼叫',
          text: '给对手的1只宝可梦，造成这只宝可梦身上放置的伤害指示物数量×20伤害。[备战宝可梦不计算弱点、抗性。]',
          cost: ['超', '无色'],
          damage: null,
        },
      ],
      features: [],
      illustratorNames: ['5ban Graphics'],
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
    logic_group_key: HOU_JIAO_WEI_G_LOGIC_GROUP_KEY,
    variant_group_key: HOU_JIAO_WEI_G_LOGIC_GROUP_KEY,
    variant_group_size: HOU_JIAO_WEI_G_VARIANTS.length,
  };
}

export class HouJiaoWeiG extends PokemonCard {
  public rawData: HouJiaoWeiGRawData = createHouJiaoWeiGRawData(HOU_JIAO_WEI_G_VARIANTS[0]);

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 90;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '巴掌',
      cost: [CardType.PSYCHIC],
      damage: '30',
      text: '',
    },
    {
      name: '凶暴吼叫',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: '',
      text: '给对手的1只宝可梦，造成这只宝可梦身上放置的伤害指示物数量×20伤害。[备战宝可梦不计算弱点、抗性。]',
    },
  ];

  public set: string = 'set_g';

  public name: string = '吼叫尾';

  public fullName: string = '吼叫尾 065/128#15924';

  constructor(seed: HouJiaoWeiGVariantSeed = HOU_JIAO_WEI_G_VARIANTS[0]) {
    super();
    this.rawData = createHouJiaoWeiGRawData(seed);
    this.fullName = `吼叫尾 ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 30;
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const opponent = effect.opponent;
      const blocked = [
        opponent.active.getPokemonCard() === undefined ? { player: PlayerType.TOP_PLAYER, slot: SlotType.ACTIVE, index: 0 } : null,
        ...opponent.bench.map((slot, index) =>
          slot.getPokemonCard() === undefined ? { player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index } : null
        ),
      ].filter(
        (target): target is { player: PlayerType; slot: SlotType; index: number } => target !== null
      );

      if (blocked.length === opponent.bench.length + (opponent.active.getPokemonCard() === undefined ? 1 : 0)) {
        return state;
      }

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          effect.player.id,
          GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
          PlayerType.TOP_PLAYER,
          [SlotType.ACTIVE, SlotType.BENCH],
          { allowCancel: false, min: 1, max: 1, blocked }
        ),
        targets => {
          const target = (targets || [])[0];
          if (target === undefined) {
            return;
          }

          const selectedPokemon = typeof target.getPokemonCard === 'function' ? target.getPokemonCard() : undefined;
          const actualTarget = target === opponent.active
            ? opponent.active
            : [opponent.active, ...opponent.bench].find(slot => {
              if (slot === target) {
                return true;
              }
              if (selectedPokemon === undefined) {
                return false;
              }
              return slot.getPokemonCard() === selectedPokemon;
            });

          if (actualTarget === undefined) {
            return;
          }

          const damage = Math.floor(actualTarget.damage / 10) * 20;
          if (actualTarget === opponent.active) {
            const damageEffect = new DealDamageEffect(effect, damage);
            damageEffect.target = actualTarget;
            store.reduceEffect(state, damageEffect);
            return;
          }

          const damageEffect = new PutDamageEffect(effect, damage);
          damageEffect.target = actualTarget;
          store.reduceEffect(state, damageEffect);
        }
      );
    }

    return state;
  }
}
