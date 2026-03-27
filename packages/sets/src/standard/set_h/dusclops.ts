import {
  CardType,
  ChoosePokemonPrompt,
  Effect,
  EndTurnEffect,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  PowerEffect,
  PowerType,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

export class Dusclops extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17588,
      name: '彷徨夜灵',
      yorenCode: 'P356',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '211/207',
      },
      image: 'img/458/562.png',
      hash: '0554f66c1287882600f542053254255d',
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
      salesDate: '2026-03-13',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/562.png',
  };

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = '夜巡灵';

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 90;

  public weakness = [{ type: CardType.DARK }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [
    {
      name: '咒怨炸弹',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text:
        '在自己的回合可以使用1次，如果使用了，则令这只宝可梦【昏厥】。给对手的1只宝可梦身上，放置5个伤害指示物。',
    },
  ];

  public attacks = [
    {
      name: '磷火',
      cost: [CardType.PSYCHIC, CardType.PSYCHIC],
      damage: '50',
      text: '',
    },
  ];

  public set: string = 'set_h';

  public name: string = '彷徨夜灵';

  public fullName: string = '彷徨夜灵 CSV8C';

  public readonly CURSED_BLAST_MARKER = 'CURSED_BLAST_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);

      if (player.marker.hasMarker(this.CURSED_BLAST_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      if (pokemonSlot === undefined || !pokemonSlot.pokemons.cards.includes(this)) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
          PlayerType.TOP_PLAYER,
          [SlotType.ACTIVE, SlotType.BENCH],
          { allowCancel: false }
        ),
        targets => {
          if (targets === null || targets.length === 0) {
            return;
          }

          player.marker.addMarker(this.CURSED_BLAST_MARKER, this);
          targets[0].damage += 50;
          pokemonSlot.damage += 999;
        }
      );
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.CURSED_BLAST_MARKER, this);
      return state;
    }

    return state;
  }
}
