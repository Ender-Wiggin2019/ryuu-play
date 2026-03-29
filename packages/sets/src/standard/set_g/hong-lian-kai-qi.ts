import {
  AddSpecialConditionsEffect,
  AttackEffect,
  CardList,
  CardType,
  ChooseCardsPrompt,
  Effect,
  EnergyCard,
  GameError,
  GameMessage,
  PokemonCard,
  PowerEffect,
  PowerType,
  SpecialCondition,
  Stage,
  State,
  StoreLike,
  SuperType,
} from '@ptcg/common';

import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type HongLianKaiQiFaceSeed = {
  id: number;
  collectionId: number;
  collectionName: string;
  commodityCode: string;
  collectionNumber: string;
  rarityLabel: string;
};

const HONG_LIAN_KAI_QI_LOGIC_GROUP_KEY = 'pokemon:红莲铠骑:P0936:G:hp130:送火+火焰加农炮90+灼伤';

const hongLianKaiQiFaceSeeds: HongLianKaiQiFaceSeed[] = [
  { id: 11855, collectionId: 244, collectionName: '补充包 亘古开来', commodityCode: 'CSV1C', collectionNumber: '028/127', rarityLabel: 'R' },
  { id: 16058, collectionId: 314, collectionName: '游历专题包', commodityCode: 'CSVL2C', collectionNumber: '065/052', rarityLabel: '无标记' },
  { id: 14065, collectionId: 277, collectionName: '宝可梦金属卡组收纳盒套装', commodityCode: 'PROMOSV04', collectionNumber: '023/SV-P', rarityLabel: '无标记' },
  { id: 16010, collectionId: 314, collectionName: '游历专题包', commodityCode: 'CSVL2C', collectionNumber: '017/052', rarityLabel: '无标记' },
  { id: 15470, collectionId: 307, collectionName: '对战派对 耀梦 下 奖赏包', commodityCode: 'CSVE2pC2', collectionNumber: '015/024', rarityLabel: '无标记' },
  { id: 12132, collectionId: 244, collectionName: '补充包 亘古开来', commodityCode: 'CSV1C', collectionNumber: '028/127', rarityLabel: 'R★★★' },
  { id: 12019, collectionId: 244, collectionName: '补充包 亘古开来', commodityCode: 'CSV1C', collectionNumber: '028/127', rarityLabel: 'R☆★' },
];

const defaultFace = hongLianKaiQiFaceSeeds[0];

function createHongLianKaiQiRawData(seed: HongLianKaiQiFaceSeed) {
  return {
    raw_card: {
      id: seed.id,
      name: '红莲铠骑',
      yorenCode: 'P0936',
      cardType: '1',
      commodityCode: seed.commodityCode,
      details: {
        regulationMarkText: 'G',
        collectionNumber: seed.collectionNumber,
        rarityLabel: seed.rarityLabel,
        cardTypeLabel: '宝可梦',
        attributeLabel: '火',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 130,
        evolveText: '1阶进化',
        weakness: '水 ×2',
        resistance: null,
        retreatCost: 2,
      },
      image: getCardImageUrl(seed.id),
      ruleLines: [],
      attacks: [
        {
          id: 775,
          name: '火焰加农炮',
          text: '令对手的战斗宝可梦陷入【灼伤】状态。',
          cost: ['火', '火', '无色'],
          damage: '90',
        },
      ],
      features: [
        {
          id: 105,
          name: '送火',
          text: '在自己的回合可以使用任意次。选择自己备战宝可梦身上附着的1个【火】能量，转附于战斗宝可梦身上。',
        },
      ],
      illustratorNames: ['AKIRA EGAWA'],
      pokemonCategory: '火战士宝可梦',
      pokedexCode: '0936',
      pokedexText: '借助立下诸多功勋的战士所穿的铠甲进化而来的样子。是忠心耿耿的宝可梦。',
      height: 1.5,
      weight: 85,
      deckRuleLimit: null,
    },
    collection: {
      id: seed.collectionId,
      commodityCode: seed.commodityCode,
      name: seed.collectionName,
    },
    image_url: getR2CardImageUrl(seed.id),
    logic_group_key: HONG_LIAN_KAI_QI_LOGIC_GROUP_KEY,
    variant_group_key: HONG_LIAN_KAI_QI_LOGIC_GROUP_KEY,
    variant_group_size: hongLianKaiQiFaceSeeds.length,
  };
}

export class HongLianKaiQiG extends PokemonCard {
  public rawData: any;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '炭小侍';

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 130;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: '送火',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合可以使用任意次。选择自己备战宝可梦身上附着的1个【火】能量，转附于战斗宝可梦身上。',
    },
  ];

  public attacks = [
    {
      name: '火焰加农炮',
      cost: [CardType.FIRE, CardType.FIRE, CardType.COLORLESS],
      damage: '90',
      text: '令对手的战斗宝可梦陷入【灼伤】状态。',
    },
  ];

  public set: string = 'set_g';

  public name: string = '红莲铠骑';

  public fullName: string = '';

  constructor(seed: HongLianKaiQiFaceSeed = defaultFace) {
    super();
    this.rawData = createHongLianKaiQiRawData(seed);
    this.fullName = `红莲铠骑 ${seed.commodityCode} ${seed.collectionNumber}#${seed.id}`;
  }

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const benchFireEnergies = new CardList();

      for (const slot of player.bench) {
        for (const card of slot.energies.cards) {
          if (card instanceof EnergyCard && card.provides.includes(CardType.FIRE)) {
            benchFireEnergies.cards.push(card);
          }
        }
      }

      if (benchFireEnergies.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_ATTACH,
          benchFireEnergies,
          { superType: SuperType.ENERGY },
          { min: 1, max: 1, allowCancel: false }
        ),
        cards => {
          const selected = (cards || []).filter((card): card is EnergyCard => card instanceof EnergyCard && card.provides.includes(CardType.FIRE));
          if (selected.length === 0) {
            return;
          }

          const energy = selected[0];
          const sourceSlot = player.bench.find(slot => slot.energies.cards.includes(energy));
          if (sourceSlot === undefined) {
            return;
          }

          sourceSlot.energies.moveCardsTo([energy], player.active.energies);
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 90;
      const burned = new AddSpecialConditionsEffect(effect, [SpecialCondition.BURNED]);
      return store.reduceEffect(state, burned);
    }

    return state;
  }
}

export const hongLianKaiQiVariants = hongLianKaiQiFaceSeeds.map(seed => new HongLianKaiQiG(seed));
