import {
  AbstractAttackEffect,
  AttackEffect,
  CardType,
  CoinFlipPrompt,
  Effect,
  EndTurnEffect,
  GameMessage,
  PlayerType,
  PokemonCard,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type TuLongDiDiVariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  imageUrl: string;
};

const TU_LONG_DI_DI_LOGIC_GROUP_KEY = 'pokemon:土龙弟弟:P206:F:hp60:挖洞30:burrow';
const TU_LONG_DI_DI_VARIANT_GROUP_KEY = 'pokemon:土龙弟弟:P206:F:hp60:挖洞30:burrow';

function seedTuLongDiDiVariant(card: TuLongDiDi, seed: TuLongDiDiVariantSeed): TuLongDiDi {
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
    logic_group_key: TU_LONG_DI_DI_LOGIC_GROUP_KEY,
    variant_group_key: TU_LONG_DI_DI_VARIANT_GROUP_KEY,
    variant_group_size: 3,
  };
  card.fullName = `${card.name} ${seed.collectionNumber}#${seed.id}`;
  return card;
}

export class TuLongDiDi extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16327,
      name: '土龙弟弟',
      yorenCode: 'P206',
      cardType: '1',
      commodityCode: 'CSV7C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '161/204',
        rarityLabel: 'C',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 60,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 0,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/438.png',
      ruleLines: [],
      attacks: [
        {
          id: 708,
          name: '啃咬',
          text: '',
          cost: ['无色'],
          damage: '10',
        },
        {
          id: 709,
          name: '挖洞',
          text: '抛掷1次硬币如果为正面，则在下一个对手的回合，这只宝可梦不受到招式的伤害和效果影响。',
          cost: ['无色', '无色'],
          damage: '30',
        },
      ],
      features: [],
      illustratorNames: ['Sanosuke Sakuma'],
      pokemonCategory: '地蛇宝可梦',
      pokedexCode: '0206',
      pokedexText: '在阴暗的地方制造迷宫。一旦被发现，就用尾巴挖掘地面逃之夭夭。',
      height: 1.5,
      weight: 14,
      deckRuleLimit: null,
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/438.png',
    logic_group_key: TU_LONG_DI_DI_LOGIC_GROUP_KEY,
    variant_group_key: TU_LONG_DI_DI_VARIANT_GROUP_KEY,
    variant_group_size: 3,
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 60;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [];

  public attacks = [
    {
      name: '啃咬',
      cost: [CardType.COLORLESS],
      damage: '10',
      text: '',
    },
    {
      name: '挖洞',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '30',
      text: '抛掷1次硬币如果为正面，则在下一个对手的回合，这只宝可梦不受到招式的伤害和效果影响。',
    },
  ];

  public set = 'set_h';

  public name = '土龙弟弟';

  public fullName = '土龙弟弟 161/204#16327';

  public readonly BURROW_MARKER = 'BURROW_MARKER';
  public readonly CLEAR_BURROW_MARKER = 'CLEAR_BURROW_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      return store.prompt(state, new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP), flipResult => {
        if (flipResult) {
          player.active.marker.addMarker(this.BURROW_MARKER, this);
          opponent.marker.addMarker(this.CLEAR_BURROW_MARKER, this);
        }
      });
    }

    if (effect instanceof AbstractAttackEffect && effect.target.marker.hasMarker(this.BURROW_MARKER, this)) {
      effect.preventDefault = true;
      return state;
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_BURROW_MARKER, this)) {
      effect.player.marker.removeMarker(this.CLEAR_BURROW_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      const playerType = effect.player === state.players[0] ? PlayerType.TOP_PLAYER : PlayerType.BOTTOM_PLAYER;
      opponent.forEachPokemon(playerType, pokemonSlot => {
        pokemonSlot.marker.removeMarker(this.BURROW_MARKER, this);
      });
    }

    return state;
  }
}

export const tuLongDiDiVariants = [
  seedTuLongDiDiVariant(new TuLongDiDi(), {
    id: 16327,
    collectionNumber: '161/204',
    rarityLabel: 'C',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/438.png',
  }),
  seedTuLongDiDiVariant(new TuLongDiDi(), {
    id: 16565,
    collectionNumber: '161/204',
    rarityLabel: 'C☆★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/439.png',
  }),
  seedTuLongDiDiVariant(new TuLongDiDi(), {
    id: 16738,
    collectionNumber: '161/204',
    rarityLabel: 'C★★★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/440.png',
  }),
];
