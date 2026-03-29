import {
  AddSpecialConditionsEffect,
  AttackEffect,
  BetweenTurnsEffect,
  CardType,
  ChooseCardsPrompt,
  DealDamageEffect,
  PlayerType,
  ResolvePromptAction,
  ShowCardsPrompt,
  Simulator,
  SlotType,
  SpecialCondition,
  SuperType,
  TrainerCard,
  TrainerType,
  UseAbilityAction,
} from '@ptcg/common';

import { GuangHuiXiCuiDaNiuLa } from '../../../src/standard/set_f/guang-hui-xi-cui-da-niu-la';
import { KaBiShouF } from '../../../src/standard/set_f/ka-bi-shou-f';
import { KaBiShouH } from '../../../src/standard/set_h/ka-bi-shou-h';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';
import { ZuZhouWaWa } from '../../../src/standard/set_f/zu-zhou-wa-wa';

class DummySupporter extends TrainerCard {
  public superType = SuperType.TRAINER;
  public trainerType = TrainerType.SUPPORTER;
  public set = 'TEST';
  public name = 'Test Supporter';
  public fullName = 'Test Supporter';
  public text = '';
}

class Poisoner extends TestPokemon {
  public attacks = [{
    name: '毒牙',
    cost: [],
    damage: '20',
    text: '',
  }];

  public reduceEffect(store: any, state: any, effect: any): any {
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage = 20;
      const damage = new DealDamageEffect(effect, 20);
      damage.target = effect.opponent.active;
      store.reduceEffect(state, damage);
      const poison = new AddSpecialConditionsEffect(effect, [SpecialCondition.POISONED]);
      poison.target = effect.opponent.active;
      try {
        store.reduceEffect(state, poison);
      } catch {
        // 卡比兽 F 会拦住附加状态，这里只验证伤害仍然生效。
      }
    }
    return state;
  }
}

describe('pokemon impl7 set_f', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('puts a supporter from discard into hand and sends itself to the Lost Zone with 贡献玩偶', () => {
    const card = new ZuZhouWaWa();
    const supporter = new DummySupporter();
    const { player } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.discard.cards = [supporter];

    sim.dispatch(new UseAbilityAction(1, '贡献玩偶', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    const choosePrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(choosePrompt.id, [supporter]));
    const showPrompt = TestUtils.getLastPrompt(sim) as ShowCardsPrompt;
    sim.dispatch(new ResolvePromptAction(showPrompt.id, true));

    expect(player.hand.cards).toContain(supporter);
    expect(player.lostzone.cards).toContain(card);
  });

  it('adds 20 poison damage between turns with 巅峰毒性', () => {
    const card = new GuangHuiXiCuiDaNiuLa();
    const { opponent, state } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.DARK]);
    opponent.active.specialConditions = [SpecialCondition.POISONED];

    const effect = new BetweenTurnsEffect(opponent);
    card.reduceEffect(sim.store, state, effect);

    expect(effect.poisonDamage).toBe(30);
  });

  it('poisons the defending Pokemon with 毒击', () => {
    const card = new GuangHuiXiCuiDaNiuLa();
    const { opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.DARK, CardType.COLORLESS]);
    opponent.active.pokemons.cards = [new TestPokemon()];

    const effect = new AttackEffect(TestUtils.getAll(sim).player, opponent, card.attacks[0]);
    card.reduceEffect(sim.store, TestUtils.getAll(sim).state, effect);

    expect(opponent.active.specialConditions).toContain(SpecialCondition.POISONED);
  });

  it('blocks attack effects but not damage, and requires two heads to clear sleep for 卡比兽 F', () => {
    const card = new KaBiShouF();
    const poisoner = new Poisoner();
    const { player, opponent, state } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [poisoner]);
    opponent.active.pokemons.cards = [card];

    const poisonEffect = new AttackEffect(player, opponent, poisoner.attacks[0]);
    poisoner.reduceEffect(sim.store, state, poisonEffect);

    expect(opponent.active.damage).toBe(20);
    expect(opponent.active.specialConditions).not.toContain(SpecialCondition.POISONED);

    const sleepCard = new KaBiShouF();
    player.active.pokemons.cards = [sleepCard];
    player.active.specialConditions = [SpecialCondition.ASLEEP];

    const flipResults = [true, false];
    const promptCallbacks: Array<(result: boolean) => void> = [];
    const fakeStore = {
      prompt: (promptState: typeof state, _prompt: unknown, callback: (result: boolean) => void) => {
        promptCallbacks.push(callback);
        return promptState;
      },
      reduceEffect: (_promptState: typeof state) => _promptState,
    } as any;

    const effect = new BetweenTurnsEffect(player);
    sleepCard.reduceEffect(fakeStore, state, effect);
    promptCallbacks.shift()?.(flipResults.shift() ?? false);
    promptCallbacks.shift()?.(flipResults.shift() ?? false);

    expect(effect.asleepFlipResult).toBeFalse();
    expect(promptCallbacks.length).toBe(0);
  });

  it('attaches energy and heals with 填饱肚子, and deals 160 with 重磅冲击', () => {
    const card = new KaBiShouH();
    const energy = TestUtils.makeEnergies([CardType.FIRE])[0];
    const { player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.COLORLESS]);
    player.hand.cards = [energy];
    player.active.damage = 100;
    opponent.active.pokemons.cards = [new TestPokemon()];

    const attackEffect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(sim.store, TestUtils.getAll(sim).state, attackEffect);
    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [energy]));

    expect(player.active.energies.cards).toContain(energy);
    expect(player.active.damage).toBe(40);

    const heavyEffect = new AttackEffect(player, opponent, card.attacks[1]);
    card.reduceEffect(sim.store, TestUtils.getAll(sim).state, heavyEffect);
    expect(heavyEffect.damage).toBe(160);
  });
});
