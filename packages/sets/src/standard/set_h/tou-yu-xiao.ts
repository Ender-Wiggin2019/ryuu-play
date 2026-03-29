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

export class TouYuXiao extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17392,
      name: '投羽枭',
      yorenCode: 'P0723',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '015/207',
        rarityLabel: 'C',
        cardTypeLabel: '宝可梦',
        attributeLabel: '草',
        hp: 90,
        evolveText: '1阶进化',
        weakness: '火 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/40.png',
      ruleLines: [],
      attacks: [
        {
          id: 21,
          name: '团结之翼',
          text: '造成自己弃牌区中，拥有招式「团结之翼」的宝可梦的张数×20伤害。',
          cost: ['无色'],
          damage: '20×',
        },
        {
          id: 22,
          name: '利刃之风',
          text: '',
          cost: ['草'],
          damage: '30',
        },
      ],
      features: [],
      illustratorNames: ['Ken Sugimori'],
      pokemonCategory: '刃羽宝可梦',
      pokedexCode: '0723',
      pokedexText: '从肩膀上长出的翅膀极其锋利。会以超乎想象的速度飞来飞去。',
      height: 0.7,
      weight: 16.0,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/40.png',
  };

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '木木枭';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp = 90;

  public weakness = [{ type: CardType.FIRE }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '团结之翼',
      cost: [CardType.COLORLESS],
      damage: '20×',
      text: '造成自己弃牌区中，拥有招式「团结之翼」的宝可梦的张数×20伤害。',
    },
    {
      name: '利刃之风',
      cost: [CardType.GRASS],
      damage: '30',
      text: '',
    },
  ];

  public set = 'set_h';

  public name = '投羽枭';

  public fullName = '投羽枭 015/207#17392';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      const discardCount = effect.player.discard.cards.filter(card => card instanceof PokemonCard && hasUnionWingAttack(card)).length;
      effect.damage = discardCount * 20;
    }

    return state;
  }
}
