import {
  AttackAction,
  AttachEnergyPrompt,
  CardType,
  ChoosePokemonPrompt,
  PlayerType,
  ResolvePromptAction,
  SelectPrompt,
  SlotType,
  SpecialCondition,
  UseAbilityAction,
} from '@ptcg/common';

import { Annihilape } from '../../../src/standard/set_fgh/annihilape';
import { Drifloon } from '../../../src/standard/set_fgh/drifloon';
import { GardevoirEx } from '../../../src/standard/set_fgh/gardevoir-ex';
import { Kirlia } from '../../../src/standard/set_fgh/kirlia';
import { KirliaCsv2C } from '../../../src/standard/set_fgh/kirlia-csv2c';
import { Ralts } from '../../../src/standard/set_fgh/ralts';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('pokemon impl1 set_fgh', () => {
  it('keeps 拉鲁拉丝 damage simple', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new Ralts();
    TestUtils.setActive(sim, [card], [CardType.PSYCHIC, CardType.COLORLESS]);
    TestUtils.setDefending(sim, [new TestPokemon()]);

    sim.dispatch(new AttackAction(1, '精神射击'));

    expect(TestUtils.getAll(sim).opponent.active.damage).toBe(30);
  });

  it('updates 奇鲁莉安 second attack damage by opponent energy count', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new KirliaCsv2C();
    TestUtils.setActive(sim, [card], [CardType.PSYCHIC, CardType.PSYCHIC, CardType.COLORLESS]);
    TestUtils.setDefending(sim, [new TestPokemon()], [CardType.FIRE, CardType.WATER]);

    sim.dispatch(new AttackAction(1, '精神强念'));
    expect(TestUtils.getAll(sim).opponent.active.damage).toBe(100);
  });

  it('lets 沙奈朵ex attach a psychic energy from discard and add 2 counters', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new GardevoirEx();
    const psychicEnergy = TestUtils.makeEnergies([CardType.PSYCHIC])[0];
    const { player } = TestUtils.getAll(sim);
    player.active.pokemons.cards = [card];
    player.bench[0].pokemons.cards = [new Ralts()];
    player.discard.cards = [psychicEnergy];

    sim.dispatch(new UseAbilityAction(1, '精神拥抱', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    const prompt = TestUtils.getLastPrompt(sim) as AttachEnergyPrompt;
    expect(prompt).toBeTruthy();
    sim.dispatch(new ResolvePromptAction(prompt.id, [
      {
        to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 },
        card: psychicEnergy,
      },
    ]));

    expect(player.bench[0].energies.cards).toContain(psychicEnergy);
    expect(player.bench[0].damage).toBe(20);
  });

  it('clears special conditions when 沙奈朵ex attacks', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new GardevoirEx();

    TestUtils.setActive(sim, [card], [CardType.PSYCHIC, CardType.PSYCHIC, CardType.COLORLESS]);
    TestUtils.setDefending(sim, [new TestPokemon()]);
    const { player, opponent } = TestUtils.getAll(sim);
    player.active.specialConditions = [SpecialCondition.POISONED, SpecialCondition.BURNED];

    sim.dispatch(new AttackAction(1, '奇迹之力'));
    expect(opponent.active.damage).toBe(190);
    expect(player.active.specialConditions).toEqual([]);
  });

  it('scales 飘飘球气球炸弹 by damage counters on itself', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new Drifloon();
    TestUtils.setActive(sim, [card], [CardType.PSYCHIC, CardType.PSYCHIC]);
    TestUtils.setDefending(sim, [new TestPokemon()]);

    const { player, opponent } = TestUtils.getAll(sim);
    player.active.damage = 20;

    sim.dispatch(new AttackAction(1, '气球炸弹'));
    expect(opponent.active.damage).toBe(60);
  });

  it('moves counters with 愿增猿 and only allows the ability once per turn', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new Annihilape();
    const damaged = new TestPokemon();
    const target = new TestPokemon();
    const darkEnergy = TestUtils.makeEnergies([CardType.DARK])[0];
    const { player, opponent } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.active.energies.cards = [darkEnergy];
    player.bench[0].pokemons.cards = [damaged];
    player.bench[0].damage = 30;
    opponent.bench[0].pokemons.cards = [target];

    sim.dispatch(new UseAbilityAction(1, '亢奋脑力', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    let prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(prompt).toBeTruthy();
    sim.dispatch(new ResolvePromptAction(prompt.id, [player.bench[0]]));

    prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(prompt).toBeTruthy();
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.bench[0]]));

    const selectPrompt = TestUtils.getLastPrompt(sim) as SelectPrompt;
    expect(selectPrompt).toBeTruthy();
    sim.dispatch(new ResolvePromptAction(selectPrompt.id, 2));

    expect(player.bench[0].damage).toBe(0);
    expect(opponent.bench[0].damage).toBe(30);

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, '亢奋脑力', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.ACTIVE,
        index: 0,
      }));
    }).toThrow();
  });

  it('confuses the defending Pokémon with 愿增猿 attack', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new Annihilape();
    TestUtils.setActive(sim, [card], [CardType.PSYCHIC, CardType.COLORLESS]);
    TestUtils.setDefending(sim, [new TestPokemon()]);

    sim.dispatch(new AttackAction(1, '精神幻觉'));

    const { opponent } = TestUtils.getAll(sim);
    expect(opponent.active.specialConditions).toContain(SpecialCondition.CONFUSED);
  });
});
