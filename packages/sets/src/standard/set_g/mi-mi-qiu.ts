import {
  AttackEffect,
  CardTag,
  CardType,
  DealDamageEffect,
  Effect,
  PokemonCard,
  PutDamageEffect,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type MimikyuFaceSeed = {
  id: number;
  collectionId: number;
  collectionName: string;
  commodityCode: string;
  collectionNumber: string;
  rarityLabel: string;
};

const mimikyuFaceSeeds: MimikyuFaceSeed[] = [
  { id: 13225, collectionId: 270, collectionName: '补充包 无畏太晶', commodityCode: 'CSV3C', collectionNumber: '062/130', rarityLabel: 'R' },
  { id: 13382, collectionId: 270, collectionName: '补充包 无畏太晶', commodityCode: 'CSV3C', collectionNumber: '062/130', rarityLabel: 'R☆★' },
  { id: 13498, collectionId: 270, collectionName: '补充包 无畏太晶', commodityCode: 'CSV3C', collectionNumber: '062/130', rarityLabel: 'R★★★' },
  { id: 14169, collectionId: 308, collectionName: '对战派对 耀梦 下', commodityCode: 'CSVE2C2', collectionNumber: '068/207', rarityLabel: '无标记' },
  { id: 15393, collectionId: 302, collectionName: '宝石包 VOL.3', commodityCode: 'CBB3C', collectionNumber: '13 01/07', rarityLabel: '●' },
  { id: 15394, collectionId: 302, collectionName: '宝石包 VOL.3', commodityCode: 'CBB3C', collectionNumber: '13 02/07', rarityLabel: '●' },
  { id: 15395, collectionId: 302, collectionName: '宝石包 VOL.3', commodityCode: 'CBB3C', collectionNumber: '13 03/07', rarityLabel: '◆' },
  { id: 15396, collectionId: 302, collectionName: '宝石包 VOL.3', commodityCode: 'CBB3C', collectionNumber: '13 04/07', rarityLabel: '◆' },
  { id: 15397, collectionId: 302, collectionName: '宝石包 VOL.3', commodityCode: 'CBB3C', collectionNumber: '13 05/07', rarityLabel: '★' },
  { id: 15398, collectionId: 302, collectionName: '宝石包 VOL.3', commodityCode: 'CBB3C', collectionNumber: '13 06/07', rarityLabel: '★★' },
  { id: 15399, collectionId: 302, collectionName: '宝石包 VOL.3', commodityCode: 'CBB3C', collectionNumber: '13 07/07', rarityLabel: '★★★' },
  { id: 16027, collectionId: 314, collectionName: '游历专题包', commodityCode: 'CSVL2C', collectionNumber: '034/052', rarityLabel: '无标记' },
  { id: 16070, collectionId: 314, collectionName: '游历专题包', commodityCode: 'CSVL2C', collectionNumber: '077/052', rarityLabel: '无标记' },
  { id: 16907, collectionId: 329, collectionName: '大师战略卡组构筑套装 沙奈朵ex', commodityCode: 'CSVM1bC', collectionNumber: '010/033', rarityLabel: '无标记' },
];

const defaultFace = mimikyuFaceSeeds[0];

function createMimikyuRawData(seed: MimikyuFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '谜拟丘',
      yorenCode: 'P778',
      cardType: '1',
      commodityCode: seed.commodityCode,
      details: {
        regulationMarkText: 'G',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '超',
        specialCardLabel: null,
        hp: 70,
        evolveText: '基础',
        weakness: '钢 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: getCardImageUrl(seed.id),
      ruleLines: [],
      attacks: [
        {
          id: 435,
          name: '幽灵之眼',
          text: '给对手的战斗宝可梦身上，放置7个伤害指示物。',
          cost: ['超', '无色'],
          damage: null,
        },
      ],
      features: [
        {
          id: 72,
          name: '神秘守护',
          text: '这只宝可梦，不受到对手「宝可梦【ex】・【V】」的招式的伤害。',
        },
      ],
      illustratorNames: ['Kagemaru Himeno'],
    },
    collection: {
      id: seed.collectionId,
      commodityCode: seed.commodityCode,
      name: seed.collectionName,
    },
    image_url: getR2CardImageUrl(seed.id),
  };
}

function hasExOrVTag(card: PokemonCard | undefined): boolean {
  return card !== undefined && (
    card.tags.includes(CardTag.POKEMON_EX)
    || card.tags.includes(CardTag.POKEMON_V)
    || card.tags.includes(CardTag.POKEMON_VSTAR)
  );
}

export class MiMiQiu extends PokemonCard {
  public rawData: any;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp = 70;

  public weakness = [{ type: CardType.METAL }];

  public resistance: { type: CardType; value: number }[] = [];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '神秘守护',
      powerType: 0 as any,
      text: '这只宝可梦，不受到对手「宝可梦【ex】・【V】」的招式的伤害。',
    },
  ];

  public attacks = [
    {
      name: '幽灵之眼',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: '',
      text: '给对手的战斗宝可梦身上，放置7个伤害指示物。',
    },
  ];

  public set = 'set_g';

  public name = '谜拟丘';

  public fullName = '';

  constructor(seed: MimikyuFaceSeed = defaultFace) {
    super();
    this.rawData = createMimikyuRawData(seed);
    this.fullName = `谜拟丘 ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof DealDamageEffect) {
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);
      if (pokemonSlot === undefined) {
        return state;
      }

      const owner = StateUtils.findOwner(state, pokemonSlot);
      if (effect.player === owner || effect.target !== pokemonSlot) {
        return state;
      }

      if (!hasExOrVTag(effect.source.getPokemonCard())) {
        return state;
      }

      effect.preventDefault = true;
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const putDamage = new PutDamageEffect(effect, 70);
      putDamage.target = effect.opponent.active;
      return store.reduceEffect(state, putDamage);
    }

    return state;
  }
}

export function createMiMiQiuVariants(): MiMiQiu[] {
  return mimikyuFaceSeeds.map(seed => new MiMiQiu(seed));
}

