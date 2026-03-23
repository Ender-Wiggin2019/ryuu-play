import {
  AttackEffect,
  CardType,
  ChoosePokemonPrompt,
  Effect,
  GameMessage,
  PlayerType,
  PokemonCard,
  PutCountersEffect,
  SlotType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export class Cresselia extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 'swsh11-74',
      name: 'Cresselia',
      supertype: 'Pokémon',
      subtypes: ['Basic'],
      hp: '120',
      types: ['Psychic'],
      attacks: [
        {
          name: 'Moonglow Reverse',
          cost: ['Psychic'],
          convertedEnergyCost: 1,
          damage: '',
          text: 'Move 2 damage counters from each of your Pokémon to 1 of your opponent\'s Pokémon.',
        },
        {
          name: 'Lunar Blast',
          cost: ['Psychic', 'Psychic', 'Colorless'],
          convertedEnergyCost: 3,
          damage: '110',
          text: '',
        },
      ],
      weaknesses: [{ type: 'Darkness', value: '×2' }],
      resistances: [{ type: 'Fighting', value: '-30' }],
      retreatCost: ['Colorless'],
      convertedRetreatCost: 1,
      number: '74',
      artist: 'saino misaki',
      rarity: 'Rare Holo',
      legalities: {
        unlimited: 'Legal',
        standard: 'Legal',
        expanded: 'Legal',
      },
      regulationMark: 'F',
      images: {
        small: 'https://images.pokemontcg.io/swsh11/74.png',
        large: 'https://images.pokemontcg.io/swsh11/74_hires.png',
      },
    },
    collection: {},
    image_url: 'https://images.pokemontcg.io/swsh11/74_hires.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 120;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Moonglow Reverse',
      cost: [CardType.PSYCHIC],
      damage: '',
      text: 'Move 2 damage counters from each of your Pokemon to 1 of your opponent\'s Pokemon.',
    },
    {
      name: 'Lunar Blast',
      cost: [CardType.PSYCHIC, CardType.PSYCHIC, CardType.COLORLESS],
      damage: '110',
      text: '',
    },
  ];

  public set: string = 'set_f';

  public name: string = 'Cresselia';

  public fullName: string = 'Cresselia LOR';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      let movedDamage = 0;
      effect.player.forEachPokemon(PlayerType.BOTTOM_PLAYER, pokemonSlot => {
        const damageToMove = Math.min(20, pokemonSlot.damage);
        pokemonSlot.damage -= damageToMove;
        movedDamage += damageToMove;
      });

      if (movedDamage === 0) {
        return state;
      }

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          effect.player.id,
          GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
          PlayerType.TOP_PLAYER,
          [SlotType.ACTIVE, SlotType.BENCH],
          { allowCancel: false }
        ),
        targets => {
          if (!targets || targets.length === 0) {
            return;
          }

          const putCountersEffect = new PutCountersEffect(effect, movedDamage);
          putCountersEffect.target = targets[0];
          store.reduceEffect(state, putCountersEffect);
        }
      );
    }

    return state;
  }
}
