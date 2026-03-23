import {
  AttackEffect,
  CardTag,
  CardType,
  Effect,
  PokemonCard,
  PlayerType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class SandyShocks extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16714,
      name: '沙铁皮',
      yorenCode: 'P0989',
      cardType: '1',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '132/204',
      },
      image: 'img\\324\\363.png',
      hash: '02f776b43f444500ce327edf4e7d667b',
    },
    collection: {
      id: 324,
      commodityCode: 'CSV7C',
      name: '补充包 利刃猛醒',
      salesDate: '2026-01-16',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/324/363.png',
  };

  public tags = [CardTag.ANCIENT];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp: number = 120;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Magnetic Burst',
      cost: [CardType.LIGHTNING],
      damage: '20+',
      text: 'If you have 3 or more Energy in play, this attack does 70 more damage. This attack\'s damage isn\'t affected by Weakness.',
    },
    {
      name: 'Power Gem',
      cost: [CardType.LIGHTNING, CardType.COLORLESS, CardType.COLORLESS],
      damage: '60',
      text: '',
    },
  ];

  public set: string = 'set_h';

  public name: string = 'Sandy Shocks';

  public fullName: string = 'Sandy Shocks CSV7C';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      let energyCount = 0;

      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, pokemon => {
        energyCount += pokemon.energies.cards.length;
      });

      if (energyCount >= 3) {
        effect.damage += 70;
      }
      effect.ignoreWeakness = true;
      return state;
    }

    return state;
  }
}
