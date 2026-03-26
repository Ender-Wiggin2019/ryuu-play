import {
  CardType,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PokemonCard,
  PowerEffect,
  PowerType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

type DaWeiLiDiggingMawFaceSeed = {
  id: number;
  collectionId: number;
  collectionName: string;
  commodityCode: string;
  collectionNumber: string;
  rarityLabel: string;
};

const DIGGING_MAW_LOGIC_GROUP_KEY = 'pokemon:da-wei-li:p400:diligent-incisors';
const DIGGING_MAW_VARIANT_GROUP_KEY = 'pokemon:da-wei-li:p400:diligent-incisors:f';
const DIGGING_MAW_VARIANT_GROUP_SIZE = 7;

const defaultDiggingMawSeed: DaWeiLiDiggingMawFaceSeed = {
  id: 9914,
  collectionId: 183,
  collectionName: '补充包 勇魅群星 魅',
  commodityCode: 'CS5aC',
  collectionNumber: '130/127',
  rarityLabel: 'AR',
};

export function createDaWeiLiDiggingMawRawData(seed: DaWeiLiDiggingMawFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '大尾狸',
      yorenCode: 'P400',
      cardType: '1',
      commodityCode: seed.commodityCode,
      details: {
        regulationMarkText: 'F',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        specialCardLabel: null,
        hp: 120,
        evolveText: '1阶进化',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: `/api/v1/cards/${seed.id}/image`,
      ruleLines: [],
      attacks: [
        {
          id: 14646,
          name: '长尾粉碎',
          text: '抛掷1次硬币如果为反面，则这个招式失败。',
          cost: ['COLORLESS', 'COLORLESS', 'COLORLESS'],
          damage: '100',
        },
      ],
      features: [
        {
          id: 1923,
          name: '勤奋门牙',
          text: '在自己的回合可以使用1次。从牌库上方抽取卡牌，直到自己的手牌变为5张为止。',
        },
      ],
    },
    collection: {
      id: seed.collectionId,
      commodityCode: seed.commodityCode,
      name: seed.collectionName,
    },
    image_url: `http://localhost:3000/api/v1/cards/${seed.id}/image`,
    logic_group_key: DIGGING_MAW_LOGIC_GROUP_KEY,
    variant_group_key: DIGGING_MAW_VARIANT_GROUP_KEY,
    variant_group_size: DIGGING_MAW_VARIANT_GROUP_SIZE,
  };
}

export class DaWeiLi extends PokemonCard {
  public rawData = createDaWeiLiDiggingMawRawData(defaultDiggingMawSeed);

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '大牙狸';

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 120;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: '勤奋门牙',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合可以使用1次。从牌库上方抽取卡牌，直到自己的手牌变为5张为止。',
    },
  ];

  public attacks = [
    {
      name: '长尾粉碎',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '100',
      text: '抛掷1次硬币如果为反面，则这个招式失败。',
    },
  ];

  public set: string = 'set_f';

  public name: string = '大尾狸';

  public fullName: string = `大尾狸 ${defaultDiggingMawSeed.collectionNumber}#${defaultDiggingMawSeed.id}`;

  public readonly DIGGING_MAW_MARKER = 'DIGGING_MAW_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);

      if (pokemonSlot === undefined || !pokemonSlot.pokemons.cards.includes(this)) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.marker.hasMarker(this.DIGGING_MAW_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      const drawCount = Math.max(0, 5 - player.hand.cards.length);
      if (drawCount > 0) {
        player.deck.moveTo(player.hand, Math.min(drawCount, player.deck.cards.length));
      }
      player.marker.addMarker(this.DIGGING_MAW_MARKER, this);
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.DIGGING_MAW_MARKER, this);
      return state;
    }

    return state;
  }
}
