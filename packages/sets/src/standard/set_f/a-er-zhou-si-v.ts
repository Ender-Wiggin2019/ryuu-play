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
  PlayerType,
  PokemonCard,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type ArceusVFaceSeed = {
  id: number;
  collectionId: number;
  collectionName: string;
  commodityCode: string;
  collectionNumber: string;
  rarityLabel: string;
};

const arceusVFaceSeeds: ArceusVFaceSeed[] = [
  {
    id: 9890,
    collectionId: 183,
    collectionName: '补充包 勇魅群星 魅',
    commodityCode: 'CS5aC',
    collectionNumber: '106/127',
    rarityLabel: 'RR',
  },
  {
    id: 9928,
    collectionId: 183,
    collectionName: '补充包 勇魅群星 魅',
    commodityCode: 'CS5aC',
    collectionNumber: '144/127',
    rarityLabel: 'SR',
  },
  {
    id: 9929,
    collectionId: 183,
    collectionName: '补充包 勇魅群星 魅',
    commodityCode: 'CS5aC',
    collectionNumber: '145/127',
    rarityLabel: 'SR',
  },
  {
    id: 9166,
    collectionId: 180,
    collectionName: '勇魅群星 卡组构筑礼盒',
    commodityCode: 'CSNC',
    collectionNumber: '009/024',
    rarityLabel: '无标记',
  },
];

const defaultFace = arceusVFaceSeeds[0];

function createArceusVRawData(seed: ArceusVFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '阿尔宙斯V',
      yorenCode: 'Y932',
      cardType: '1',
      commodityCode: seed.commodityCode,
      details: {
        regulationMarkText: 'F',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        pokemonTypeLabel: '宝可梦V',
        specialCardLabel: null,
        hp: 220,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: getCardImageUrl(seed.id),
      ruleLines: ['当宝可梦V【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 3058,
          name: '三重蓄能',
          text: '选择自己牌库中最多3张基本能量，以任意方式附着于自己的「宝可梦V」身上。并重洗牌库。',
          cost: ['无色', '无色'],
          damage: null,
        },
        {
          id: 3059,
          name: '力量利刃',
          text: '',
          cost: ['无色', '无色', '无色'],
          damage: '130',
        },
      ],
      features: [],
      illustratorNames: ['N-DESIGN Inc.'],
    },
    collection: {
      id: seed.collectionId,
      commodityCode: seed.commodityCode,
      name: seed.collectionName,
    },
    image_url: getR2CardImageUrl(seed.id),
  };
}

function isPokemonV(card: PokemonCard | undefined): boolean {
  return card !== undefined
    && (card.tags.includes(CardTag.POKEMON_V) || card.tags.includes(CardTag.POKEMON_VSTAR));
}

export class AErZhouSiV extends PokemonCard {
  public rawData: any;

  public tags = [CardTag.POKEMON_V];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp = 220;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance: { type: CardType; value: number }[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '三重蓄能',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '',
      text: '选择自己牌库中最多3张基本能量，以任意方式附着于自己的「宝可梦V」身上。并重洗牌库。',
    },
    {
      name: '力量利刃',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '130',
      text: '',
    },
  ];

  public set = 'set_f';

  public name = '阿尔宙斯V';

  public fullName = '';

  constructor(seed: ArceusVFaceSeed = defaultFace) {
    super();
    this.rawData = createArceusVRawData(seed);
    this.fullName = `阿尔宙斯V ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const playerType = state.players[0] === player ? PlayerType.BOTTOM_PLAYER : PlayerType.TOP_PLAYER;
      const basicEnergyCount = player.deck.cards.filter(card =>
        card instanceof EnergyCard && card.energyType === EnergyType.BASIC
      ).length;

      if (basicEnergyCount === 0) {
        return state;
      }

      const blockedTo: CardTarget[] = [];
      if (!isPokemonV(player.active.getPokemonCard())) {
        blockedTo.push({ player: playerType, slot: SlotType.ACTIVE, index: 0 });
      }

      player.bench.forEach((bench, index) => {
        if (!isPokemonV(bench.getPokemonCard())) {
          blockedTo.push({ player: playerType, slot: SlotType.BENCH, index });
        }
      });

      const hasTarget = blockedTo.length < 6;
      if (!hasTarget) {
        return state;
      }

      return store.prompt(
        state,
        new AttachEnergyPrompt(
          player.id,
          GameMessage.ATTACH_ENERGY_TO_ACTIVE,
          player.deck,
          playerType,
          [SlotType.ACTIVE, SlotType.BENCH],
          { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
          { allowCancel: true, min: 0, max: Math.min(3, basicEnergyCount), blockedTo }
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

    return state;
  }
}

export function createAErZhouSiVVariants(): AErZhouSiV[] {
  return arceusVFaceSeeds.map(seed => new AErZhouSiV(seed));
}

