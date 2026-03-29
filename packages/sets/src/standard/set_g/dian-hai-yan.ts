import {
  AttackEffect,
  CardType,
  Effect,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

function hasUnionWingAttack(card: PokemonCard | undefined): boolean {
  return card !== undefined && card.attacks.some(attack => attack.name === '团结之翼');
}

export class DianHaiYan extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 15509,
      name: '电海燕',
      yorenCode: 'P0940',
      cardType: '1',
      commodityCode: 'CSVE2C2',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '055/207',
        rarityLabel: '无标记',
        cardTypeLabel: '宝可梦',
        attributeLabel: '雷',
        hp: 60,
        evolveText: '基础',
        weakness: '雷 ×2',
        resistance: '斗 -30',
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/61.png',
      ruleLines: [],
      attacks: [
        {
          id: 1120,
          name: '啄',
          text: '',
          cost: ['无色'],
          damage: '10',
        },
        {
          id: 1121,
          name: '团结之翼',
          text: '造成自己弃牌区中，拥有招式「团结之翼」的宝可梦的张数×20伤害。',
          cost: ['无色', '无色'],
          damage: '20×',
        },
      ],
      features: [],
      illustratorNames: ['Kouki Saitou'],
      pokemonCategory: '海燕宝可梦',
      pokedexCode: '0940',
      pokedexText: '翅膀和脚都很小，几乎不能飞。会在海边或悬崖上睡觉。',
      height: 0.3,
      weight: 2.3,
      deckRuleLimit: null,
    },
    collection: {
      id: 308,
      commodityCode: 'CSVE2C2',
      name: '对战派对 耀梦 下',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/308/61.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp = 60;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '啄',
      cost: [CardType.COLORLESS],
      damage: '10',
      text: '',
    },
    {
      name: '团结之翼',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '20×',
      text: '造成自己弃牌区中，拥有招式「团结之翼」的宝可梦的张数×20伤害。',
    },
  ];

  public set = 'set_g';

  public name = '电海燕';

  public fullName = '电海燕 055/207#15509';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[1] || effect.attack.name === this.attacks[1].name)) {
      const discardCount = effect.player.discard.cards.filter(card => card instanceof PokemonCard && hasUnionWingAttack(card)).length;
      effect.damage = discardCount * 20;
    }

    return state;
  }
}
