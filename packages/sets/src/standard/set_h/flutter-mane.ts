import {
  AttackEffect,
  CardTarget,
  CardTag,
  CardType,
  ChoosePokemonPrompt,
  Effect,
  GameMessage,
  PlayerType,
  PokemonCard,
  PutDamageEffect,
  SlotType,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

import { commonMarkers } from '../../common';

export class FlutterMane extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 'sv8-96',
      name: 'Flutter Mane',
      supertype: 'Pokémon',
      subtypes: ['Basic', 'Ancient'],
      hp: '90',
      types: ['Psychic'],
      attacks: [
        {
          name: 'Perplexing Transfer',
          cost: ['Colorless', 'Colorless'],
          convertedEnergyCost: 2,
          damage: '',
          text: 'Move all damage counters from 1 of your Benched Ancient Pokémon to your opponent\'s Active Pokémon.',
        },
        {
          name: 'Moonblast',
          cost: ['Psychic', 'Psychic'],
          convertedEnergyCost: 2,
          damage: '70',
          text: 'During your opponent\'s next turn, attacks used by the Defending Pokémon do 30 less damage (before applying Weakness and Resistance).',
        },
      ],
      weaknesses: [{ type: 'Metal', value: '×2' }],
      retreatCost: ['Colorless'],
      convertedRetreatCost: 1,
      number: '96',
      rarity: 'Uncommon',
      legalities: {
        unlimited: 'Legal',
        standard: 'Legal',
        expanded: 'Legal',
      },
      regulationMark: 'H',
      images: {
        small: 'https://images.pokemontcg.io/sv8/96.png',
        large: 'https://images.pokemontcg.io/sv8/96_hires.png',
      },
    },
    collection: {},
    image_url: 'https://images.pokemontcg.io/sv8/96_hires.png',
  };

  public tags = [CardTag.ANCIENT];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 90;

  public weakness = [{ type: CardType.METAL }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Perplexing Transfer',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: '',
      text: 'Move all damage counters from 1 of your Benched Ancient Pokemon to your opponent\'s Active Pokemon.',
    },
    {
      name: 'Moonblast',
      cost: [CardType.PSYCHIC, CardType.PSYCHIC],
      damage: '70',
      text:
        'During your opponent\'s next turn, attacks used by the Defending Pokemon do 30 less damage ' +
        '(before applying Weakness and Resistance).',
    },
  ];

  public set: string = 'set_h';

  public name: string = 'Flutter Mane';

  public fullName: string = 'Flutter Mane PRE';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    const opponentNextTurn = commonMarkers.duringOpponentNextTurn(this, store, state, effect);

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const blocked: CardTarget[] = player.bench
        .map((slot, index) => {
          const pokemonCard = slot.getPokemonCard();
          const isAncient = pokemonCard?.tags.includes(CardTag.ANCIENT) === true;
          return isAncient && slot.damage > 0 ? null : {
            player: PlayerType.BOTTOM_PLAYER,
            slot: SlotType.BENCH,
            index,
          };
        })
        .filter((target): target is CardTarget => target !== null);

      if (blocked.length === player.bench.length) {
        return state;
      }

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
          PlayerType.BOTTOM_PLAYER,
          [SlotType.BENCH],
          { allowCancel: false, blocked }
        ),
        targets => {
          if (!targets || targets.length === 0) {
            return;
          }

          const source = targets[0];
          const damageToMove = source.damage;
          if (damageToMove === 0) {
            return;
          }

          source.damage = 0;
          effect.opponent.active.damage += damageToMove;
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      opponentNextTurn.setMarker(effect, effect.opponent.active);
      return state;
    }

    if (effect instanceof PutDamageEffect && opponentNextTurn.hasMarker(effect, effect.source)) {
      effect.damage = Math.max(0, effect.damage - 30);
      return state;
    }

    return state;
  }
}
