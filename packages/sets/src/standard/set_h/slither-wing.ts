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
  StoreLike,
} from '@ptcg/common';

export class SlitherWing extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17924,
      name: '爬地翅',
      yorenCode: 'P0988',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '119/207',
      },
      image: 'img/458/332.png',
      hash: '25061b79fdd0c77bee57d870b6b96a72',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
      salesDate: '2026-03-13',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/458/332.png',
  };

  public tags = [CardTag.ANCIENT];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 130;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Stomp Off',
      cost: [CardType.COLORLESS],
      damage: '',
      text: 'Discard the top card of your opponent\'s deck.',
    },
    {
      name: 'Burning Turbulence',
      cost: [CardType.FIRE, CardType.COLORLESS, CardType.COLORLESS],
      damage: '120',
      text: 'This Pokemon also does 90 damage to itself. Your opponent\'s Active Pokemon is now Burned.',
    },
  ];

  public set: string = 'set_h';

  public name: string = 'Slither Wing';

  public fullName: string = 'Slither Wing CSV8C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;
      opponent.deck.moveTo(opponent.discard, 1);
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const selfDamage = new PutDamageEffect(effect, 90);
      selfDamage.target = effect.player.active;
      store.reduceEffect(state, selfDamage);

      const burnEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.BURNED]);
      store.reduceEffect(state, burnEffect);
      return state;
    }

    return state;
  }
}
