import {
  AttackEffect,
  CardTag,
  CardType,
  CoinFlipPrompt,
  Effect,
  GameMessage,
  PokemonCard,
  SpecialCondition,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class AmoongussEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17385,
      name: '败露球菇ex',
      yorenCode: 'Y1441',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '008/207',
      },
      image: 'img/458/21.png',
      hash: '472593185445073617c2ea8dd0c6e130',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
      salesDate: '2026-03-13',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/21.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '哎呀球菇';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 260;

  public weakness = [{ type: CardType.FIRE }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '孢子弹',
      cost: [CardType.GRASS],
      damage: '30',
      text: '令对手的战斗宝可梦陷入【睡眠】状态。',
    },
    {
      name: '蘑菇挥打',
      cost: [CardType.GRASS, CardType.COLORLESS],
      damage: '100+',
      text: '掷1次硬币如果为正面，则追加造成80点伤害。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '败露球菇ex';

  public fullName: string = '败露球菇ex CSV8C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.active.addSpecialCondition(SpecialCondition.ASLEEP);
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.damage = 100;
      return store.prompt(state, [new CoinFlipPrompt(effect.player.id, GameMessage.COIN_FLIP)], result => {
        if (result === true) {
          effect.damage += 80;
        }
      });
    }

    return state;
  }
}
