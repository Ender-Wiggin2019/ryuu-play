import {
  AttackEffect,
  CardTag,
  CardType,
  ChoosePokemonPrompt,
  DealDamageEffect,
  Effect,
  GameMessage,
  PlayerType,
  PokemonCard,
  PutDamageEffect,
  SlotType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type JiaHeRenWaExVariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  imageUrl: string;
};

const JIA_HE_REN_WA_EX_LOGIC_GROUP_KEY = 'pokemon:甲贺忍蛙ex:Y1247:G:hp300:隐秘手里剑40:spread';
const JIA_HE_REN_WA_EX_VARIANT_GROUP_KEY = 'pokemon:甲贺忍蛙ex:Y1247:G:hp300:隐秘手里剑40:spread';

function seedJiaHeRenWaExVariant(card: JiaHeRenWaEx, seed: JiaHeRenWaExVariantSeed): JiaHeRenWaEx {
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
    logic_group_key: JIA_HE_REN_WA_EX_LOGIC_GROUP_KEY,
    variant_group_key: JIA_HE_REN_WA_EX_VARIANT_GROUP_KEY,
    variant_group_size: 5,
  };
  card.fullName = `${card.name} ${seed.collectionNumber}#${seed.id}`;
  return card;
}

export class JiaHeRenWaEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 12688,
      name: '甲贺忍蛙ex',
      yorenCode: 'Y1247',
      cardType: '1',
      commodityCode: 'CSV2C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '030/128',
        rarityLabel: 'RR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '水',
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: null,
        hp: 300,
        evolveText: '2阶进化',
        weakness: '雷 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/253/83.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 778,
          name: '隐秘手里剑',
          text: '给对手的1只宝可梦，造成40伤害。[备战宝可梦不计算弱点、抗性。]',
          cost: ['无色'],
          damage: '',
        },
        {
          id: 779,
          name: '激流斩',
          text: '如果对手的战斗宝可梦身上放置有伤害指示物的话，则追加造成120伤害。',
          cost: ['水', '水'],
          damage: '120+',
        },
      ],
      features: [],
      illustratorNames: ['takuyoa'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 253,
      commodityCode: 'CSV2C',
      name: '补充包 奇迹启程',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/253/83.png',
    logic_group_key: JIA_HE_REN_WA_EX_LOGIC_GROUP_KEY,
    variant_group_key: JIA_HE_REN_WA_EX_VARIANT_GROUP_KEY,
    variant_group_size: 5,
  };

  public tags = [CardTag.POKEMON_EX];

  public stage = Stage.STAGE_2;

  public evolvesFrom = '呱呱泡蛙';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp = 300;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '隐秘手里剑',
      cost: [CardType.COLORLESS],
      damage: '',
      text: '给对手的1只宝可梦，造成40伤害。[备战宝可梦不计算弱点、抗性。]',
    },
    {
      name: '激流斩',
      cost: [CardType.WATER, CardType.WATER],
      damage: '120+',
      text: '如果对手的战斗宝可梦身上放置有伤害指示物的话，则追加造成120伤害。',
    },
  ];

  public set = 'set_g';

  public name = '甲贺忍蛙ex';

  public fullName = '甲贺忍蛙ex 030/128#12688';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = effect.opponent;

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
          PlayerType.TOP_PLAYER,
          [SlotType.ACTIVE, SlotType.BENCH],
          { allowCancel: false }
        ),
        targets => {
          if (targets === null || targets.length === 0) {
            return;
          }

          effect.damage = 0;
          const target = targets[0];
          if (target === opponent.active) {
            const damageEffect = new DealDamageEffect(effect, 40);
            damageEffect.target = target;
            store.reduceEffect(state, damageEffect);
            return;
          }

          const damageEffect = new PutDamageEffect(effect, 40);
          damageEffect.target = target;
          store.reduceEffect(state, damageEffect);
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      if (effect.opponent.active.damage > 0) {
        effect.damage += 120;
      }
      return state;
    }

    return state;
  }
}

export const jiaHeRenWaExVariants = [
  seedJiaHeRenWaExVariant(new JiaHeRenWaEx(), {
    id: 12688,
    collectionNumber: '030/128',
    rarityLabel: 'RR',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/253/83.png',
  }),
  seedJiaHeRenWaExVariant(new JiaHeRenWaEx(), {
    id: 16118,
    collectionNumber: '125/052',
    rarityLabel: '无标记',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/314/124.png',
  }),
  seedJiaHeRenWaExVariant(new JiaHeRenWaEx(), {
    id: 16012,
    collectionNumber: '019/052',
    rarityLabel: '无标记',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/314/18.png',
  }),
  seedJiaHeRenWaExVariant(new JiaHeRenWaEx(), {
    id: 13569,
    collectionNumber: '009/058',
    rarityLabel: '无标记',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/268/16.png',
  }),
  seedJiaHeRenWaExVariant(new JiaHeRenWaEx(), {
    id: 13654,
    collectionNumber: '009/058',
    rarityLabel: '无标记☆★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/268/17.png',
  }),
];
