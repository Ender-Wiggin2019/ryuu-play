import {
  AttackAction,
  CardType,
  ChoosePokemonPrompt,
  PlayerType,
  ResolvePromptAction,
  Simulator,
  SlotType,
  UseAbilityAction,
} from '@ptcg/common';

import { FezandipitiEx } from '../../../src/standard/set_h/fezandipiti-ex';
import { TestCard } from '../../test-cards/test-card';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

class DarkWeakPokemon extends TestPokemon {
  public weakness = [{ type: CardType.DARK }];
}

describe('Fezandipiti ex set_h', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('draws 3 cards with 化危为吉 only once per turn', () => {
    const fezandipitiEx = new FezandipitiEx();
    const topA = new TestCard();
    const topB = new TestCard();
    const topC = new TestCard();
    const topD = new TestCard();

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [new TestPokemon()]);
    player.bench[0].pokemons.cards = [fezandipitiEx];
    player.hand.cards = [];
    player.deck.cards = [topA, topB, topC, topD];
    player.marker.addMarker(fezandipitiEx.KNOCKED_OUT_LAST_TURN_MARKER, fezandipitiEx);

    sim.dispatch(new UseAbilityAction(1, '化危为吉', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.BENCH,
      index: 0,
    }));

    expect(player.hand.cards).toEqual([topA, topB, topC]);

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, '化危为吉', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.BENCH,
        index: 0,
      }));
    }).toThrow();
  });

  it('places 100 damage on a chosen opposing Pokemon with 残忍箭矢', () => {
    const fezandipitiEx = new FezandipitiEx();
    const opponentBench = new TestPokemon();

    const { opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [fezandipitiEx], [CardType.DARK, CardType.DARK, CardType.DARK]);
    opponent.bench[0].pokemons.cards = [opponentBench];

    sim.dispatch(new AttackAction(1, '残忍箭矢'));

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(prompt).toBeTruthy();
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.bench[0]]));

    expect(opponent.bench[0].damage).toEqual(100);
    expect(opponent.active.damage).toEqual(0);
  });

  it('applies weakness when 残忍箭矢 targets opponent active', () => {
    const fezandipitiEx = new FezandipitiEx();
    const opponentActive = new DarkWeakPokemon();
    const { opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [fezandipitiEx], [CardType.DARK, CardType.DARK, CardType.DARK]);
    opponent.active.pokemons.cards = [opponentActive];

    sim.dispatch(new AttackAction(1, '残忍箭矢'));
    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(prompt).toBeTruthy();
    sim.dispatch(new ResolvePromptAction(prompt.id, [opponent.active]));

    expect(opponent.active.damage).toEqual(200);
  });
});
