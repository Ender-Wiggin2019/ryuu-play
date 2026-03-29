import {
  AttackAction,
  AttackEffect,
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  DealDamageEffect,
  GamePhase,
  KnockOutEffect,
  PlayerType,
  ResolvePromptAction,
  ShowCardsPrompt,
  SlotType,
  SpecialCondition,
  Stage,
  SuperType,
  UseAbilityAction,
  PokemonCard,
} from '@ptcg/common';

import { FezandipitiEx } from '../../../src/standard/set_h/fezandipiti-ex';
import { IronBundle } from '../../../src/standard/set_h/iron-bundle';
import { IronCrownEx } from '../../../src/standard/set_h/iron-crown-ex';
import { IronLeaves } from '../../../src/standard/set_h/iron-leaves';
import { IronThornsEx } from '../../../src/standard/set_h/iron-thorns-ex';
import { PecharuntEx } from '../../../src/standard/set_h/pecharunt-ex';
import { SandyShocks } from '../../../src/standard/set_h/sandy-shocks';
import { TestUtils } from '../../test-utils';

class DummyPokemon extends PokemonCard {
  public superType = SuperType.POKEMON;

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

describe('pokemon impl3 set_h', () => {
  it('lets 桃歹郎ex switch a benched Dark Pokémon and poison it', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new PecharuntEx();
    const darkBenched = new DummyPokemon('Dark Bench', Stage.BASIC, 70, [CardType.DARK]);
    const other = new DummyPokemon('Other Bench', Stage.BASIC, 70, [CardType.GRASS]);
    const { player } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.bench[0].pokemons.cards = [darkBenched];
    player.bench[1].pokemons.cards = [other];

    sim.dispatch(new UseAbilityAction(1, '支配锁链', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [player.bench[0]]));

    expect(player.active.getPokemonCard()).toBe(darkBenched);
    expect(player.active.specialConditions).toContain(SpecialCondition.POISONED);
  });

  it('scales 桃歹郎ex焦躁爆破 by opponent prize cards already taken', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new PecharuntEx();
    const { player, opponent, state } = TestUtils.getAll(sim);

    opponent.prizes[0].cards = [];
    opponent.prizes[1].cards = [];

    const effect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(sim.store, state, effect);

    expect(effect.damage).toBe(120);
  });

