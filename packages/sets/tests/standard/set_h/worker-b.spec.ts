import {
  AttackEffect,
  CardType,
  CoinFlipPrompt,
  ChoosePokemonPrompt,
  DealDamageEffect,
  EndTurnEffect,
  SelectPrompt,
  Simulator,
} from '@ptcg/common';

import { TestCard } from '../../test-cards/test-card';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';
import { GuYueNiao } from '../../../src/standard/set_h/gu-yue-niao';
import { HongMingYueEx } from '../../../src/standard/set_f/hong-ming-yue-ex';
import { TuLongDiDi } from '../../../src/standard/set_h/tu-long-di-di';

function createPromptStore(sim: Simulator, responder: (prompt: unknown) => unknown) {
  return {
    prompt: (promptState: typeof sim.store.state, prompt: unknown, callback: (result: unknown) => void) => {
      callback(responder(prompt));
      return promptState;
    },
    reduceEffect: sim.store.reduceEffect.bind(sim.store),
  } as any;
}

describe('worker b set_h cards', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('locks attack effects after 土龙弟弟 挖洞 heads and clears on end turn', () => {
    const card = new TuLongDiDi();
    const { state, player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.COLORLESS, CardType.COLORLESS]);

    const store = createPromptStore(sim, prompt => prompt instanceof CoinFlipPrompt);
    const burrowEffect = new AttackEffect(player, opponent, card.attacks[1]);
    card.reduceEffect(store, state, burrowEffect);

    expect(player.active.marker.hasMarker(card.BURROW_MARKER, card)).toBeTrue();

    const blockedBase = new AttackEffect(opponent, player, opponent.active.getPokemonCard()!.attacks[0]);
    const blockedEffect = new DealDamageEffect(blockedBase, 10);
    card.reduceEffect(store, state, blockedEffect);
    expect(blockedEffect.preventDefault).toBeTrue();

    card.reduceEffect(store, state, new EndTurnEffect(opponent));
    expect(player.active.marker.hasMarker(card.BURROW_MARKER, card)).toBeFalse();
  });

  it('discards energies and damages a bench target with 古月鸟 喷吐射击', () => {
    const card = new GuYueNiao();
    const energyA = TestUtils.makeEnergies([CardType.WATER])[0];
    const energyB = TestUtils.makeEnergies([CardType.COLORLESS])[0];
    const { state, player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS]);
    player.active.energies.cards = [energyA, energyB];
    opponent.bench[0].pokemons.cards = [new TestPokemon()];

    const store = createPromptStore(sim, prompt => prompt instanceof ChoosePokemonPrompt ? [opponent.bench[0]] : undefined);

    const effect = new AttackEffect(player, opponent, card.attacks[1]);
    card.reduceEffect(store, state, effect);

    expect(player.discard.cards).toEqual(jasmine.arrayContaining([energyA, energyB]));
    expect(opponent.bench[0].damage).toBe(120);
    expect(opponent.active.damage).toBe(0);
  });

  it('adds 120 damage when choosing to discard the stadium with 轰鸣月ex 灾厄风暴', () => {
    const card = new HongMingYueEx();
    const stadium = new TestCard();
    const { state, player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.DARK, CardType.DARK, CardType.COLORLESS]);
    player.stadium.cards = [stadium];

    const store = createPromptStore(sim, prompt => {
      if (prompt instanceof SelectPrompt) {
        return 1;
      }
      return undefined;
    });

    const effect = new AttackEffect(player, opponent, card.attacks[1]);
    card.reduceEffect(store, state, effect);

    expect(player.stadium.cards.length).toBe(0);
    expect(player.discard.cards).toContain(stadium);
    expect(effect.damage).toBe(220);
  });
});
