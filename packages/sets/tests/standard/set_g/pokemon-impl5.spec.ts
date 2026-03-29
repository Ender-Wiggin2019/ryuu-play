import {
  AttackEffect,
  CardType,
  PlayerType,
  ResolvePromptAction,
  Simulator,
  SlotType,
  SuperType,
  TrainerCard,
  TrainerType,
  ShowCardsPrompt,
  TrainerEffect,
  UseAbilityAction,
} from '@ptcg/common';

import { KaBiShouG } from '../../../src/standard/set_g/ka-bi-shou-g';
import { YuanYingWaWa } from '../../../src/standard/set_g/yuan-ying-wa-wa';
import { ZuZhouWaWaEx } from '../../../src/standard/set_g/zu-zhou-wa-wa-ex';
import { TestCard } from '../../test-cards/test-card';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

class DummyItem extends TrainerCard {
  public superType = SuperType.TRAINER;
  public trainerType = TrainerType.ITEM;
  public set = 'TEST';
  public name = 'Test Item';
  public fullName = 'Test Item';
  public text = '';
}

class DummySupporter extends TrainerCard {
  public superType = SuperType.TRAINER;
  public trainerType = TrainerType.SUPPORTER;
  public set = 'TEST';
  public name = 'Test Supporter';
  public fullName = 'Test Supporter';
  public text = '';
}

class DummyLeftovers extends TrainerCard {
  public superType = SuperType.TRAINER;
  public trainerType = TrainerType.ITEM;
  public set = 'TEST';
  public name = '吃剩的东西';
  public fullName = '吃剩的东西';
  public text = '';
}

describe('pokemon impl5 set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('counts trainer cards in hand with 灵骚 and blocks item play after 暗夜难明', () => {
    const card = new ZuZhouWaWaEx();
    const opponentItem = new DummyItem();
    const opponentSupporter = new DummySupporter();

    const { opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.PSYCHIC, CardType.PSYCHIC, CardType.COLORLESS]);
    opponent.hand.cards = [opponentItem, opponentSupporter, new TestCard()];

    const damageEffect = new AttackEffect(TestUtils.getAll(sim).player, opponent, card.attacks[1]);
    card.reduceEffect(sim.store, TestUtils.getAll(sim).state, damageEffect);
    expect(damageEffect.damage).toBe(120);

    const lockEffect = new AttackEffect(TestUtils.getAll(sim).player, opponent, card.attacks[0]);
    card.reduceEffect(sim.store, TestUtils.getAll(sim).state, lockEffect);

    expect(() => {
      card.reduceEffect(sim.store, TestUtils.getAll(sim).state, new TrainerEffect(opponent, opponentItem));
    }).toThrow();
  });

  it('blocks item play after heads on 阴影包围', () => {
    const card = new YuanYingWaWa();
    const opponentItem = new DummyItem();
    const { opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.PSYCHIC]);
    opponent.hand.cards = [opponentItem];

    const effect = new AttackEffect(TestUtils.getAll(sim).player, opponent, card.attacks[0]);
    const promptCallbacks: Array<(result: boolean) => void> = [];
    const store = {
      prompt: (promptState: typeof sim.store.state, _prompt: unknown, callback: (result: unknown) => void) => {
        promptCallbacks.push(callback as (result: boolean) => void);
        return promptState;
      },
      reduceEffect: sim.store.reduceEffect.bind(sim.store),
    } as any;
    card.reduceEffect(store, TestUtils.getAll(sim).state, effect);
    promptCallbacks.shift()?.(true);

    expect(() => {
      card.reduceEffect(sim.store, TestUtils.getAll(sim).state, new TrainerEffect(opponent, opponentItem));
    }).toThrow();
  });

  it('retrieves up to 2 吃剩的东西 with 贪嘴 and deals self damage with 厚重压制', () => {
    const card = new KaBiShouG();
    const leftoversA = new DummyLeftovers();
    const leftoversB = new DummyLeftovers();
    const { player, opponent } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.discard.cards = [leftoversA, leftoversB];
    opponent.active.pokemons.cards = [new TestPokemon()];

    sim.dispatch(new UseAbilityAction(1, '贪嘴', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    const prompt = TestUtils.getLastPrompt(sim)!;
    sim.dispatch(new ResolvePromptAction(prompt.id, [leftoversA, leftoversB]));
    const showPrompt = TestUtils.getLastPrompt(sim) as ShowCardsPrompt;
    sim.dispatch(new ResolvePromptAction(showPrompt.id, true));

    expect(player.hand.cards).toEqual(jasmine.arrayContaining([leftoversA, leftoversB]));
    expect(player.marker.hasMarker(card.GLUTTONY_MARKER, card)).toBeTrue();

    const heavyEffect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(sim.store, TestUtils.getAll(sim).state, heavyEffect);

    expect(heavyEffect.damage).toBe(130);
    expect(player.active.damage).toBe(30);
  });
});
