import {
  AttachEnergyPrompt,
  AttackEffect,
  CardTag,
  CardTarget,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  EnergyType,
  GameError,
  GameMessage,
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
  ShuffleDeckPrompt,
} from '@ptcg/common';

import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type ArceusVStarFaceSeed = {
  id: number;
  collectionId: number;
  collectionName: string;
  commodityCode: string;
  collectionNumber: string;
  rarityLabel: string;
};

const arceusVStarFaceSeeds: ArceusVStarFaceSeed[] = [
  {
    id: 9891,
    collectionId: 183,
    collectionName: '补充包 勇魅群星 魅',
    commodityCode: 'CS5aC',
    collectionNumber: '107/127',
    rarityLabel: 'RRR',
  },
  {
    id: 9956,
    collectionId: 183,
    collectionName: '补充包 勇魅群星 魅',
    commodityCode: 'CS5aC',
    collectionNumber: '172/127',
    rarityLabel: 'UR',
  },
  {
    id: 9948,
    collectionId: 183,
    collectionName: '补充包 勇魅群星 魅',
    commodityCode: 'CS5aC',
    collectionNumber: '164/127',
    rarityLabel: 'HR',
  },
  {
    id: 11111,
    collectionId: 224,
    collectionName: '收藏周边礼盒 百变宝盒',
    commodityCode: 'CSZC',
    collectionNumber: '024/066',
    rarityLabel: '无标记',
  },
  {
    id: 10886,
    collectionId: 210,
    collectionName: '专题包 辉耀能量 第三弹',
    commodityCode: 'CS6.1C',
    collectionNumber: '024/004',
    rarityLabel: '无标记',
  },
];

const defaultFace = arceusVStarFaceSeeds[0];

function createArceusVStarRawData(seed: ArceusVStarFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '阿尔宙斯VSTAR',
      yorenCode: 'Y1022',
      cardType: '1',
      commodityCode: seed.commodityCode,
      details: {
        regulationMarkText: 'F',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        pokemonTypeLabel: '宝可梦VSTAR',
        specialCardLabel: null,
        hp: 280,
        evolveText: 'V进化',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: getCardImageUrl(seed.id),
      ruleLines: ['当宝可梦VSTAR【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 2460,
          name: '三重新星',
          text: '选择自己牌库中最多3张基本能量，以任意方式附着于自己的「宝可梦V」身上。并重洗牌库。',
          cost: ['无色', '无色', '无色'],
          damage: '200',
        },
      ],
      features: [
        {
          id: 2461,
          name: '创世之星',
          text: '在自己的回合可以使用1次。选择自己牌库中的最多2张卡牌，加入手牌。并重洗牌库。',
        },
      ],
      illustratorNames: ['5ban Graphics'],
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

export class AErZhouSiVSTAR extends PokemonCard {
  public rawData: any;

  public tags = [CardTag.POKEMON_VSTAR];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '阿尔宙斯V';

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp = 280;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance: { type: CardType; value: number }[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: '创世之星',
      useWhenInPlay: true,
      useVSTARPower: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合可以使用1次。选择自己牌库中的最多2张卡牌，加入手牌。并重洗牌库。',
    },
  ];

  public attacks = [
    {
      name: '三重新星',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '200',
      text: '选择自己牌库中最多3张基本能量，以任意方式附着于自己的「宝可梦V」身上。并重洗牌库。',
    },
  ];

  public set = 'set_f';

  public name = '阿尔宙斯VSTAR';

  public fullName = '';

  constructor(seed: ArceusVStarFaceSeed = defaultFace) {
    super();
    this.rawData = createArceusVStarRawData(seed);
    this.fullName = `阿尔宙斯VSTAR ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_HAND,
          player.deck,
          {},
          { min: 0, max: Math.min(2, player.deck.cards.length), allowCancel: false }
        ),
        selected => {
          const cards = selected || [];
          player.deck.moveCardsTo(cards, player.hand);
          store.prompt(state, new ShuffleDeckPrompt(player.id), order => {
            player.deck.applyOrder(order);
          });
        }
      );
    }

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

export function createAErZhouSiVStarVariants(): AErZhouSiVSTAR[] {
  return arceusVStarFaceSeeds.map(seed => new AErZhouSiVSTAR(seed));
}
