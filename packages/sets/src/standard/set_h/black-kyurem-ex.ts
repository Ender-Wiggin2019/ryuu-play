import {
  AddSpecialConditionsEffect,
  AttackEffect,
  CardTag,
  CardType,
  Effect,
  PokemonCard,
  PutDamageEffect,
  SpecialCondition,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class BlackKyuremEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17595,
      name: '暗黑酋雷姆ex',
      yorenCode: 'Y1447',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '218/207',
      },
      image: 'img/458/569.png',
      hash: 'cfcfd25daa42dab845b0f408c69befee',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
      salesDate: '2026-03-13',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/569.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 230;

  public weakness = [{ type: CardType.METAL }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '冰雪时代',
      cost: [CardType.WATER, CardType.WATER, CardType.WATER],
      damage: '90',
      text: '如果对手的战斗宝可梦是【龙】宝可梦，则令那只宝可梦陷入【麻痹】状态。',
    },
    {
      name: '暗黑冰霜',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.WATER, CardType.WATER],
      damage: '250',
      text: '给这只宝可梦也造成30点伤害。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '暗黑酋雷姆ex';

  public fullName: string = '暗黑酋雷姆ex CSV8C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = StateUtils.getOpponent(state, effect.player);
      const defending = opponent.active.getPokemonCard();

      if (defending !== undefined && defending.cardTypes.includes(CardType.DRAGON)) {
        const specialCondition = new AddSpecialConditionsEffect(effect, [SpecialCondition.PARALYZED]);
        store.reduceEffect(state, specialCondition);
      }

      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const selfDamage = new PutDamageEffect(effect, 30);
      selfDamage.target = effect.player.active;
      store.reduceEffect(state, selfDamage);
      return state;
    }

    return state;
  }
}
