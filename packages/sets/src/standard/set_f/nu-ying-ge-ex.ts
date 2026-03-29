import {
  AttackEffect,
  Card,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  Effect,
  EnergyCard,
  EnergyType,
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
  StoreLike,
  SuperType,
} from '@ptcg/common';

function* useBraveRecast(
  next: Function,
  store: StoreLike,
  state: State,
  effect: PowerEffect
): IterableIterator<State> {
  const player = effect.player;

  if (state.turn > 2) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  if (player.marker.hasMarker('BRAVE_RECAST_USED')) {
    throw new GameError(GameMessage.POWER_ALREADY_USED);
  }

  player.hand.moveTo(player.discard);
  player.deck.moveTo(player.hand, Math.min(6, player.deck.cards.length));
  player.marker.addMarker('BRAVE_RECAST_USED', effect.card);

  return state;
}

function* useCheerfulAttack(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect
): IterableIterator<State> {
  const player = effect.player;
  const basicEnergies = player.discard.cards.filter(
    card => card instanceof EnergyCard && card.energyType === EnergyType.BASIC
  );

  const benchTargets = player.bench
    .map((slot, index) => ({ slot, index }))
    .filter(item => item.slot.pokemons.cards.length > 0);
  const playerType = state.players[0] === player ? PlayerType.BOTTOM_PLAYER : PlayerType.TOP_PLAYER;

  if (basicEnergies.length === 0 || benchTargets.length === 0) {
    return state;
  }

  let selected: Card[] = [];
  yield store.prompt(
    state,
    new ChooseCardsPrompt(
      player.id,
      GameMessage.CHOOSE_CARD_TO_ATTACH,
      player.discard,
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
      { min: 0, max: Math.min(2, basicEnergies.length), allowCancel: false }
    ),
    cards => {
      selected = cards || [];
      next();
    }
  );

  if (selected.length === 0) {
    return state;
  }

  let target = null as any;
  const blocked = player.bench
    .map((slot, index) => ({ player: playerType, slot: SlotType.BENCH, index }))
    .filter(item => player.bench[item.index].pokemons.cards.length === 0);

  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_ATTACH_CARDS,
      playerType,
      [SlotType.BENCH],
      { allowCancel: false, min: 1, max: 1, blocked }
    ),
    result => {
      const chosen = result || [];
      target = chosen[0];
      next();
    }
  );

  if (target === null) {
    return state;
  }

  player.discard.moveCardsTo(selected, target.energies);
  return state;
}

export class NuYingGeEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 12814,
      name: '怒鹦哥ex',
      yorenCode: 'Y1253',
      cardType: '1',
      commodityCode: 'CSV2C',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '156/128',
        rarityLabel: 'SAR',
        cardTypeLabel: '宝可梦',
        attributeLabel: '无色',
        trainerTypeLabel: null,
        energyTypeLabel: null,
        pokemonTypeLabel: '宝可梦ex',
        specialCardLabel: null,
        hp: 160,
        evolveText: '基础',
        weakness: '雷 ×2',
        resistance: '斗 -30',
        retreatCost: 1,
      },
      image: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/253/385.png',
      ruleLines: ['当宝可梦ex【昏厥】时，对手将拿取2张奖赏卡。'],
      attacks: [
        {
          id: 6909,
          name: '鼓足干劲',
          text: '选择自己弃牌区中最多2张基本能量，附着于1只备战宝可梦身上。',
          cost: ['COLORLESS'],
          damage: '20',
        },
      ],
      features: [
        {
          id: 930,
          name: '英武重抽',
          text: '只有在最初的自己的回合可以使用1次。将自己的手牌全部放于弃牌区，从牌库上方抽取6张卡牌。在这个回合，如果已经使用了其他的「英武重抽」的话，则无法使用这个特性。',
        },
      ],
      illustratorNames: ['Amelicart'],
      pokemonCategory: null,
      pokedexCode: null,
      pokedexText: '',
      height: null,
      weight: null,
      deckRuleLimit: null,
    },
    collection: {
      id: 253,
      commodityCode: 'CSV2C',
      name: '补充包 奇迹启程',
    },
    image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/253/385.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 160;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: '英武重抽',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text: '只有在最初的自己的回合可以使用1次。将自己的手牌全部放于弃牌区，从牌库上方抽取6张卡牌。在这个回合，如果已经使用了其他的「英武重抽」的话，则无法使用这个特性。',
    },
  ];

  public attacks = [
    {
      name: '鼓足干劲',
      cost: [CardType.COLORLESS],
      damage: '20',
      text: '选择自己弃牌区中最多2张基本能量，附着于1只备战宝可梦身上。',
    },
  ];

  public set: string = 'set_g';

  public name: string = '怒鹦哥ex';

  public fullName: string = '怒鹦哥ex 156/128#12814';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useBraveRecast(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useCheerfulAttack(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker('BRAVE_RECAST_USED');
    }

    return state;
  }
}
