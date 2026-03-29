import {
  AttackEffect,
  CardType,
  CoinFlipPrompt,
  DealDamageEffect,
  Effect,
  GameMessage,
  PokemonCard,
  ShuffleDeckPrompt,
  SpecialCondition,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';
import { getCardImageUrl, getR2CardImageUrl } from '../card-image-r2';

type TuLongJieJieVariantSeed = {
  id: number;
  collectionNumber: string;
  rarityLabel: string;
  imageUrl: string;
};

const TU_LONG_JIE_JIE_LOGIC_GROUP_KEY = 'pokemon:土龙节节:P0982:G:hp140:掘遁闪光100:paralyze-bounce';
const TU_LONG_JIE_JIE_VARIANT_GROUP_KEY = 'pokemon:土龙节节:P0982:G:hp140:掘遁闪光100:paralyze-bounce';

function seedTuLongJieJieVariant(card: TuLongJieJie, seed: TuLongJieJieVariantSeed): TuLongJieJie {
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
    logic_group_key: TU_LONG_JIE_JIE_LOGIC_GROUP_KEY,
    variant_group_key: TU_LONG_JIE_JIE_VARIANT_GROUP_KEY,
    variant_group_size: 4,
  };
  card.fullName = `${card.name} ${seed.collectionNumber}#${seed.id}`;
  return card;
}

export class TuLongJieJie extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 13301,
      name: '土龙节节',
      yorenCode: 'P0982',
      cardType: '1',
      commodityCode: 'CSV3C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '138/130',
        rarityLabel: 'AR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        pokemonTypeLabel: null,
        specialCardLabel: null,
        hp: 140,
        evolveText: '1阶进化',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 3,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/369.png',
      ruleLines: [],
      attacks: [
        {
          id: 1949,
          name: '掷泥',
          text: '',
          cost: ['无色'],
          damage: '30',
        },
        {
          id: 1950,
          name: '掘遁闪光',
          text: '令对手的战斗宝可梦陷入【麻痹】状态。将这只宝可梦，以及放于其身上的所有卡牌，放回自己的牌库并重洗牌库。',
          cost: ['无色', '无色', '无色', '无色'],
          damage: '100',
        },
      ],
      features: [],
      illustratorNames: ['Mina Nakai'],
      pokemonCategory: '地蛇宝可梦',
      pokedexCode: '0982',
      pokedexText: '会用坚硬的尾巴来挖穿地下深处的岩盘来筑巢。巢穴长达１０公里。',
      height: 3.6,
      weight: 39.2,
      deckRuleLimit: null,
    },
    collection: {
      id: 270,
      commodityCode: 'CSV3C',
      name: '补充包 无畏太晶',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/369.png',
    logic_group_key: TU_LONG_JIE_JIE_LOGIC_GROUP_KEY,
    variant_group_key: TU_LONG_JIE_JIE_VARIANT_GROUP_KEY,
    variant_group_size: 4,
  };

  public stage = Stage.STAGE_1;

  public evolvesFrom = '土龙弟弟';

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp = 140;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '掷泥',
      cost: [CardType.COLORLESS],
      damage: '30',
      text: '',
    },
    {
      name: '掘遁闪光',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '100',
      text: '令对手的战斗宝可梦陷入【麻痹】状态。将这只宝可梦，以及放于其身上的所有卡牌，放回自己的牌库并重洗牌库。',
    },
  ];

  public set = 'set_g';

  public name = '土龙节节';

  public fullName = '土龙节节 138/130#13301';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = effect.opponent;

      return store.prompt(state, new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP), flipResult => {
        if (!flipResult) {
          return;
        }

        effect.damage = 0;
        opponent.active.addSpecialCondition(SpecialCondition.PARALYZED);

        const damageEffect = new DealDamageEffect(effect, 100);
        damageEffect.target = opponent.active;
        store.reduceEffect(state, damageEffect);

        opponent.active.moveTo(opponent.deck);
        opponent.active.clearEffects();

        store.prompt(state, new ShuffleDeckPrompt(opponent.id), order => {
          opponent.deck.applyOrder(order);
        });
      });
    }

    return state;
  }
}

export const tuLongJieJieVariants = [
  seedTuLongJieJieVariant(new TuLongJieJie(), {
    id: 13301,
    collectionNumber: '138/130',
    rarityLabel: 'AR',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/369.png',
  }),
  seedTuLongJieJieVariant(new TuLongJieJie(), {
    id: 13262,
    collectionNumber: '099/130',
    rarityLabel: 'U',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/268.png',
  }),
  seedTuLongJieJieVariant(new TuLongJieJie(), {
    id: 13414,
    collectionNumber: '099/130',
    rarityLabel: 'U☆★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/269.png',
  }),
  seedTuLongJieJieVariant(new TuLongJieJie(), {
    id: 13530,
    collectionNumber: '099/130',
    rarityLabel: 'U★★★',
    imageUrl: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/270/270.png',
  }),
];
