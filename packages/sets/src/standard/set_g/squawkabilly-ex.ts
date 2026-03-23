import {
  AttackEffect,
  AttachEnergyPrompt,
  CardType,
  ChoosePokemonPrompt,
  CardTag,
  CardTarget,
  Effect,
  EnergyCard,
  EnergyType,
  EndTurnEffect,
  GameError,
  GameMessage,
  PlayerType,
  PokemonCard,
  PokemonSlot,
  PowerEffect,
  PowerType,
  SlotType,
  Stage,
  State,
  StateUtils,
  StoreLike,
  SuperType,
} from '@ptcg/common';

function* useMotivate(
  next: Function,
  store: StoreLike,
  state: State,
  effect: AttackEffect,
): IterableIterator<State> {
  const player = effect.player;
  const hasBench = player.bench.some(b => b.pokemons.cards.length > 0);
  const basicEnergyInDiscard = player.discard.cards.filter(
    card => card instanceof EnergyCard && card.energyType === EnergyType.BASIC
  ).length;

  if (!hasBench || basicEnergyInDiscard === 0) {
    return state;
  }

  let selectedTarget: PokemonSlot | undefined;

  yield store.prompt(
    state,
    new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_ATTACH_CARDS,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.BENCH],
      { allowCancel: true }
    ),
    targets => {
      selectedTarget = (targets || [])[0];
      next();
    }
  );

  if (selectedTarget === undefined) {
    return state;
  }

  const selectedBenchIndex = player.bench.indexOf(selectedTarget);
  if (selectedBenchIndex === -1) {
    return state;
  }

  const blockedTo: CardTarget[] = [];
  player.bench.forEach((bench, index) => {
    if (bench.pokemons.cards.length === 0) {
      return;
    }
    if (selectedBenchIndex === index) {
      return;
    }
    blockedTo.push({ player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index });
  });

  return store.prompt(
    state,
    new AttachEnergyPrompt(
      player.id,
      GameMessage.ATTACH_ENERGY_CARDS,
      player.discard,
      PlayerType.BOTTOM_PLAYER,
      [SlotType.BENCH],
      { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
      { min: 1, max: Math.min(2, basicEnergyInDiscard), allowCancel: true, blockedTo }
    ),
    transfers => {
      for (const transfer of transfers || []) {
        const target = StateUtils.getTarget(state, player, transfer.to);
        player.discard.moveCardTo(transfer.card, target.energies);
      }
    }
  );
}

export class SquawkabillyEx extends PokemonCard {
  public rawData = {
    raw_card: {
      id: 16911,
      name: '怒鹦哥ex',
      yorenCode: 'Y1253',
      cardType: '1',
      details: {
        regulationMarkText: 'G',
        collectionNumber: '014/033',
      },
      image: 'img\\329\\13.png',
      hash: 'a1e13da49143fe44aaa5e4b6f0b6dd8d',
    },
    collection: {
      id: 329,
      commodityCode: 'CSVM1bC',
      name: '大师战略卡组构筑套装 沙奈朵ex',
      salesDate: '2026-01-16',
    },
    image_url: 'https://raw.githubusercontent.com/duanxr/PTCG-CHS-Datasets/main/img/329/13.png',
  };

  public tags = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 160;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public powers = [
    {
      name: 'Squawk and Seize',
      useWhenInPlay: true,
      powerType: PowerType.ABILITY,
      text:
        'Once during your first turn, you may discard your hand and draw 6 cards. ' +
        'You can\'t use more than 1 Squawk and Seize Ability during your turn.',
    },
  ];

  public attacks = [
    {
      name: 'Motivate',
      cost: [CardType.COLORLESS],
      damage: '20',
      text: 'Attach up to 2 Basic Energy cards from your discard pile to 1 of your Benched Pokemon.',
    },
  ];

  public set: string = 'set_g';

  public name: string = 'Squawkabilly ex';

  public fullName: string = 'Squawkabilly ex CSVM1bC';

  public readonly SQUAWK_AND_SEIZE_MARKER = 'SQUAWK_AND_SEIZE_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      if (state.turn !== 1 || state.players[state.activePlayer] !== player) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.marker.hasMarker(this.SQUAWK_AND_SEIZE_MARKER)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      player.hand.moveTo(player.discard);
      player.deck.moveTo(player.hand, Math.min(6, player.deck.cards.length));
      player.marker.addMarker(this.SQUAWK_AND_SEIZE_MARKER, this);
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useMotivate(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.SQUAWK_AND_SEIZE_MARKER);
      return state;
    }

    return state;
  }
}
