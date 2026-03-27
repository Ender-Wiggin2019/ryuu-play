import {
  AttackEffect,
  CardType,
  CoinFlipPrompt,
  Effect,
  GameMessage,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class Timburr extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17915,
      name: '搬运小匠',
      yorenCode: 'P0532',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '110/207',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/305.png',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/305.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 80;

  public weakness = [{ type: CardType.PSYCHIC }];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: '全力重拳',
      cost: [CardType.FIGHTING],
      damage: '40',
      text: '抛掷1次硬币如果为反面，则这个招式失败。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '搬运小匠';

  public fullName: string = '搬运小匠 CSV8C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      return store.prompt(state, [new CoinFlipPrompt(effect.player.id, GameMessage.COIN_FLIP)], result => {
        if (result === false) {
          effect.damage = 0;
        }
      });
    }

    return state;
  }
}
