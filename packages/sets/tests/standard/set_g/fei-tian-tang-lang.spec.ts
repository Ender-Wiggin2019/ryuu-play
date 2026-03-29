import {
  AttackEffect,
  CardType,
  CoinFlipPrompt,
  DealDamageEffect,
  Simulator,
} from '@ptcg/common';

import { FeiTianTangLang } from '../../../src/standard/set_g/fei-tian-tang-lang';
import { TestPokemon } from '../../test-cards/test-pokemon';
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

describe('飞天螳螂 set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('prevents damage and effects during the opponent next turn after 高速移动 heads', () => {
    const card = new FeiTianTangLang();
    const { state, player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.COLORLESS]);
    opponent.active.pokemons.cards = [new TestPokemon()];

    const store = createPromptStore(sim, prompt => {
      if (prompt instanceof CoinFlipPrompt) {
        return true;
      }
      if (Array.isArray(prompt) && prompt[0] instanceof CoinFlipPrompt) {
        return true;
      }
      return undefined;
    });
    card.reduceEffect(store, state, new AttackEffect(player, opponent, card.attacks[0]));

    const opponentCard = opponent.active.getPokemonCard();
    expect(opponentCard).toBeTruthy();
    const opponentAttack = new AttackEffect(opponent, player, opponentCard!.attacks[0]);
    const damageEffect = new DealDamageEffect(opponentAttack, 10);
    card.reduceEffect(store, state, damageEffect);

    expect(damageEffect.preventDefault).toBeTrue();
  });

  it('keeps the base 20 damage for 居合劈', () => {
    const card = new FeiTianTangLang();
    const { player, opponent, state } = TestUtils.getAll(sim);

    const effect = new AttackEffect(player, opponent, card.attacks[1]);
    card.reduceEffect(sim.store, state, effect);

    expect(effect.damage).toBe(20);
  });

  it('has zero retreat cost', () => {
    const card = new FeiTianTangLang();

    expect(card.retreat).toHaveLength(0);
    expect(card.rawData.raw_card.details.retreatCost).toBe(0);
  });
});
