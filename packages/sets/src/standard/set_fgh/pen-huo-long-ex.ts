import {
  AttachEnergyPrompt,
  AttackEffect,
  CardTag,
  CardTarget,
  CardType,
  Effect,
  EnergyCard,
  EnergyType,
  GameMessage,
  PlayPokemonEffect,
  PlayerType,
  PokemonCard,
  PowerEffect,
  PowerType,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

export const PEN_HUO_LONG_EX_LOGIC_GROUP_KEY = 'pokemon:喷火龙ex:Y1181:G:hp330:烈炎支配:燃烧黑暗180+';
export const PEN_HUO_LONG_EX_VARIANT_GROUP_KEY = 'pokemon:喷火龙ex:Y1181:G:hp330:烈炎支配:燃烧黑暗180+';

type PenHuoLongExVariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  illustratorNames?: string[];
};

function seedPenHuoLongExVariant(card: PenHuoLongEx, seed: PenHuoLongExVariantSeed): PenHuoLongEx {
  card.rawData = {
    ...card.rawData,
    raw_card: {
      ...card.rawData.raw_card,
      id: seed.id,
      image: getCardImageUrl(seed.id),
      ...(seed.illustratorNames ? { illustratorNames: seed.illustratorNames } : {}),
      details: {
        ...card.rawData.raw_card.details,
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
      },
    },
    image_url: getR2CardImageUrl(seed.id),
    logic_group_key: PEN_HUO_LONG_EX_LOGIC_GROUP_KEY,
    variant_group_key: PEN_HUO_LONG_EX_VARIANT_GROUP_KEY,
    variant_group_size: 4,
  };
  card.fullName = `${card.name} CSV5C ${seed.collectionNumber}#${seed.id}`;
  return card;
}

export class PenHuoLongEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 14812,
      name: '喷火龙ex',
      yorenCode: 'Y1181',
      cardType: '1',
      commodityCode: 'CSV5C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '155/129',
        rarityLabel: 'SAR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '恶',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: '太晶',
        hp: 330,
        evolveText: '2阶进化',
        weakness: '草 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/298/384.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 3557,
          name: '燃烧黑暗',
          text: '追加造成对手已经获得的奖赏卡张数×30伤害。',
          cost: ['火', '火'],
          damage: '180+',
        },
      ],
      features: [
        {
          id: 491,
          name: '烈炎支配',
          text: '在自己的回合，当将这张卡牌从手牌使出并进行进化时，可使用1次。选择自己牌库中最多3张「基本【火】能量」，以任意方式附着于自己的宝可梦身上。并重洗牌库。',
        },
      ],
      illustratorNames: ['PLANETA Mochizuki'],
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
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/298/384.png',
    logic_group_key: PEN_HUO_LONG_EX_LOGIC_GROUP_KEY,
    variant_group_key: PEN_HUO_LONG_EX_VARIANT_GROUP_KEY,
    variant_group_size: 4,
  };

  public tags = [CardTag.POKEMON_EX, CardTag.TERA];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = '火恐龙';

  public cardTypes: CardType[] = [CardType.DARK];

  public hp: number = 330;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: '烈炎支配',
      powerType: PowerType.ABILITY,
      text: '在自己的回合，当将这张卡牌从手牌使出并进行进化时，可使用1次。选择自己牌库中最多3张「基本【火】能量」，以任意方式附着于自己的宝可梦身上。并重洗牌库。',
    },
  ];

  public attacks = [
    {
      name: '燃烧黑暗',
      cost: [CardType.FIRE, CardType.FIRE],
      damage: '180+',
      text: '追加造成对手已经获得的奖赏卡张数×30伤害。',
    },
  ];

  public set: string = 'set_g';

  public name: string = '喷火龙ex';

  public fullName: string = '喷火龙ex 155/129#14812';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const player = effect.player;
      const hasTarget = player.active.pokemons.cards.length > 0 || player.bench.some(slot => slot.pokemons.cards.length > 0);
      const fireEnergyCount = player.deck.cards.filter(card => {
        return card instanceof EnergyCard
          && card.energyType === EnergyType.BASIC
          && card.provides.includes(CardType.FIRE);
      }).length;

      if (!hasTarget || fireEnergyCount === 0) {
        player.deck.moveToBottom(player.deck);
        return state;
      }

      const blockedTo: CardTarget[] = [];
      if (player.active.pokemons.cards.length === 0) {
        blockedTo.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 });
      }
      player.bench.forEach((bench, index) => {
        if (bench.pokemons.cards.length === 0) {
          blockedTo.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index });
        }
      });

      try {
        const powerEffect = new PowerEffect(player, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch {
        return state;
      }

      return store.prompt(
        state,
        new AttachEnergyPrompt(
          player.id,
          GameMessage.ATTACH_ENERGY_TO_ACTIVE,
          player.deck,
          PlayerType.BOTTOM_PLAYER,
          [SlotType.ACTIVE, SlotType.BENCH],
          { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.FIRE] },
          { allowCancel: true, min: 0, max: 3, blockedTo }
        ),
        result => {
          const transfers = (result || []) as { to: CardTarget; card: EnergyCard }[];
          for (const transfer of transfers) {
            const target = StateUtils.getTarget(state, player, transfer.to);
            player.deck.moveCardTo(transfer.card, target.energies);
          }
          player.deck.moveToBottom(player.deck);
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage += (6 - effect.opponent.getPrizeLeft()) * 30;
      return state;
    }

    return state;
  }
}

export const penHuoLongExVariants = [
  seedPenHuoLongExVariant(new PenHuoLongEx(), {
    id: 14819,
    collectionNumber: '162/129',
    rarityLabel: 'UR',
    illustratorNames: ['PLANETA Tsuji'],
  }),
  seedPenHuoLongExVariant(new PenHuoLongEx(), {
    id: 14812,
    collectionNumber: '155/129',
    rarityLabel: 'SAR',
    illustratorNames: ['PLANETA Mochizuki'],
  }),
  seedPenHuoLongExVariant(new PenHuoLongEx(), {
    id: 14802,
    collectionNumber: '145/129',
    rarityLabel: 'SR',
    illustratorNames: ['PLANETA Tsuji'],
  }),
  seedPenHuoLongExVariant(new PenHuoLongEx(), {
    id: 14732,
    collectionNumber: '075/129',
    rarityLabel: 'RR',
    illustratorNames: ['5ban Graphics'],
  }),
];
