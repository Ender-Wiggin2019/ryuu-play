import { AttackAction, AttackEffect, CardType, EnergyType } from '@ptcg/common';

import { ShuangFuZhanLong } from '../../../src/standard/set_h/shuang-fu-zhan-long';
import { TestEnergy } from '../../test-cards/test-energy';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('双斧战龙 set_h', () => {
  it('Knocks Out the opponent Active when 巨斧劈落 sees Special Energy', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new ShuangFuZhanLong();
    const specialEnergy = new TestEnergy(CardType.COLORLESS);
    specialEnergy.energyType = EnergyType.SPECIAL;
    const { player, opponent, state } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.FIGHTING]);
    TestUtils.setDefending(sim, [new TestPokemon()]);
    opponent.active.energies.cards = [specialEnergy];

    card.reduceEffect(sim.store, state, new AttackEffect(player, opponent, card.attacks[0]));

    expect(opponent.active.damage).toBe(400);
  });

  it('mills the top 3 cards with 龙之波动', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new ShuangFuZhanLong();
    const first = new TestPokemon();
    const second = new TestPokemon();
    const third = new TestPokemon();
    const { player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.FIGHTING, CardType.METAL]);
    opponent.active.pokemons.cards = [new TestPokemon()];
    player.deck.cards = [first, second, third];

    sim.dispatch(new AttackAction(1, '龙之波动'));

    expect(player.discard.cards).toEqual([first, second, third]);
    expect(player.deck.cards.length).toBe(0);
    expect(opponent.active.damage).toBe(230);
  });
});
