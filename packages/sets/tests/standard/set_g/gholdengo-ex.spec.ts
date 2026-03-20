import {
  AttackAction,
  CardType,
  ChooseCardsPrompt,
  PlayCardAction,
  PlayerType,
  ResolvePromptAction,
  Simulator,
  SlotType,
  UseAbilityAction,
} from '@ptcg/common';

import { GholdengoEx } from '../../../src/standard/set_g/gholdengo-ex';
import { Gimmighoul } from '../../../src/standard/set_g/gimmighoul';
import { Gimmighoul2 } from '../../../src/standard/set_g/gimmighoul2';
import { TestCard } from '../../test-cards/test-card';
import { TestEnergy } from '../../test-cards/test-energy';
import { TestUtils } from '../../test-utils';

describe('Gholdengo ex set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('draws 2 cards when Coin Bonus is used in the Active Spot', () => {
    const gholdengo = new GholdengoEx();
    const deckA = new TestCard();
    const deckB = new TestCard();
    const deckC = new TestCard();

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [gholdengo]);
    player.hand.cards = [];
    player.deck.cards = [deckA, deckB, deckC];

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, 'Coin Bonus', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.ACTIVE,
        index: 0,
      }));
    }).not.toThrow();

    expect(player.hand.cards.length).toEqual(2);

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, 'Coin Bonus', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.ACTIVE,
        index: 0,
      }));
    }).toThrow();
  });

  it('discards selected basic Energy cards for Make It Rain', () => {
    const gholdengo = new GholdengoEx();
    const energyA = new TestEnergy(CardType.FIRE);
    const energyB = new TestEnergy(CardType.WATER);
    const handCard = new TestCard();

    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [gholdengo], [CardType.METAL]);
    player.hand.cards = [energyA, energyB, handCard];

    sim.dispatch(new AttackAction(1, 'Make It Rain'));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(prompt).toBeTruthy();
    expect(prompt.options.min).toEqual(0);
    expect(prompt.options.max).toEqual(2);

    expect(() => {
      sim.dispatch(new ResolvePromptAction(prompt.id, [energyA, energyB]));
    }).not.toThrow();

    expect(player.discard.cards).toContain(energyA);
    expect(player.discard.cards).toContain(energyB);
    expect(opponent.active.damage).toEqual(100);
  });

  it('can evolve from Gimmighoul', () => {
    const gholdengo = new GholdengoEx();
    const gimmighoul = new Gimmighoul();

    const { state, player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [gimmighoul]);
    state.turn = 2;
    player.active.pokemonPlayedTurn = 1;
    player.hand.cards = [gholdengo];

    expect(() => {
      sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 }));
    }).not.toThrow();

    expect(player.active.getPokemonCard()).toBe(gholdengo);
  });

  it('can evolve from Gimmighoul 2', () => {
    const gholdengo = new GholdengoEx();
    const gimmighoul2 = new Gimmighoul2();

    const { state, player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [gimmighoul2]);
    state.turn = 2;
    player.active.pokemonPlayedTurn = 1;
    player.hand.cards = [gholdengo];

    expect(() => {
      sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 }));
    }).not.toThrow();

    expect(player.active.getPokemonCard()).toBe(gholdengo);
  });
});
