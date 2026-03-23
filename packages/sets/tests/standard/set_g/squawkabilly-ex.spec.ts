import {
  AttachEnergyPrompt,
  AttackAction,
  CardType,
  ChoosePokemonPrompt,
  PlayerType,
  ResolvePromptAction,
  Simulator,
  SlotType,
  UseAbilityAction,
} from '@ptcg/common';

import { SquawkabillyEx } from '../../../src/standard/set_g/squawkabilly-ex';
import { TestCard } from '../../test-cards/test-card';
import { TestEnergy } from '../../test-cards/test-energy';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('Squawkabilly ex set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('uses Squawk and Seize only on first turn and only once', () => {
    const squawkabillyEx = new SquawkabillyEx();
    const handA = new TestCard();
    const handB = new TestCard();
    const deckA = new TestCard();
    const deckB = new TestCard();
    const deckC = new TestCard();
    const deckD = new TestCard();
    const deckE = new TestCard();
    const deckF = new TestCard();

    const { state, player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [squawkabillyEx]);
    state.turn = 1;
    player.hand.cards = [handA, handB];
    player.deck.cards = [deckA, deckB, deckC, deckD, deckE, deckF];

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, 'Squawk and Seize', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.ACTIVE,
        index: 0,
      }));
    }).not.toThrow();

    expect(player.discard.cards).toContain(handA);
    expect(player.discard.cards).toContain(handB);
    expect(player.hand.cards).toEqual([deckA, deckB, deckC, deckD, deckE, deckF]);

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, 'Squawk and Seize', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.ACTIVE,
        index: 0,
      }));
    }).toThrow();
  });

  it('cannot use Squawk and Seize after first turn', () => {
    const squawkabillyEx = new SquawkabillyEx();
    const { state } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [squawkabillyEx]);
    state.turn = 2;

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, 'Squawk and Seize', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.ACTIVE,
        index: 0,
      }));
    }).toThrow();
  });

  it('attaches discarded Basic Energy to the chosen Benched Pokemon with Motivate', () => {
    const squawkabillyEx = new SquawkabillyEx();
    const benchTarget = new TestPokemon();
    const otherBench = new TestPokemon();
    const energyA = new TestEnergy(CardType.LIGHTNING);
    const energyB = new TestEnergy(CardType.GRASS);

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [squawkabillyEx], [CardType.COLORLESS]);
    player.bench[0].pokemons.cards = [benchTarget];
    player.bench[1].pokemons.cards = [otherBench];
    player.discard.cards = [energyA, energyB];

    sim.dispatch(new AttackAction(1, 'Motivate'));

    const choosePokemonPrompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(choosePokemonPrompt.id, [player.bench[0]]));
    }).not.toThrow();

    const attachPrompt = TestUtils.getLastPrompt(sim) as AttachEnergyPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(attachPrompt.id, [
        { to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 }, card: energyA },
        { to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 }, card: energyB },
      ]));
    }).not.toThrow();

    expect(player.bench[0].energies.cards).toContain(energyA);
    expect(player.bench[0].energies.cards).toContain(energyB);
    expect(player.bench[1].energies.cards.length).toBe(0);
  });
});
