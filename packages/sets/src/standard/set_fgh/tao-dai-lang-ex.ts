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
  SlotType,
  SpecialCondition,
  Stage,
  State,
  StoreLike,
} from '@ptcg/common';

export const TAO_DAI_LANG_EX_LOGIC_GROUP_KEY = 'pokemon:桃歹郎ex:Y1456:H:hp190:支配锁链:焦躁爆破60x';
export const TAO_DAI_LANG_EX_VARIANT_GROUP_KEY = 'pokemon:桃歹郎ex:Y1456:H:hp190:支配锁链:焦躁爆破60x';

function isDarkPokemon(card: PokemonCard | undefined): boolean {
  if (card === undefined) {
    return false;
  }

  if (card.cardTypes?.includes(CardType.DARK)) {
    return true;
  }

  const rawData = card as any;
  const labels = [
    rawData.rawData?.raw_card?.details?.attributeLabel,
    rawData.rawData?.api_card?.attributeLabel,
  ];
  return labels.some((label: unknown) => label === '恶');
}

export class TaoDaiLangEx extends PokemonCard {
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
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: null,
        hp: 190,
        evolveText: '基础',
        weakness: '斗 ×2',
        resistance: null,
        retreatCost: 1,
      },
      image: '/api/v1/cards/17634/image',
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
          text: '在自己的回合可以使用1次。选择自己备战区中的1只【恶】宝可梦（除「桃歹郎【ex】」外），将其与战斗宝可梦互换。然后，令新的战斗宝可梦陷入【中毒】状态。在这个回合，如果已经使用了其他的「支配锁链」的话，则无法使用这个特性。',
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
    image_url: 'http://localhost:3000/api/v1/cards/17634/image',
    logic_group_key: TAO_DAI_LANG_EX_LOGIC_GROUP_KEY,
    variant_group_key: TAO_DAI_LANG_EX_VARIANT_GROUP_KEY,
    variant_group_size: 1,
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
      text: '在自己的回合可以使用1次。选择自己备战区中的1只【恶】宝可梦（除「桃歹郎【ex】」外），将其与战斗宝可梦互换。然后，令新的战斗宝可梦陷入【中毒】状态。在这个回合，如果已经使用了其他的「支配锁链」的话，则无法使用这个特性。',
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

  public fullName: string = '桃歹郎ex 257/207#17634';

  public readonly DOMINATE_CHAIN_MARKER = 'DOMINATE_CHAIN_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      if (player.marker.hasMarker(this.DOMINATE_CHAIN_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      const blocked = player.bench
        .map((slot, index) => {
          const pokemon = slot.getPokemonCard();
          if (slot.pokemons.cards.length === 0 || pokemon === this || !isDarkPokemon(pokemon)) {
            return { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index };
          }
          return null;
        })
        .filter((target): target is { player: PlayerType; slot: SlotType; index: number } => target !== null);

      if (blocked.length === player.bench.length) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      let targets: any[] = [];
      return store.prompt(
        state,
        new ChoosePokemonPrompt(
          player.id,
          GameMessage.CHOOSE_POKEMON_TO_SWITCH,
          PlayerType.BOTTOM_PLAYER,
          [SlotType.BENCH],
          { allowCancel: false, blocked }
        ),
        result => {
          targets = result || [];
          const target = targets[0];
          if (target === undefined) {
            return;
          }

          player.switchPokemon(target);
          player.active.specialConditions.push(SpecialCondition.POISONED);
          player.active.poisonDamage = 10;
          player.marker.addMarker(this.DOMINATE_CHAIN_MARKER, this);
        }
      );
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = effect.opponent.getPrizeLeft() * 60;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.DOMINATE_CHAIN_MARKER, this);
    }

    return state;
  }
}
