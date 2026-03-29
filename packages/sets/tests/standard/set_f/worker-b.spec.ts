import {
  AttackEffect,
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  CoinFlipPrompt,
  PowerEffect,
  Simulator,
} from '@ptcg/common';

import { TestCard } from '../../test-cards/test-card';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';
import { GuaGuaPaoWa } from '../../../src/standard/set_f/gua-gua-pao-wa';
import { HuaLiaoHuanHuan } from '../../../src/standard/set_f/hua-liao-huan-huan';
import { HuPaEx } from '../../../src/standard/set_f/hu-pa-ex';
import { JiaHeRenWaEx } from '../../../src/standard/set_f/jia-he-ren-wa-ex';
import { TuLongJieJie } from '../../../src/standard/set_f/tu-long-jie-jie';

function createPromptStore(sim: Simulator, responder: (prompt: unknown) => unknown) {
  return {
    prompt: (promptState: typeof sim.store.state, prompt: unknown, callback: (result: unknown) => void) => {
      callback(responder(prompt));
      return promptState;
    },
    reduceEffect: sim.store.reduceEffect.bind(sim.store),
  } as any;
}

describe('worker b set_f cards', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('paralyzes and returns the defending Pokemon to the deck with 土龙节节 掘遁闪光', () => {
    const card = new TuLongJieJie();
    const { state, player, opponent } = TestUtils.getAll(sim);
    const defendingPokemon = new TestPokemon();

    TestUtils.setActive(sim, [card], [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS]);
    opponent.active.pokemons.cards = [defendingPokemon];

    const store = createPromptStore(sim, prompt => {
      if (prompt instanceof CoinFlipPrompt) {
        return true;
      }
      return [0];
    });

    const effect = new AttackEffect(player, opponent, card.attacks[1]);
    card.reduceEffect(store, state, effect);

    expect(opponent.active.getPokemonCard()).toBeUndefined();
    expect(opponent.deck.cards).toContain(defendingPokemon);
    expect(effect.damage).toBe(0);
    expect(opponent.active.specialConditions.length).toBe(0);
  });

  it('moves the top two cards of the deck with 花疗环环 选花', () => {
    const card = new HuaLiaoHuanHuan();
    const { state, player } = TestUtils.getAll(sim);
    const topA = new TestCard();
    const topB = new TestCard();
    const bottomC = new TestCard();

    TestUtils.setActive(sim, [card], [CardType.PSYCHIC, CardType.COLORLESS]);
    player.deck.cards = [topA, topB, bottomC];

    const store = createPromptStore(sim, prompt => {
      if (prompt instanceof ChooseCardsPrompt) {
        return [prompt.cards.cards[1]];
      }
      return undefined;
    });

    const powerEffect = new PowerEffect(player, card.powers[0], card);
    card.reduceEffect(store, state, powerEffect);

    expect(player.hand.cards).toContain(topB);
    expect(player.lostzone.cards).toContain(topA);
    expect(player.marker.hasMarker(card.SELECT_FLOWER_MARKER, card)).toBeTrue();
  });

  it('fails on tails with 呱呱泡蛙 跳一下', () => {
    const card = new GuaGuaPaoWa();
    const { state, player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.WATER]);

    const store = createPromptStore(sim, prompt => prompt instanceof CoinFlipPrompt ? false : undefined);
    const effect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(store, state, effect);

    expect(effect.damage).toBe(0);
  });

  it('hits the chosen bench target with 甲贺忍蛙ex 隐秘手里剑', () => {
    const card = new JiaHeRenWaEx();
    const { state, player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.COLORLESS]);
    opponent.bench[0].pokemons.cards = [new TestPokemon()];

    const store = createPromptStore(sim, prompt => {
      if (prompt instanceof ChoosePokemonPrompt) {
        return [opponent.bench[0]];
      }
      return undefined;
    });

    const effect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(store, state, effect);

    expect(opponent.bench[0].damage).toBe(40);
    expect(opponent.active.damage).toBe(0);
  });

  it('counts opponent energy with 胡帕ex 能量粉碎 and blocks the next turn for 狂徒拳', () => {
    const card = new HuPaEx();
    const { state, player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.DARK, CardType.DARK, CardType.DARK]);
    opponent.active.energies.cards = TestUtils.makeEnergies([CardType.WATER]);
    opponent.bench[0].pokemons.cards = [new TestPokemon()];
    opponent.bench[0].energies.cards = TestUtils.makeEnergies([CardType.FIRE, CardType.COLORLESS]);

    const store = createPromptStore(sim, () => undefined);

    const smashEffect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(store, state, smashEffect);
    expect(smashEffect.damage).toBe(150);

    const rushEffect = new AttackEffect(player, opponent, card.attacks[1]);
    card.reduceEffect(store, state, rushEffect);
    expect(card.lockedAttackTurn).toBe(state.turn + 1);

    state.turn += 1;
    expect(() => card.reduceEffect(store, state, new AttackEffect(player, opponent, card.attacks[1]))).toThrowError(
      'BLOCKED_BY_EFFECT'
    );
  });
});
