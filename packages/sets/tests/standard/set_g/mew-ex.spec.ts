import {
  AttackAction,
  CardTag,
  CardType,
  ChooseAttackPrompt,
  PlayerType,
  ResolvePromptAction,
  Simulator,
  SlotType,
  UseAbilityAction,
} from '@ptcg/common';

import { MewEx } from '../../../src/standard/set_g/mew-ex';
import { TestCard } from '../../test-cards/test-card';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('Mew ex set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('has Pokemon ex tag', () => {
    const mewEx = new MewEx();
    expect(mewEx.tags).toContain(CardTag.POKEMON_EX);
  });

  it('draws until 3 cards with Restart and can only use it once each turn', () => {
    const mewEx = new MewEx();
    const deckA = new TestCard();
    const deckB = new TestCard();
    const deckC = new TestCard();

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [mewEx]);
    player.hand.cards = [];
    player.deck.cards = [deckA, deckB, deckC];

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, 'Restart', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.ACTIVE,
        index: 0,
      }));
    }).not.toThrow();

    expect(player.hand.cards).toEqual([deckA, deckB, deckC]);

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, 'Restart', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.ACTIVE,
        index: 0,
      }));
    }).toThrow();
  });

  it('copies an opponent Active Pokemon attack with Genome Hacking', () => {
    const mewEx = new MewEx();
    const opponentPokemon = new TestPokemon();

    const { opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [mewEx], [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS]);
    opponent.active.pokemons.cards = [opponentPokemon];

    sim.dispatch(new AttackAction(1, 'Genome Hacking'));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseAttackPrompt;
    expect(prompt).toBeTruthy();

    expect(() => {
      sim.dispatch(new ResolvePromptAction(prompt.id, opponentPokemon.attacks[0]));
    }).not.toThrow();

    expect(opponent.active.damage).toEqual(10);
  });
});
