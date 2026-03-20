import {
  GamePhase,
  KnockOutEffect,
  Player,
  State,
  StoreLike,
} from '@ptcg/common';

import { LegacyEnergy } from '../../../src/standard/set_h/legacy-energy';

describe('Legacy Energy set_h', () => {
  function createAttackKoState() {
    const state = new State();
    const attacker = new Player();
    const defender = new Player();

    attacker.id = 1;
    defender.id = 2;

    state.players = [attacker, defender];
    state.phase = GamePhase.ATTACK;
    state.activePlayer = 0;

    return { state, attacker, defender };
  }

  it('reduces the taken prize by 1 when defender is KOed by opponent attack damage', () => {
    const legacyEnergy = new LegacyEnergy();
    const { state, defender } = createAttackKoState();
    defender.active.energies.cards = [legacyEnergy];

    const effect = new KnockOutEffect(defender, defender.active);
    legacyEnergy.reduceEffect({} as StoreLike, state, effect);

    expect(effect.prizeCount).toBe(0);
    expect(defender.marker.hasMarker(legacyEnergy.LEGACY_ENERGY_MARKER)).toBe(true);
  });

  it('applies the prize reduction only once per game', () => {
    const firstLegacyEnergy = new LegacyEnergy();
    const secondLegacyEnergy = new LegacyEnergy();
    const { state, defender } = createAttackKoState();
    defender.active.energies.cards = [firstLegacyEnergy];

    const firstEffect = new KnockOutEffect(defender, defender.active);
    firstLegacyEnergy.reduceEffect({} as StoreLike, state, firstEffect);
    expect(firstEffect.prizeCount).toBe(0);

    defender.active.energies.cards = [secondLegacyEnergy];

    const secondEffect = new KnockOutEffect(defender, defender.active);
    secondLegacyEnergy.reduceEffect({} as StoreLike, state, secondEffect);
    expect(secondEffect.prizeCount).toBe(1);
  });

  it('does not reduce prizes when KO is on the attacking player side', () => {
    const legacyEnergy = new LegacyEnergy();
    const { state, attacker } = createAttackKoState();
    attacker.active.energies.cards = [legacyEnergy];

    const effect = new KnockOutEffect(attacker, attacker.active);
    legacyEnergy.reduceEffect({} as StoreLike, state, effect);

    expect(effect.prizeCount).toBe(1);
    expect(attacker.marker.hasMarker(legacyEnergy.LEGACY_ENERGY_MARKER)).toBe(false);
  });

  it('does not reduce prizes outside of the attack phase', () => {
    const legacyEnergy = new LegacyEnergy();
    const { state, defender } = createAttackKoState();
    defender.active.energies.cards = [legacyEnergy];
    state.phase = GamePhase.BETWEEN_TURNS;

    const effect = new KnockOutEffect(defender, defender.active);
    legacyEnergy.reduceEffect({} as StoreLike, state, effect);

    expect(effect.prizeCount).toBe(1);
    expect(defender.marker.hasMarker(legacyEnergy.LEGACY_ENERGY_MARKER)).toBe(false);
  });
});
