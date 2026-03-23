import {
  AttackAction,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  ResolvePromptAction,
  Simulator,
} from '@ptcg/common';

import { RagingBoltEx } from '../../../src/standard/set_h/raging-bolt-ex';
import { TestCard } from '../../test-cards/test-card';
import { TestEnergy } from '../../test-cards/test-energy';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('Raging Bolt ex set_h', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('has Ancient tag', () => {
    const ragingBoltEx = new RagingBoltEx();
    expect(ragingBoltEx.tags).toContain(CardTag.ANCIENT);
  });

  it('discards hand and draws 6 cards with Burst Roar', () => {
    const ragingBoltEx = new RagingBoltEx();
    const handA = new TestCard();
    const handB = new TestCard();
    const handC = new TestCard();
    const deckA = new TestCard();
    const deckB = new TestCard();
    const deckC = new TestCard();
    const deckD = new TestCard();
    const deckE = new TestCard();
    const deckF = new TestCard();
    const deckG = new TestCard();

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [ragingBoltEx], [CardType.LIGHTNING, CardType.LIGHTNING]);
    player.hand.cards = [handA, handB, handC];
    player.deck.cards = [deckA, deckB, deckC, deckD, deckE, deckF, deckG];

    sim.dispatch(new AttackAction(1, 'Burst Roar'));

    expect(player.discard.cards).toContain(handA);
    expect(player.discard.cards).toContain(handB);
    expect(player.discard.cards).toContain(handC);
    expect(player.hand.cards).toEqual([deckA, deckB, deckC, deckD, deckE, deckF]);
  });

  it('discards selected Basic Energy from your Pokemon for Bellowing Thunder', () => {
    const ragingBoltEx = new RagingBoltEx();
    const activeLightning = new TestEnergy(CardType.LIGHTNING);
    const activeWater = new TestEnergy(CardType.WATER);
    const benchGrass = new TestEnergy(CardType.GRASS);
    const benchPokemon = new TestPokemon();

    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [ragingBoltEx], [CardType.LIGHTNING, CardType.COLORLESS]);
    player.active.energies.cards = [activeLightning, activeWater];
    player.bench[0].pokemons.cards = [benchPokemon];
    player.bench[0].energies.cards = [benchGrass];

    sim.dispatch(new AttackAction(1, 'Bellowing Thunder'));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(prompt).toBeTruthy();
    expect(prompt.options.min).toEqual(0);
    expect(prompt.options.max).toEqual(3);

    expect(() => {
      sim.dispatch(new ResolvePromptAction(prompt.id, [activeLightning, benchGrass]));
    }).not.toThrow();

    expect(player.discard.cards).toContain(activeLightning);
    expect(player.discard.cards).toContain(benchGrass);
    expect(player.active.energies.cards).toEqual([activeWater]);
    expect(player.bench[0].energies.cards).toEqual([]);
    expect(opponent.active.damage).toEqual(140);
  });
});
