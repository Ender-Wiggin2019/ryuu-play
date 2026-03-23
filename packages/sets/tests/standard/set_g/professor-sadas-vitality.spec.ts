import {
  AttachEnergyPrompt,
  CardTag,
  CardType,
  PlayCardAction,
  PlayerType,
  ResolvePromptAction,
  Simulator,
  SlotType,
} from '@ptcg/common';

import { ProfessorSadasVitality } from '../../../src/standard/set_g/professor-sadas-vitality';
import { RagingBoltEx } from '../../../src/standard/set_h/raging-bolt-ex';
import { TestCard } from '../../test-cards/test-card';
import { TestEnergy } from '../../test-cards/test-energy';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('Professor Sada\'s Vitality set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('attaches Basic Energy to Ancient Pokemon and draws 3 cards', () => {
    const sadasVitality = new ProfessorSadasVitality();
    const ragingBoltEx = new RagingBoltEx();
    const benchPokemon = new TestPokemon();
    const basicEnergy = new TestEnergy(CardType.LIGHTNING);
    const deckA = new TestCard();
    const deckB = new TestCard();
    const deckC = new TestCard();

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [ragingBoltEx]);
    player.bench[0].pokemons.cards = [benchPokemon];
    player.hand.cards = [sadasVitality];
    player.discard.cards = [basicEnergy];
    player.deck.cards = [deckA, deckB, deckC];

    expect(() => {
      sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    }).not.toThrow();

    const prompt = TestUtils.getLastPrompt(sim) as AttachEnergyPrompt;
    expect(prompt).toBeTruthy();

    expect(() => {
      sim.dispatch(new ResolvePromptAction(prompt.id, [{
        to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 },
        card: basicEnergy,
      }]));
    }).not.toThrow();

    expect(player.active.energies.cards).toContain(basicEnergy);
    expect(player.supporter.cards).toContain(sadasVitality);
    expect(player.hand.cards).toEqual([deckA, deckB, deckC]);
  });

  it('can only target Ancient Pokemon', () => {
    const sadasVitality = new ProfessorSadasVitality();
    const ragingBoltEx = new RagingBoltEx();
    const benchPokemon = new TestPokemon();

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [ragingBoltEx]);
    player.bench[0].pokemons.cards = [benchPokemon];
    player.hand.cards = [sadasVitality];
    player.discard.cards = [new TestEnergy(CardType.LIGHTNING)];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));

    const prompt = TestUtils.getLastPrompt(sim) as AttachEnergyPrompt;
    expect(prompt).toBeTruthy();
    expect(
      prompt.options.blockedTo.some(target =>
        target.player === PlayerType.BOTTOM_PLAYER && target.slot === SlotType.BENCH && target.index === 0
      )
    ).toBe(true);
  });

  it('has no Future tag by default', () => {
    const ragingBoltEx = new RagingBoltEx();
    expect(ragingBoltEx.tags).toContain(CardTag.ANCIENT);
    expect(ragingBoltEx.tags).not.toContain(CardTag.FUTURE);
  });
});
