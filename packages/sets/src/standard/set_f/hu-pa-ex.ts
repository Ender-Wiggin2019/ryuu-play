import {
  AttackEffect,
  CardTag,
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type HuPaExVariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  imageUrl: string;
};

const HU_PA_EX_LOGIC_GROUP_KEY = 'pokemon:胡帕ex:Y1337:G:hp220:能量粉碎50×:energy-count';
const HU_PA_EX_VARIANT_GROUP_KEY = 'pokemon:胡帕ex:Y1337:G:hp220:能量粉碎50×:energy-count';

function seedHuPaExVariant(card: HuPaEx, seed: HuPaExVariantSeed): HuPaEx {
  card.rawData = {
    ...card.rawData,
    raw_card: {
      ...card.rawData.raw_card,
      id: seed.id,
      image: getCardImageUrl(seed.id),
      details: {
        ...card.rawData.raw_card.details,
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
      },
    },
    image_url: getR2CardImageUrl(seed.id),
    logic_group_key: HU_PA_EX_LOGIC_GROUP_KEY,
    variant_group_key: HU_PA_EX_VARIANT_GROUP_KEY,
    variant_group_size: 2,
  };
  card.fullName = `${card.name} ${seed.collectionNumber}#${seed.id}`;
  return card;
}

export class HuPaEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 14726,
      name: '胡帕ex',
      yorenCode: 'Y1337',
      cardType: '1',
      commodityCode: 'CSV5C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '069/129',
        rarityLabel: 'RR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '斗',
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: '太晶',
        hp: 220,
        evolveText: '基础',
        weakness: '超 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/298/190.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 1312,
          name: '能量粉碎',
          text: '造成对手所有宝可梦身上附着的能量数量×50伤害。',
          cost: ['恶', '恶'],
          damage: '50×',
        },
        {
          id: 1313,
          name: '狂徒拳',
          text: '在下一个自己的回合，这只宝可梦无法使用「狂徒拳」。',
          cost: ['恶', '恶', '恶'],
          damage: '200',
        },
      ],
      features: [],
      illustratorNames: ['5ban Graphics'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 298,
      commodityCode: 'CSV5C',
      name: '补充包 黑晶炽诚',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/298/190.png',
    logic_group_key: HU_PA_EX_LOGIC_GROUP_KEY,
    variant_group_key: HU_PA_EX_VARIANT_GROUP_KEY,
    variant_group_size: 2,
  };

  public tags = [CardTag.POKEMON_EX, CardTag.TERA];

  public stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp = 220;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '能量粉碎',
      cost: [CardType.DARK, CardType.DARK],
      damage: '50×',
      text: '造成对手所有宝可梦身上附着的能量数量×50伤害。',
    },
    {
      name: '狂徒拳',
      cost: [CardType.DARK, CardType.DARK, CardType.DARK],
      damage: '200',
      text: '在下一个自己的回合，这只宝可梦无法使用「狂徒拳」。',
    },
  ];

  public set = 'set_g';

  public name = '胡帕ex';

  public fullName = '胡帕ex 069/129#14726';

  public lockedAttackTurn = -1;

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const opponent = StateUtils.getOpponent(state, effect.player);
      let energyCount = 0;
      [opponent.active, ...opponent.bench].forEach(pokemonSlot => {
        energyCount += pokemonSlot.energies.cards.length;
      });
      effect.damage = energyCount * 50;
      return state;
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[1] || effect.attack.name === this.attacks[1].name)) {
      if (this.lockedAttackTurn === state.turn) {
        throw new Error('BLOCKED_BY_EFFECT');
      }

      this.lockedAttackTurn = state.turn + 1;
      return state;
    }

    return state;
  }
}

export const huPaExVariants = [
  seedHuPaExVariant(new HuPaEx(), {
    id: 14726,
    collectionNumber: '069/129',
    rarityLabel: 'RR',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/298/190.png',
  }),
  seedHuPaExVariant(new HuPaEx(), {
    id: 14799,
    collectionNumber: '142/129',
    rarityLabel: 'SR',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/298/371.png',
  }),
];
