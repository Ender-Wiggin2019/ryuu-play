import {
  CardType,
  ChooseCardsPrompt,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PokemonCard,
  PokemonSlot,
  PowerEffect,
  PowerType,
  Stage,
  State,
  StoreLike,
  SuperType,
} from '@ptcg/common';

export class Duskull extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17587,
      name: '夜巡灵',
      yorenCode: 'P355',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '210/207',
      },
      image: 'img/458/561.png',
      hash: '340c8b91fc5ce0b1827e42ddd0faa05f',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
      salesDate: '2026-03-13',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/561.png',
  };

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 60;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '渡魂',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '在自己的回合可以使用1次。选择自己弃牌区中最多3张「夜巡灵」，放于备战区。',
    },
  ];

  public attacks = [
    {
      name: '喃喃自语',
      cost: [CardType.PSYCHIC, CardType.PSYCHIC],
      damage: '30',
      text: '',
    },
  ];

  public set: string = 'set_h';

  public name: string = '夜巡灵';

  public fullName: string = '夜巡灵 CSV8C';

  public readonly SOUL_TRANSFER_MARKER = 'SOUL_TRANSFER_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.marker.hasMarker(this.SOUL_TRANSFER_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      const slots: PokemonSlot[] = player.bench.filter(b => b.pokemons.cards.length === 0);
      const duskullInDiscard = player.discard.cards.filter(c => c instanceof PokemonCard && c.name === '夜巡灵');

      if (slots.length === 0 || duskullInDiscard.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const max = Math.min(3, slots.length, duskullInDiscard.length);

      return store.prompt(
        state,
        new ChooseCardsPrompt(
          player.id,
          GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
          player.discard,
          { superType: SuperType.POKEMON, name: '夜巡灵' },
          { min: 1, max, allowCancel: false }
        ),
        selected => {
          const cards = selected || [];
          if (cards.length === 0) {
            return;
          }

          player.marker.addMarker(this.SOUL_TRANSFER_MARKER, this);

          cards.forEach((card, index) => {
            player.discard.moveCardTo(card, slots[index].pokemons);
            slots[index].pokemonPlayedTurn = state.turn;
          });
        }
      );
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.SOUL_TRANSFER_MARKER, this);
      return state;
    }

    return state;
  }
}
