import {
  CardList,
  CardTag,
  CardType,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PokemonCard,
  PowerEffect,
  PowerType,
  ShuffleDeckPrompt,
  Stage,
  State,
  StoreLike,
  TrainerType,
} from '@ptcg/common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';
import { searchCardsToHand } from '../../common/utils/search-cards-to-hand';

type MiLiLongDragonVariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
};

const MI_LI_LONG_DRAGON_LOGIC_GROUP_KEY = 'pokemon:米立龙:P0978:H:dragon-hp70:揽客:冲浪50';
const MI_LI_LONG_DRAGON_VARIANT_GROUP_KEY = 'pokemon:米立龙:P0978:H:dragon-hp70:揽客:冲浪50';

function seedMiLiLongDragonVariant(card: MiLiLongDragon, seed: MiLiLongDragonVariantSeed): MiLiLongDragon {
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
    logic_group_key: MI_LI_LONG_DRAGON_LOGIC_GROUP_KEY,
    variant_group_key: MI_LI_LONG_DRAGON_VARIANT_GROUP_KEY,
    variant_group_size: 3,
  };
  card.fullName = `${card.name} ${card.rawData.raw_card.commodityCode} ${seed.collectionNumber}#${seed.id}`;
  return card;
}

function* useHospitalityOffer(
  next: Function,
  store: StoreLike,
  state: State,
  effect: PowerEffect,
  self: MiLiLongDragon,
): IterableIterator<State> {
  const player = effect.player;

  if (player.active.getPokemonCard() !== self) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  if (player.marker.hasMarker(self.HOSPITALITY_OFFER_MARKER, self)) {
    throw new GameError(GameMessage.POWER_ALREADY_USED);
  }

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  const topCards = new CardList();
  topCards.cards = player.deck.cards.splice(0, Math.min(6, player.deck.cards.length));

  yield* searchCardsToHand(
    next,
    store,
    state,
    player,
    topCards,
    { trainerType: TrainerType.SUPPORTER },
    {
      min: 0,
      max: 1,
      allowCancel: false,
      showToOpponent: true,
      shuffleAfterSearch: false,
    }
  );

  player.marker.addMarker(self.HOSPITALITY_OFFER_MARKER, self);
  topCards.moveTo(player.deck);

  if (player.deck.cards.length > 0) {
    yield store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
      player.deck.applyOrder(order);
      next();
    });
  }

  return state;
}

export class MiLiLongDragon extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17537,
      name: '米立龙',
      yorenCode: 'P0978',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '160/207',
        rarityLabel: 'U',
        cardTypeLabel: '宝可梦',
        attributeLabel: '龙',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 70,
        evolveText: '基础',
        weakness: null,
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/437.png',
      ruleLines: [],
      attacks: [
        {
          id: 129,
          name: '冲浪',
          text: '',
          cost: ['火', '水'],
          damage: '50',
        },
      ],
      features: [
        {
          id: 20,
          name: '揽客',
          text: '如果这只宝可梦在战斗场上的话，则在自己的回合可以使用1次。查看自己牌库上方6张卡牌，选择其中1张支援者，在给对手看过之后，加入手牌。将剩余的卡牌放回牌库并重洗牌库。',
        },
      ],
      illustratorNames: ['Jerky'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/437.png',
    logic_group_key: MI_LI_LONG_DRAGON_LOGIC_GROUP_KEY,
    variant_group_key: MI_LI_LONG_DRAGON_VARIANT_GROUP_KEY,
    variant_group_size: 3,
  };

  public tags: CardTag[] = [];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.DRAGON];

  public hp = 70;

  public weakness = [];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '揽客',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '如果这只宝可梦在战斗场上的话，则在自己的回合可以使用1次。查看自己牌库上方6张卡牌，选择其中1张支援者，在给对手看过之后，加入手牌。将剩余的卡牌放回牌库并重洗牌库。',
    },
  ];

  public attacks = [
    {
      name: '冲浪',
      cost: [CardType.FIRE, CardType.WATER],
      damage: '50',
      text: '',
    },
  ];

  public set = 'set_h';

  public name = '米立龙';

  public fullName = '米立龙 CSV8C 160/207#17537';

  public readonly HOSPITALITY_OFFER_MARKER = 'HOSPITALITY_OFFER_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useHospitalityOffer(() => generator.next(), store, state, effect, this);
      return generator.next().value;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.HOSPITALITY_OFFER_MARKER, this);
      return state;
    }

    return state;
  }
}

export const miLiLongDragonVariants = [
  seedMiLiLongDragonVariant(new MiLiLongDragon(), {
    id: 17537,
    collectionNumber: '160/207',
    rarityLabel: 'U',
  }),
  seedMiLiLongDragonVariant(new MiLiLongDragon(), {
    id: 17781,
    collectionNumber: '160/207',
    rarityLabel: 'U★',
  }),
  seedMiLiLongDragonVariant(new MiLiLongDragon(), {
    id: 17957,
    collectionNumber: '160/207',
    rarityLabel: 'U★★',
  }),
];
