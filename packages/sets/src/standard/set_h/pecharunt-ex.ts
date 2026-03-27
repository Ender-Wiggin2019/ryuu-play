import {
  AttackEffect,
  CardTag,
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
  SpecialCondition,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
} from '@ptcg/common';

function isDarkPokemon(card: PokemonCard | undefined): boolean {
  return card !== undefined && card.cardTypes.includes(CardType.DARK);
}

export class PecharuntEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 17634,
      name: '桃歹郎ex',
      yorenCode: 'Y1456',
      cardType: '1',
      commodityCode: 'CSV8C',
      details: {
        regulationMarkText: 'H',
        collectionNumber: '257/207',
        rarityLabel: 'UR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '恶',
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: null,
        hp: 190,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/608.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 315,
          name: '焦躁爆破',
          text: '造成对手已经获得的奖赏卡张数×60伤害。',
          cost: ['恶', '恶'],
          damage: '60×',
        },
      ],
      features: [
        {
          id: 60,
          name: '支配锁链',
          text:
            '在自己的回合可以使用1次。选择自己备战区中的1只【恶】宝可梦（除「桃歹郎【ex】」外），将其与战斗宝可梦互换。然后，令新的战斗宝可梦陷入【中毒】状态。在这个回合，如果已经使用了其他的「支配锁链」的话，则无法使用这个特性。',
        },
      ],
      illustratorNames: ['aky CG Works'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: null,
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 458,
      commodityCode: 'CSV8C',
      name: '补充包 璀璨诡幻',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/458/608.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.DARK];

  public hp: number = 190;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '支配锁链',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text:
        '在自己的回合可以使用1次。选择自己备战区中的1只【恶】宝可梦（除「桃歹郎【ex】」外），将其与战斗宝可梦互换。然后，令新的战斗宝可梦陷入【中毒】状态。在这个回合，如果已经使用了其他的「支配锁链」的话，则无法使用这个特性。',
    },
  ];

  public attacks = [
    {
      name: '焦躁爆破',
      cost: [CardType.DARK, CardType.DARK],
      damage: '60×',
      text: '造成对手已经获得的奖赏卡张数×60伤害。',
    },
  ];

  public set: string = 'set_h';

  public name: string = '桃歹郎ex';

  public fullName: string = '桃歹郎ex CSV8C';

  public readonly DOMINATION_CHAIN_MARKER = 'DOMINATION_CHAIN_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const pokemonSlot = StateUtils.findPokemonSlot(state, this);

      if (pokemonSlot === undefined) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.marker.hasMarker(this.DOMINATION_CHAIN_MARKER)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      const blocked = player.bench
        .map((slot, index) => {
          const pokemon = slot.getPokemonCard();
          if (pokemon === undefined || !isDarkPokemon(pokemon) || pokemon.name === this.name) {
            return { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index };
          }
          return null;
        })
        .filter((target): target is { player: PlayerType; slot: SlotType; index: number } => target !== null);

      if (blocked.length === player.bench.length) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_POKEMON_TO_SWITCH,
          PlayerType.BOTTOM_PLAYER,
          [SlotType.BENCH],
          { allowCancel: false, blocked }
        ),
        targets => {
          if (targets === null || targets.length === 0) {
            return;
          }

          player.marker.addMarker(this.DOMINATION_CHAIN_MARKER, this);
          player.switchPokemon(targets[0]);
          player.active.addSpecialCondition(SpecialCondition.POISONED);
        }
      );
    }

    if (effect instanceof AttackEffect && (effect.attack === this.attacks[0] || effect.attack.name === this.attacks[0].name)) {
      effect.damage = (6 - effect.opponent.getPrizeLeft()) * 60;
      return state;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.DOMINATION_CHAIN_MARKER);
      return state;
    }

    return state;
  }
}
