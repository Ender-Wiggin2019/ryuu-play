import {
  AddSpecialConditionsEffect,
  AttackEffect,
  CardType,
  Effect,
  GameError,
  GameMessage,
  PokemonCard,
  PowerEffect,
  PowerType,
  RetreatEffect,
  SpecialCondition,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

const KA_BI_SHOU_BLOCK_IMAGE_URL = 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/183/159.png';

export class KaBiShouBlock extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 2291,
      name: '卡比兽',
      yorenCode: 'P143',
      cardType: '1',
      commodityCode: 'CS5aC',
      details: {
        regulationMarkText: 'F',
        collectionNumber: '093/127',
        rarityLabel: 'R',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        hp: 150,
        evolveText: '基础',
        weakness: '斗 ×2',
        retreatCost: 4,
      },
      image: KA_BI_SHOU_BLOCK_IMAGE_URL,
      ruleLines: [],
      attacks: [
        {
          id: 1,
          name: '瘫倒',
          text: '使这只宝可梦陷入【睡眠】状态。',
          cost: ['无色', '无色', '无色', '无色'],
          damage: '150',
        },
      ],
      features: [
        {
          id: 1,
          name: '挡道',
          text: '只要这只宝可梦在战斗场上，对手的战斗宝可梦，无法撤退。',
        },
      ],
      illustratorNames: ['Saboteri'],
    },
    collection: {
      id: 183,
      commodityCode: 'CS5aC',
      name: '补充包 勇魅群星 魅',
    },
    image_url: KA_BI_SHOU_BLOCK_IMAGE_URL,
    logic_group_key: 'pokemon:卡比兽:P143:F:hp150:挡道:瘫倒150',
    variant_group_key: 'pokemon:卡比兽:P143:F:hp150:挡道:瘫倒150',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp = 150;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [
    CardType.COLORLESS,
    CardType.COLORLESS,
    CardType.COLORLESS,
    CardType.COLORLESS,
  ];

  public powers = [
    {
      name: '挡道',
      powerType: PowerType.ABILITY,
      text: '只要这只宝可梦在战斗场上，对手的战斗宝可梦，无法撤退。',
    },
  ];

  public attacks = [
    {
      name: '瘫倒',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: '150',
      text: '使这只宝可梦陷入【睡眠】状态。',
    },
  ];

  public set = 'set_f';

  public name = '卡比兽';

  public fullName = '卡比兽 093/127';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      effect.damage = 150;
      const sleepEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.ASLEEP]);
      sleepEffect.target = effect.player.active;
      store.reduceEffect(state, sleepEffect);
      return state;
    }

    if (effect instanceof RetreatEffect) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (opponent.active.getPokemonCard() !== this) {
        return state;
      }

      try {
        const powerEffect = new PowerEffect(opponent, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch {
        return state;
      }

      throw new GameError(GameMessage.BLOCKED_BY_ABILITY);
    }

    return state;
  }
}
