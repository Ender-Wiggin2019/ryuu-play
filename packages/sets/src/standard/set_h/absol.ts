import {
  AttackEffect,
  CardType,
  Effect,
  PlayerType,
  PokemonCard,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class Absol extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17504,
      name: '阿勃梭鲁',
      yorenCode: 'P359',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '127/207',
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/352.png',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/352.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.DARK];

  public hp: number = 110;

  public weakness = [{ type: CardType.GRASS }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: '狂徒坠落',
      cost: [CardType.COLORLESS],
      damage: '20+',
      text: '如果自己场上有3个及以上【恶】能量的话，则追加造成50伤害。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '阿勃梭鲁';

  public fullName: string = '阿勃梭鲁 CSV8C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      let darkEnergyCount = 0;

      effect.player.forEachPokemon(PlayerType.BOTTOM_PLAYER, pokemonSlot => {
        darkEnergyCount += pokemonSlot.energies.cards.filter(card =>
          card.provides.includes(CardType.DARK) || card.provides.includes(CardType.ANY)
        ).length;
      });

      if (darkEnergyCount >= 3) {
        effect.damage += 50;
      }
    }

    return state;
  }
}
