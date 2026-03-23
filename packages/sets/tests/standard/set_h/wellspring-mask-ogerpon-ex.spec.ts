import {
  AttackAction,
  CardTag,
  CardType,
  ChooseCardsPrompt,
  ConfirmPrompt,
  ResolvePromptAction,
  Simulator,
} from '@ptcg/common';

import { WellspringMaskOgerponEx } from '../../../src/standard/set_h/wellspring-mask-ogerpon-ex';
import { TestEnergy } from '../../test-cards/test-energy';
import { TestUtils } from '../../test-utils';

describe('Wellspring Mask Ogerpon ex set_h', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('has Tera tag', () => {
    const wellspringMaskOgerponEx = new WellspringMaskOgerponEx();
    expect(wellspringMaskOgerponEx.tags).toContain(CardTag.TERA);
  });

  it('can shuffle 3 attached Energy cards into deck with Torrential Pump', () => {
    const wellspringMaskOgerponEx = new WellspringMaskOgerponEx();
    const energyA = new TestEnergy(CardType.WATER);
    const energyB = new TestEnergy(CardType.WATER);
    const energyC = new TestEnergy(CardType.COLORLESS);

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [wellspringMaskOgerponEx]);
    player.active.energies.cards = [energyA, energyB, energyC];

    sim.dispatch(new AttackAction(1, 'Torrential Pump'));

    const confirmPrompt = TestUtils.getLastPrompt(sim) as ConfirmPrompt;
    expect(confirmPrompt).toBeTruthy();
    expect(() => {
      sim.dispatch(new ResolvePromptAction(confirmPrompt.id, true));
    }).not.toThrow();

    const chooseEnergiesPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(chooseEnergiesPrompt).toBeTruthy();
    expect(() => {
      sim.dispatch(new ResolvePromptAction(chooseEnergiesPrompt.id, [energyA, energyB, energyC]));
    }).not.toThrow();

    expect(player.active.energies.cards.length).toEqual(0);
    expect(player.deck.cards).toContain(energyA);
    expect(player.deck.cards).toContain(energyB);
    expect(player.deck.cards).toContain(energyC);
  });
});
