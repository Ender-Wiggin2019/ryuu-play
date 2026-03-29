import {
  AddSpecialConditionsEffect,
  AttackEffect,
  CardTarget,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  Effect,
  EnergyCard,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  PutDamageEffect,
  SlotType,
  SpecialCondition,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type DelphoxVFaceSeed = {
  id: number;
  collectionId: number;
  collectionName: string;
  commodityCode: string;
  collectionNumber: string;
  rarityLabel: string;
};

const delphoxVFaceSeeds: DelphoxVFaceSeed[] = [
  {
    id: 10946,
    collectionId: 222,
    collectionName: '强化包 胜象星引',
    commodityCode: 'CS6.5C',
    collectionNumber: '012/072',
    rarityLabel: 'RR',
  },
  {
    id: 11009,
    collectionId: 222,
    collectionName: '强化包 胜象星引',
    commodityCode: 'CS6.5C',
    collectionNumber: '075/072',
    rarityLabel: 'SR',
  },
];

const defaultFace = delphoxVFaceSeeds[0];

function createDelphoxVRawData(seed: DelphoxVFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '妖火红狐V',
      yorenCode: 'Y1157',
      cardType: '1',
      commodityCode: seed.commodityCode,
      details: {
        regulationMarkText: 'F',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        pokemonTypeLabel: '宝可梦V',
        specialCardLabel: null,
        hp: 210,
        evolveText: '基础',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: getCardImageUrl(seed.id),
      ruleLines: ['当宝可梦V【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 2478,
          name: '奇异灯火',
          text: '使对手的战斗宝可梦陷入【灼伤】和【混乱】状态。',
          cost: ['火'],
          damage: null,
        },
        {
          id: 2479,
          name: '魔法烈火',
          text: '将附着于这只宝可梦身上的2个能量，放于放逐区，给对手的1只备战宝可梦，也造成120点伤害。[备战宝可梦不计算弱点、抗性。]',
          cost: ['火', '火', '无色'],
          damage: '120',
        },
      ],
      features: [],
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

export class YaoHuoHongHuV extends PokemonCard {
  public rawData: any;

  public tags = [CardTag.POKEMON_V];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp = 210;

  public weakness = [{ type: CardType.WATER }];

  public resistance: { type: CardType; value: number }[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '奇异灯火',
      cost: [CardType.FIRE],
      damage: '',
      text: '使对手的战斗宝可梦陷入【灼伤】和【混乱】状态。',
    },
    {
      name: '魔法烈火',
      cost: [CardType.FIRE, CardType.FIRE, CardType.COLORLESS],
      damage: '120',
      text: '将附着于这只宝可梦身上的2个能量，放于放逐区，给对手的1只备战宝可梦，也造成120点伤害。[备战宝可梦不计算弱点、抗性。]',
    },
  ];

  public set = 'set_f';

  public name = '妖火红狐V';

  public fullName = '';

  constructor(seed: DelphoxVFaceSeed = defaultFace) {
    super();
    this.rawData = createDelphoxVRawData(seed);
    this.fullName = `妖火红狐V ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const status = new AddSpecialConditionsEffect(effect, [SpecialCondition.BURNED, SpecialCondition.CONFUSED]);
      status.target = effect.opponent.active;
      return store.reduceEffect(state, status);
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const attached = player.active.energies.cards.filter(card => card instanceof EnergyCard);

      if (attached.length < 2) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_DISCARD,
          player.active.energies,
          { superType: SuperType.ENERGY },
          { min: 2, max: 2, allowCancel: false }
        ),
        selected => {
          const cards = (selected || []) as EnergyCard[];
          cards.forEach(card => {
            const source = StateUtils.findCardList(state, card);
            source.moveCardTo(card, player.lostzone);
          });

          const blocked = effect.opponent.bench
            .map((slot, index) => slot.getPokemonCard() === undefined
              ? { player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index }
              : null)
            .filter((value): value is CardTarget => value !== null);

          if (blocked.length === effect.opponent.bench.length) {
            return;
          }

          store.prompt(
            state,
            new ChoosePokemonPrompt(
              player.id,
              GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
              PlayerType.TOP_PLAYER,
              [SlotType.BENCH],
              { allowCancel: false, blocked }
            ),
            result => {
              const target = result?.[0];
              if (target !== undefined) {
                const snipe = new PutDamageEffect(effect, 120);
                snipe.target = target;
                store.reduceEffect(state, snipe);
              }
            }
          );
        }
      );
    }

    return state;
  }
}

export function createYaoHuoHongHuVVariants(): YaoHuoHongHuV[] {
  return delphoxVFaceSeeds.map(seed => new YaoHuoHongHuV(seed));
}
