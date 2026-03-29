import {
  AttackEffect,
  AttachEnergyPrompt,
  AttackAction,
  CardType,
  PlayerType,
  PokemonCard,
  SlotType,
  Stage,
  Simulator,
} from '@ptcg/common';

import { Miraidon } from '../../../src/standard/set_h/miraidon';
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

  public rawData: any;

  constructor(name: string, specialCardLabel?: string) {
    super();
    this.name = name;
    this.fullName = `${name} TEST`;
    this.stage = Stage.BASIC;
    this.cardTypes = [];
    this.hp = 120;
    this.rawData = {
      raw_card: {
        details: {
          specialCardLabel,
        },
      },
    };
  }
}

describe('Miraidon set_h', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('attaches up to two basic Energy cards from deck only to Future Pokemon with 巅峰加速', () => {
    const card = new Miraidon();
    const futureBench = new DummyPokemon('未来宝可梦', '未来');
    const regularBench = new DummyPokemon('普通宝可梦');
    const lightning = TestUtils.makeEnergies([CardType.LIGHTNING])[0];
    const water = TestUtils.makeEnergies([CardType.WATER])[0];
    const psychic = TestUtils.makeEnergies([CardType.PSYCHIC])[0];
    const { player, opponent, state } = TestUtils.getAll(sim);
    let prompt: AttachEnergyPrompt | undefined;

    player.active.pokemons.cards = [card];
    player.bench[0].pokemons.cards = [futureBench];
    player.bench[1].pokemons.cards = [regularBench];
    player.deck.cards = [lightning, water, psychic];

    const store = {
      prompt: (promptState: typeof state, currentPrompt: unknown, callback: (result: unknown) => void) => {
        prompt = currentPrompt as AttachEnergyPrompt;
        callback([
          { to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 }, card: lightning },
          { to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 }, card: water },
        ]);
        return promptState;
      },
      reduceEffect: sim.store.reduceEffect.bind(sim.store),
    } as any;

    card.reduceEffect(store, state, new AttackEffect(player, opponent, card.attacks[0]));

    expect(prompt).toBeDefined();
    expect(prompt?.cardList).toBe(player.deck);
    expect(prompt?.options.max).toBe(2);
    expect(prompt?.options.blockedTo).toContain(jasmine.objectContaining({
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.BENCH,
      index: 1,
    }));
    expect(player.active.energies.cards).toContain(lightning);
    expect(player.bench[0].energies.cards).toContain(water);
    expect(player.deck.cards).toEqual([psychic]);
  });

  it('deals 160 damage with 电火花攻击', () => {
    const card = new Miraidon();
    const { opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.LIGHTNING, CardType.LIGHTNING, CardType.PSYCHIC]);

    sim.dispatch(new AttackAction(1, '电火花攻击'));

    expect(opponent.active.damage).toBe(160);
  });
});
