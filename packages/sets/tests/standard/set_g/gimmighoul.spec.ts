import {
  AttackEffect,
  CardType,
  Simulator,
  CoinFlipPrompt,
} from '@ptcg/common';

import { Gimmighoul } from '../../../src/standard/set_g/gimmighoul';
import { TestUtils } from '../../test-utils';

function createPromptStore(sim: Simulator, responder: (prompt: unknown) => unknown) {
  return {
    prompt: (promptState: typeof sim.store.state, prompt: unknown, callback: (result: unknown) => void) => {
      callback(responder(prompt));
      return promptState;
    },
    reduceEffect: sim.store.reduceEffect.bind(sim.store),
  } as any;
}

describe('索财灵 set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('keeps flipping until tails and counts each heads for Continuous Coin Toss', () => {
    const card = new Gimmighoul();
    const { state, player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.COLORLESS]);

    let flips = 0;
    const store = createPromptStore(sim, prompt => {
      if (prompt instanceof CoinFlipPrompt) {
        flips += 1;
        return flips < 3;
      }
      return undefined;
    });

    const effect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(store, state, effect);

    expect(effect.damage).toBe(40);
  });
});
