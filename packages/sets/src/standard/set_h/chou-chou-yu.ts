import {
  AttackEffect,
  CardType,
  ChoosePokemonPrompt,
  Effect,
  GameMessage,
  PlayerType,
  PokemonCard,
  SlotType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type FeebasFaceSeed = {
  id: number;
  collectionId: number;
  collectionName: string;
  commodityCode: string;
  collectionNumber: string;
  rarityLabel: string;
};

const feebasFaceSeeds: FeebasFaceSeed[] = [
  { id: 17433, collectionId: 458, collectionName: '补充包 璀璨诡幻', commodityCode: 'CSV8C', collectionNumber: '056/207', rarityLabel: 'C' },
  { id: 17692, collectionId: 458, collectionName: '补充包 璀璨诡幻', commodityCode: 'CSV8C', collectionNumber: '056/207', rarityLabel: 'C★' },
  { id: 17868, collectionId: 458, collectionName: '补充包 璀璨诡幻', commodityCode: 'CSV8C', collectionNumber: '056/207', rarityLabel: 'C★★' },
  { id: 17586, collectionId: 458, collectionName: '补充包 璀璨诡幻', commodityCode: 'CSV8C', collectionNumber: '209/207', rarityLabel: 'AR' },
];

const defaultFace = feebasFaceSeeds[0];

function createFeebasRawData(seed: FeebasFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '丑丑鱼',
      yorenCode: 'P349',
      cardType: '1',
      commodityCode: seed.commodityCode,
      details: {
        regulationMarkText: 'H',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '水',
        specialCardLabel: null,
        hp: 30,
        evolveText: '基础',
        weakness: '雷 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: getCardImageUrl(seed.id),
      ruleLines: [],
      attacks: [
        {
          id: 91,
          name: '跃起逃脱',
          text: '将这只宝可梦与备战宝可梦互换。',
          cost: ['无色'],
          damage: null,
        },
      ],
      features: [],
      illustratorNames: ['Kedamahadaitai Yawarakai'],
    },
    collection: {
      id: seed.collectionId,
      commodityCode: seed.commodityCode,
      name: seed.collectionName,
    },
    image_url: getR2CardImageUrl(seed.id),
  };
}

export class ChouChouYu extends PokemonCard {
  public rawData: any;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp = 30;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance: { type: CardType; value: number }[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '跃起逃脱',
      cost: [CardType.COLORLESS],
      damage: '',
      text: '将这只宝可梦与备战宝可梦互换。',
    },
  ];

  public set = 'set_h';

  public name = '丑丑鱼';

  public fullName = '';

  constructor(seed: FeebasFaceSeed = defaultFace) {
    super();
    this.rawData = createFeebasRawData(seed);
    this.fullName = `丑丑鱼 ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const blocked = player.bench
        .map((slot, index) => slot.getPokemonCard() === undefined
          ? { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index }
          : null)
        .filter((value): value is { player: PlayerType; slot: SlotType.BENCH; index: number } => value !== null);

      if (blocked.length === player.bench.length) {
        return state;
      }

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_NEW_ACTIVE_POKEMON,
          PlayerType.BOTTOM_PLAYER,
          [SlotType.BENCH],
          { allowCancel: false, blocked }
        ),
        selected => {
          const target = selected?.[0];
          if (target !== undefined) {
            player.switchPokemon(target);
          }
        }
      );
    }

    return state;
  }
}

export function createChouChouYuVariants(): ChouChouYu[] {
  return feebasFaceSeeds.map(seed => new ChouChouYu(seed));
}
