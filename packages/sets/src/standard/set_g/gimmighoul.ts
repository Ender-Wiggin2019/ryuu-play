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

function* useContinuousCoinToss(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;

  let flipResult = false;
  let heads = 0;
  do {
    yield store.prompt(state, new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP), result => {
      flipResult = result;
      heads += flipResult ? 1 : 0;
      next();
    });
  } while (flipResult);

  effect.damage = heads * 20;
  return state;
}

export class Gimmighoul extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 14302,
      yorenCode: 'P0999',
      name: '索财灵',
      cardType: '1',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '063/129'
      },
      image: 'img\\285\\174.png',
      hash: 'a391309ac87c18fc8e0b575a05ece68a'
    },
    collection: {
      id: 285,
      name: '补充包 嘉奖回合',
      commodityCode: 'CSV4C',
      salesDate: '2025-07-18'
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/285/174.png'
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 70;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Continuous Coin Toss',
      cost: [CardType.COLORLESS],
      damage: '20x',
      text: 'Flip a coin until you get tails. This attack does 20 damage for each heads.'
    }
  ];

  public set: string = 'set_g';

  public name: string = 'Gimmighoul';

  public fullName: string = 'Gimmighoul CSV4C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useContinuousCoinToss(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
