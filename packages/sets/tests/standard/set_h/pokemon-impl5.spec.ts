import {
  AttackAction,
  CardTag,
  CardType,
  ChoosePokemonPrompt,
  PlayerType,
  PowerType,
  ResolvePromptAction,
  SlotType,
  Stage,
  Simulator,
  SuperType,
  TrainerCard,
  TrainerType,
  UseAbilityAction,
} from '@ptcg/common';

import { HuaYanGuai } from '../../../src/standard/set_g/hua-yan-guai';
import { QiLinQi } from '../../../src/standard/set_h/qi-lin-qi';
import { QiLinQiEx } from '../../../src/standard/set_h/qi-lin-qi-ex';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

class DummyTool extends TrainerCard {
  public superType = SuperType.TRAINER;
  public trainerType = TrainerType.TOOL;
  public set = 'TEST';
  public name = 'Test Tool';
  public fullName = 'Test Tool';
  public text = '';
}

class DummyBasicVPokemon extends TestPokemon {
  public tags = [CardTag.POKEMON_V];
  public stage = Stage.BASIC;
  public powers = [{
    name: 'V Power',
    powerType: PowerType.ABILITY,
    text: '',
  }];
}

class DummyBasicExAttacker extends TestPokemon {
  public tags = [CardTag.POKEMON_EX];
  public stage = Stage.BASIC;
  public cardTypes = [CardType.DARK];
  public attacks = [{
    name: 'Test attack',
    cost: [],
    damage: '50',
    text: '',
  }];
}

describe('pokemon impl5 set_h', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('adds 10 damage to a chosen benched Pokemon with 双向头击', () => {
    const card = new QiLinQi();
    const bench = new TestPokemon();
    const { opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.PSYCHIC, CardType.COLORLESS]);
    opponent.bench[0].pokemons.cards = [bench];

    sim.dispatch(new AttackAction(1, '双向头击'));
    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.bench[0]]));

    expect(opponent.active.damage).toBe(30);
    expect(opponent.bench[0].damage).toBe(10);
  });

  it('prevents damage from a basic ex attacker with 尾甲', () => {
    const card = new QiLinQiEx();
    const attacker = new DummyBasicExAttacker();
    const { opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [attacker]);
    opponent.active.pokemons.cards = [card];

    sim.dispatch(new AttackAction(1, 'Test attack'));

    expect(opponent.active.damage).toBe(0);
  });

  it('blocks basic V abilities with 漆黑灾祸', () => {
    const vPokemon = new DummyBasicVPokemon();
    const { opponent } = TestUtils.getAll(sim);

    opponent.bench[0].pokemons.cards = [vPokemon];

    expect(() => {
      sim.dispatch(new UseAbilityAction(2, 'V Power', {
        player: PlayerType.TOP_PLAYER,
        slot: SlotType.BENCH,
        index: 0,
      }));
    }).toThrow();
  });

  it('returns itself plus attachments to hand with 瞬间消失', () => {
    const card = new HuaYanGuai();
    const tool = new DummyTool();
    const energy = TestUtils.makeEnergies([CardType.PSYCHIC])[0];
    const { player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.PSYCHIC], [tool]);
    player.active.energies.cards = [energy];
    opponent.bench[0].pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '瞬间消失'));

    expect(player.hand.cards).toContain(card);
    expect(player.hand.cards).toContain(energy);
    expect(player.hand.cards).toContain(tool);
    expect(player.active.pokemons.cards.length).toBe(0);
    expect(player.active.energies.cards.length).toBe(0);
    expect(player.active.trainers.cards.length).toBe(0);
  });
});
