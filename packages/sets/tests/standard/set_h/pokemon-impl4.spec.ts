import {
  AttackEffect,
  ChooseCardsPrompt,
  AttachEnergyPrompt,
  CardType,
  CheckAttackCostEffect,
  PlayPokemonEffect,
  PlayerType,
  PokemonCard,
  SlotType,
  Stage,
  Simulator,
} from '@ptcg/common';

import { GuangHuiPenHuoLong } from '../../../src/standard/set_h/guang-hui-pen-huo-long';
import { HuoKongLong } from '../../../src/standard/set_h/huo-kong-long';
import { PenHuoLongEx } from '../../../src/standard/set_h/pen-huo-long-ex';
import { XiaoHuoLong } from '../../../src/standard/set_h/xiao-huo-long';
import { TestCard } from '../../test-cards/test-card';
import { TestUtils } from '../../test-utils';

class DummyPokemon extends PokemonCard {
  public stage: Stage;

  public cardTypes: CardType[];

  public hp: number;

  public weakness: { type: CardType }[] = [];

  public resistance: { type: CardType; value: number }[] = [];

  public retreat: CardType[] = [];

  public set = 'TEST';

  public name: string;

  public fullName: string;

  public evolvesFrom = '';

  public attacks = [];

  public powers = [];

  constructor(name: string, stage: Stage, hp: number, cardTypes: CardType[] = [], evolvesFrom = '') {
    super();
    this.name = name;
    this.fullName = `${name} TEST`;
    this.stage = stage;
    this.hp = hp;
    this.cardTypes = cardTypes;
    this.evolvesFrom = evolvesFrom;
  }
}

describe('pokemon impl4 set_h', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('lets 小火龙 discard the stadium in play and deal 30 with 吐火', () => {
    const card = new XiaoHuoLong();
    const stadium = new TestCard();
    const { player, opponent, state } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.FIRE, CardType.FIRE]);
    player.stadium.cards = [stadium];
    opponent.active.pokemons.cards = [new DummyPokemon('Target', Stage.BASIC, 60)];

    const stadiumEffect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(sim.store, state, stadiumEffect);
    expect(player.stadium.cards.length).toBe(0);
    expect(player.discard.cards).toContain(stadium);

    const damageEffect = new AttackEffect(player, opponent, card.attacks[1]);
    card.reduceEffect(sim.store, state, damageEffect);
    expect(damageEffect.damage).toBe(30);
  });

  it('discards one attached energy for 火恐龙大字爆炎', () => {
    const card = new HuoKongLong();
    const { player, opponent, state } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.FIRE, CardType.FIRE, CardType.FIRE]);
    opponent.active.pokemons.cards = [new DummyPokemon('Target', Stage.BASIC, 100)];

    const selectedEnergy = player.active.energies.cards[0];
    const store = {
      prompt: (promptState: typeof state, currentPrompt: unknown, callback: (result: unknown) => void) => {
        expect(currentPrompt).toBeInstanceOf(ChooseCardsPrompt);
        callback([selectedEnergy]);
        return promptState;
      },
      reduceEffect: sim.store.reduceEffect.bind(sim.store),
    } as any;

    const attackEffect = new AttackEffect(player, opponent, card.attacks[1]);
    card.reduceEffect(store, state, attackEffect);

    expect(attackEffect.damage).toBe(90);
    expect(player.active.energies.cards.length).toBe(2);
    expect(player.discard.cards).toContain(selectedEnergy);
  });

  it('reduces 光辉喷火龙 attack costs and locks 炎爆 next turn', () => {
    const card = new GuangHuiPenHuoLong();
    const { player, state, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.FIRE, CardType.COLORLESS]);
    opponent.prizes[0].cards = [];
    opponent.prizes[1].cards = [];
    opponent.prizes[2].cards = [];
    state.turn = 1;

    const costEffect = new CheckAttackCostEffect(player, card.attacks[0]);
    sim.store.reduceEffect(state, costEffect);
    expect(costEffect.cost.filter(c => c === CardType.COLORLESS).length).toBe(1);

    opponent.active.pokemons.cards = [new DummyPokemon('Defending', Stage.BASIC, 100)];
    const attackEffect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(sim.store, state, attackEffect);
    state.turn = 2;

    expect(() => card.reduceEffect(sim.store, state, new AttackEffect(player, opponent, card.attacks[0]))).toThrow();
  });

  it('attaches up to three basic Fire energies from the deck with 烈炎支配', () => {
    const card = new PenHuoLongEx();
    const { player, state } = TestUtils.getAll(sim);
    const activeBase = new DummyPokemon('火恐龙', Stage.STAGE_1, 100, [CardType.FIRE], '小火龙');
    const benchBase = new DummyPokemon('备用', Stage.BASIC, 70);
    const fireA = TestUtils.makeEnergies([CardType.FIRE])[0];
    const fireB = TestUtils.makeEnergies([CardType.FIRE])[0];
    const fireC = TestUtils.makeEnergies([CardType.FIRE])[0];
    const water = TestUtils.makeEnergies([CardType.WATER])[0];
    let prompt: AttachEnergyPrompt | undefined;

    player.active.pokemons.cards = [activeBase];
    player.bench[0].pokemons.cards = [benchBase];
    player.deck.cards = [fireA, water, fireB, fireC];

    const store = {
      prompt: (promptState: typeof state, currentPrompt: unknown, callback: (result: unknown) => void) => {
        prompt = currentPrompt as AttachEnergyPrompt;
        callback([
          { to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 }, card: fireA },
          { to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 }, card: fireB },
        ]);
        return promptState;
      },
      reduceEffect: sim.store.reduceEffect.bind(sim.store),
    } as any;

    const effect = new PlayPokemonEffect(player, card, player.active);
    card.reduceEffect(store, state, effect);

    expect(prompt).toBeDefined();
    expect(prompt?.cardList).toBe(player.deck);
    expect(prompt?.options.max).toBe(3);
    expect(player.active.energies.cards).toContain(fireA);
    expect(player.bench[0].energies.cards).toContain(fireB);
    expect(player.deck.cards.length).toBe(2);
    expect(player.deck.cards).toContain(water);
    expect(player.deck.cards).toContain(fireC);
  });

  it('scales 喷火龙ex燃烧黑暗 by prizes already taken', () => {
    const card = new PenHuoLongEx();
    const { player, opponent, state } = TestUtils.getAll(sim);

    opponent.prizes[0].cards = [];
    opponent.prizes[1].cards = [];

    const effect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(sim.store, state, effect);

    expect(effect.damage).toBe(240);
  });
});