  it('blocks rule-box abilities while 铁荆棘ex is active', () => {
    const sim = TestUtils.createTestSimulator();
    const ironThorns = new IronThornsEx();
    const fez = new FezandipitiEx();
    const { player } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [ironThorns];
    player.bench[0].pokemons.cards = [fez];
    player.marker.addMarker(fez.KNOCKED_OUT_LAST_TURN_MARKER, fez);
    player.deck.cards = [new DummyPokemon('Top Deck', Stage.BASIC, 60)];

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, '化危为吉', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.BENCH,
        index: 0,
      }));
    }).toThrow();
  });

  it('adds 20 damage to future attacks from 铁头壳ex while it is in play', () => {
    const sim = TestUtils.createTestSimulator();
    const ironThorns = new IronThornsEx();
    const ironCrown = new IronCrownEx();
    const defending = new DummyPokemon('Defending', Stage.BASIC, 120);
    const { player, opponent, state } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [ironThorns];
    player.bench[0].pokemons.cards = [ironCrown];
    opponent.active.pokemons.cards = [defending];

    const attackEffect = new AttackEffect(player, opponent, ironThorns.attacks[0]);
    const damageEffect = new DealDamageEffect(attackEffect, 140);
    damageEffect.target = opponent.active;

    ironCrown.reduceEffect(sim.store, state, damageEffect);

    expect(damageEffect.damage).toBe(160);
  });

  it('hits two targets with 铁头壳ex双刃 without weakness or resistance', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new IronCrownEx();
    const active = new DummyPokemon('Active', Stage.BASIC, 100, [CardType.PSYCHIC]);
    active.weakness = [{ type: CardType.PSYCHIC }];
    const bench = new DummyPokemon('Bench', Stage.BASIC, 100, [CardType.PSYCHIC]);
    bench.weakness = [{ type: CardType.PSYCHIC }];
    const { opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.PSYCHIC, CardType.COLORLESS, CardType.COLORLESS]);
    opponent.active.pokemons.cards = [active];
    opponent.bench[0].pokemons.cards = [bench];

    sim.dispatch(new AttackAction(1, '双刃'));

    let prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.active]));

    prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.bench[0]]));

    expect(opponent.active.damage).toBe(50);
    expect(opponent.bench[0].damage).toBe(50);
  });

  it('boosts 铁头壳ex future damage by 20 through the passive ability', () => {
    const sim = TestUtils.createTestSimulator();
    const ironCrown = new IronCrownEx();
    const ironThorns = new IronThornsEx();
    const { player, opponent, state } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [ironThorns];
    player.bench[0].pokemons.cards = [ironCrown];
    opponent.active.pokemons.cards = [new DummyPokemon('Target', Stage.BASIC, 120)];
    player.refreshCardListTargets();
    opponent.refreshCardListTargets();

    const attackEffect = new AttackEffect(player, opponent, ironThorns.attacks[0]);
    const damageEffect = new DealDamageEffect(attackEffect, 140);
    damageEffect.target = opponent.active;

    ironCrown.reduceEffect(sim.store, state, damageEffect);

    expect(damageEffect.damage).toBe(160);
  });

  it('reclaims Pokémon with 铁斑叶 and rewards a last-turn KO with bonus damage', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new IronLeaves();
    const discardA = new DummyPokemon('Discard A', Stage.BASIC, 70);
    const discardB = new DummyPokemon('Discard B', Stage.STAGE_1, 90, [CardType.GRASS], 'Discard A');
    const target = new DummyPokemon('Target', Stage.BASIC, 100);
    const { player, opponent, state } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.GRASS]);
    player.discard.cards = [discardA, discardB];
    opponent.active.pokemons.cards = [target];

    sim.dispatch(new AttackAction(1, '复原网'));

    let prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt | ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [discardA, discardB]));

    let showPrompt = TestUtils.getLastPrompt(sim) as ShowCardsPrompt;
    sim.dispatch(new ResolvePromptAction(showPrompt.id, true));

    expect(player.hand.cards).toEqual(jasmine.arrayContaining([discardA, discardB]));

    state.phase = GamePhase.ATTACK;
    state.activePlayer = 1;
    const koEffect = new KnockOutEffect(player, player.active);
    card.reduceEffect(sim.store, state, koEffect);
    expect(player.marker.hasMarker(card.REVENGE_BLADE_MARKER)).toBe(true);

    const revengeEffect = new AttackEffect(player, opponent, card.attacks[1]);
    card.reduceEffect(sim.store, state, revengeEffect);
    expect(revengeEffect.damage).toBe(160);
  });

  it('adds 120 damage for 爬地翅 when the opponent has a future Pokémon', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new SandyShocks();
    const future = new IronThornsEx();
    const { player, opponent, state } = TestUtils.getAll(sim);

    opponent.active.pokemons.cards = [future];

    const effect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(sim.store, state, effect);

    expect(effect.damage).toBe(140);
    expect(effect.ignoreWeakness).toBe(true);
  });

  it('adds 70 damage for 铁包袱 when three energies are in play', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new IronBundle();
    const target = new DummyPokemon('Target', Stage.BASIC, 120, [CardType.FIGHTING]);
    target.weakness = [{ type: CardType.FIGHTING }];
    const { player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.FIGHTING]);
    player.bench[0].pokemons.cards = [new DummyPokemon('Bench 1', Stage.BASIC, 70)];
    player.bench[0].energies.cards = TestUtils.makeEnergies([CardType.FIGHTING, CardType.FIGHTING]);
    opponent.active.pokemons.cards = [target];

    sim.dispatch(new AttackAction(1, '磁场炸裂'));

    expect(opponent.active.damage).toBe(90);
  });
});
