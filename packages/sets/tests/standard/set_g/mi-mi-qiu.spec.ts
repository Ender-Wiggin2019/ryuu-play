import {
  AddSpecialConditionsEffect,
  AttackEffect,
  CardType,
  DealDamageEffect,
  SpecialCondition,
} from '@ptcg/common';

import { AErZhouSiV } from '../../../src/standard/set_f/a-er-zhou-si-v';
import { MiMiQiu } from '../../../src/standard/set_g/mi-mi-qiu';
import { TestUtils } from '../../test-utils';

describe('谜拟丘 set_g', () => {
  it('blocks damage from opposing Pokémon ex/V attacks with 神秘守护', () => {
    const sim = TestUtils.createTestSimulator();
    const mimikyu = new MiMiQiu();
    const attacker = new AErZhouSiV();
    const { player, opponent, state } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [mimikyu];
    opponent.active.pokemons.cards = [attacker];

    const attackEffect = new AttackEffect(opponent, player, attacker.attacks[1]);
    const damageEffect = new DealDamageEffect(attackEffect, 130);
    damageEffect.target = player.active;

    mimikyu.reduceEffect(sim.store, state, damageEffect);

    expect(damageEffect.preventDefault).toBe(true);

    const statusEffect = new AddSpecialConditionsEffect(attackEffect, [SpecialCondition.CONFUSED]);
    statusEffect.target = player.active;
    mimikyu.reduceEffect(sim.store, state, statusEffect);

    expect(statusEffect.preventDefault).toBe(false);
  });
});

