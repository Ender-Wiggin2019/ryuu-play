import {
  AttackEffect,
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

type GuYueNiaoVariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  imageUrl: string;
};

const GU_YUE_NIAO_LOGIC_GROUP_KEY = 'pokemon:古月鸟:P845:H:hp110:喷吐射击120:discard-energy';
const GU_YUE_NIAO_VARIANT_GROUP_KEY = 'pokemon:古月鸟:P845:H:hp110:喷吐射击120:discard-energy';

function seedGuYueNiaoVariant(card: GuYueNiao, seed: GuYueNiaoVariantSeed): GuYueNiao {
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
    logic_group_key: GU_YUE_NIAO_LOGIC_GROUP_KEY,
    variant_group_key: GU_YUE_NIAO_VARIANT_GROUP_KEY,
    variant_group_size: 11,
  };
  card.fullName = `${card.name} ${seed.collectionNumber}#${seed.id}`;
  return card;
}

export class GuYueNiao extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17243,
      name: '古月鸟',
      yorenCode: 'P845',
      cardType: '1',
      commodityCode: 'CBB4C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '25 05/07',
        rarityLabel: '★',
        cardTypeLabel: '宝可梦',
        attributeLabel: '水',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 110,
        evolveText: '基础',
        weakness: '雷 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/339/172.png',
      ruleLines: [],
      attacks: [
        {
          id: 349,
          name: '水枪',
          text: '',
          cost: ['水'],
          damage: '20',
        },
        {
          id: 350,
          name: '喷吐射击',
          text: '将这只宝可梦身上附着的所有能量放于弃牌区，给对手的1只宝可梦，造成120伤害。[备战宝可梦不计算弱点、抗性。]',
          cost: ['无色', '无色', '无色'],
          damage: '',
        },
      ],
      features: [],
      illustratorNames: ['OKACHEKE'],
      pokemonCategory: '一口吞宝可梦',
      pokedexCode: '0845',
      pokedexText: '记性相当差，会把大部分能量分配在战斗上，只留最低限度的能量给大脑。',
      height: 0.8,
      weight: 18,
      deckRuleLimit: null,
    },
    collection: {
      id: 339,
      commodityCode: 'CBB4C',
      name: '宝石包 VOL.4',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/339/172.png',
    logic_group_key: GU_YUE_NIAO_LOGIC_GROUP_KEY,
    variant_group_key: GU_YUE_NIAO_VARIANT_GROUP_KEY,
    variant_group_size: 11,
  };

  public stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp = 110;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '水枪',
      cost: [CardType.WATER],
      damage: '20',
      text: '',
    },
    {
      name: '喷吐射击',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '',
      text: '将这只宝可梦身上附着的所有能量放于弃牌区，给对手的1只宝可梦，造成120伤害。[备战宝可梦不计算弱点、抗性。]',
    },
  ];

  public set = 'set_h';

  public name = '古月鸟';

  public fullName = '古月鸟 25 05/07#17243';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = effect.opponent;

      player.active.energies.moveTo(player.discard);

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
            const damageEffect = new DealDamageEffect(effect, 120);
            damageEffect.target = target;
            store.reduceEffect(state, damageEffect);
            return;
          }

          const damageEffect = new PutDamageEffect(effect, 120);
          damageEffect.target = target;
          store.reduceEffect(state, damageEffect);
        }
      );
    }

    return state;
  }
}

export const guYueNiaoVariants = [
  seedGuYueNiaoVariant(new GuYueNiao(), {
    id: 17243,
    collectionNumber: '25 05/07',
    rarityLabel: '★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/339/172.png',
  }),
  seedGuYueNiaoVariant(new GuYueNiao(), {
    id: 17244,
    collectionNumber: '25 06/07',
    rarityLabel: '★★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/339/173.png',
  }),
  seedGuYueNiaoVariant(new GuYueNiao(), {
    id: 17245,
    collectionNumber: '25 07/07',
    rarityLabel: '★★★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/339/174.png',
  }),
  seedGuYueNiaoVariant(new GuYueNiao(), {
    id: 17239,
    collectionNumber: '25 01/07',
    rarityLabel: '●',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/339/168.png',
  }),
  seedGuYueNiaoVariant(new GuYueNiao(), {
    id: 17240,
    collectionNumber: '25 02/07',
    rarityLabel: '●',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/339/169.png',
  }),
  seedGuYueNiaoVariant(new GuYueNiao(), {
    id: 17241,
    collectionNumber: '25 03/07',
    rarityLabel: '◆',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/339/170.png',
  }),
  seedGuYueNiaoVariant(new GuYueNiao(), {
    id: 17242,
    collectionNumber: '25 04/07',
    rarityLabel: '◆',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/339/171.png',
  }),
  seedGuYueNiaoVariant(new GuYueNiao(), {
    id: 16232,
    collectionNumber: '066/204',
    rarityLabel: 'U',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/181.png',
  }),
  seedGuYueNiaoVariant(new GuYueNiao(), {
    id: 16484,
    collectionNumber: '066/204',
    rarityLabel: 'U☆★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/182.png',
  }),
  seedGuYueNiaoVariant(new GuYueNiao(), {
    id: 16657,
    collectionNumber: '066/204',
    rarityLabel: 'U★★★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/324/183.png',
  }),
  seedGuYueNiaoVariant(new GuYueNiao(), {
    id: 17069,
    collectionNumber: '170/SV-P',
    rarityLabel: '无标记',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/212/22.png',
  }),
];
