import {
  Card,
  CardList,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PowerEffect,
  PowerType,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type HuaLiaoHuanHuanVariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  imageUrl: string;
};

const HUA_LIAO_HUAN_HUAN_LOGIC_GROUP_KEY = 'pokemon:花疗环环:P764:F:hp70:选花30:top2-lostzone';
const HUA_LIAO_HUAN_HUAN_VARIANT_GROUP_KEY = 'pokemon:花疗环环:P764:F:hp70:选花30:top2-lostzone';

function seedHuaLiaoHuanHuanVariant(card: HuaLiaoHuanHuan, seed: HuaLiaoHuanHuanVariantSeed): HuaLiaoHuanHuan {
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
    logic_group_key: HUA_LIAO_HUAN_HUAN_LOGIC_GROUP_KEY,
    variant_group_key: HUA_LIAO_HUAN_HUAN_VARIANT_GROUP_KEY,
    variant_group_size: 4,
  };
  card.fullName = `${card.name} ${seed.collectionNumber}#${seed.id}`;
  return card;
}

export class HuaLiaoHuanHuan extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 10437,
      name: '花疗环环',
      yorenCode: 'P764',
      cardType: '1',
      commodityCode: 'CS6bC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '134/131',
        rarityLabel: 'AR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 70,
        evolveText: '基础',
        weakness: '钢 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/243.png',
      ruleLines: [],
      attacks: [
        {
          id: 2436,
          name: '回转攻击',
          text: '',
          cost: ['超', '无色'],
          damage: '30',
        },
      ],
      features: [
        {
          id: 292,
          name: '选花',
          text: '如果这只宝可梦在战斗场上的话，则在自己的回合可以使用1次。查看自己牌库上方2张卡牌，选择其中1张卡牌，加入手牌。将剩余的卡牌放于放逐区。',
        },
      ],
      illustratorNames: ['Teeziro'],
      pokemonCategory: '摘花宝可梦',
      pokedexCode: '764',
      pokedexText: '用藤蔓摘花来打扮自己。不知为何，附在它身上的花不会枯萎。',
      height: 0.1,
      weight: 0.3,
      deckRuleLimit: null,
    },
    collection: {
      id: 206,
      commodityCode: 'CS6bC',
      name: '补充包 碧海暗影 逐',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/243.png',
    logic_group_key: HUA_LIAO_HUAN_HUAN_LOGIC_GROUP_KEY,
    variant_group_key: HUA_LIAO_HUAN_HUAN_VARIANT_GROUP_KEY,
    variant_group_size: 4,
  };

  public stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp = 70;

  public weakness = [{ type: CardType.METAL }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '选花',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '如果这只宝可梦在战斗场上的话，则在自己的回合可以使用1次。查看自己牌库上方2张卡牌，选择其中1张卡牌，加入手牌。将剩余的卡牌放于放逐区。',
    },
  ];

  public attacks = [
    {
      name: '回转攻击',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: '30',
      text: '',
    },
  ];

  public set = 'set_f';

  public name = '花疗环环';

  public fullName = '花疗环环 134/131#10437';

  public readonly SELECT_FLOWER_MARKER = 'SELECT_FLOWER_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);

      if (player.marker.hasMarker(this.SELECT_FLOWER_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      if (pokemonSlot === undefined || pokemonSlot !== player.active) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const topCards = new CardList();
      topCards.cards = player.deck.cards.splice(0, Math.min(2, player.deck.cards.length));

      if (topCards.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_HAND,
          topCards,
          {},
          { min: 1, max: 1, allowCancel: false }
        ),
        selected => {
          const cards = (selected || []) as Card[];
          if (cards.length === 0) {
            return;
          }

          topCards.moveCardsTo(cards, player.hand);
          if (topCards.cards.length > 0) {
            topCards.moveTo(player.lostzone);
          }
          player.marker.addMarker(this.SELECT_FLOWER_MARKER, this);
        }
      );
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.SELECT_FLOWER_MARKER, this);
    }

    return state;
  }
}

export const huaLiaoHuanHuanVariants = [
  seedHuaLiaoHuanHuanVariant(new HuaLiaoHuanHuan(), {
    id: 10437,
    collectionNumber: '134/131',
    rarityLabel: 'AR',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/243.png',
  }),
  seedHuaLiaoHuanHuanVariant(new HuaLiaoHuanHuan(), {
    id: 11185,
    collectionNumber: '003/020',
    rarityLabel: '无标记',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/232/2.png',
  }),
  seedHuaLiaoHuanHuanVariant(new HuaLiaoHuanHuan(), {
    id: 10355,
    collectionNumber: '052/131',
    rarityLabel: 'U',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/96.png',
  }),
  seedHuaLiaoHuanHuanVariant(new HuaLiaoHuanHuan(), {
    id: 10521,
    collectionNumber: '052/131',
    rarityLabel: 'U☆★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/206/97.png',
  }),
];
