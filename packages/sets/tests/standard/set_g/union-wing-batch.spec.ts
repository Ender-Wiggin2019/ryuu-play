import {
  AttackAction,
  AttackEffect,
  CardType,
  ChooseCardsPrompt,
  PlayCardAction,
  PlayerType,
  ResolvePromptAction,
  ShowCardsPrompt,
  SlotType,
} from '@ptcg/common';

import { DianHaiYan } from '../../../src/standard/set_g/dian-hai-yan';
import { HeiAnYa } from '../../../src/standard/set_g/hei-an-ya';
import { ChanHongHe } from '../../../src/standard/set_g/chan-hong-he';
import { TouYuXiao } from '../../../src/standard/set_h/tou-yu-xiao';
import { TestCard } from '../../test-cards/test-card';
import { TestEnergy } from '../../test-cards/test-energy';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

class DummyBenchSwitchPokemon extends TestPokemon {
  public name = 'Dummy Bench Switch Pokemon';
  public fullName = 'Dummy Bench Switch Pokemon TEST';
}

describe('union wing batch set_g/set_h', () => {
  it('counts discard pile Union Wing attackers for 电海燕', () => {
    const sim = TestUtils.createTestSimulator();
    const attacker = new DianHaiYan();
    const discardA = new HeiAnYa();
    const discardB = new TouYuXiao();
    const { player, opponent } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [attacker];
    player.active.energies.cards = [new TestEnergy(CardType.COLORLESS), new TestEnergy(CardType.COLORLESS)];
    player.discard.cards = [discardA, discardB];
    opponent.active.pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '团结之翼'));

    expect(opponent.active.damage).toBe(40);
  });

  it('switches with a Benched Pokemon using 黑暗鸦旋转折返', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new HeiAnYa();
    const benchPokemon = new DummyBenchSwitchPokemon();
    const { player } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.active.energies.cards = [new TestEnergy(CardType.COLORLESS)];
    player.bench[0].pokemons.cards = [benchPokemon];

    sim.dispatch(new AttackAction(1, '旋转折返'));

    const prompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    expect(prompt).toBeTruthy();

    sim.dispatch(new ResolvePromptAction(prompt.id, [player.bench[0]]));

    expect(player.active.getPokemonCard()).toBe(benchPokemon);
    expect(player.bench[0].getPokemonCard()).toBe(card);
  });

  it('searches up to 3 copies of 缠红鹤 when played from hand', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new ChanHongHe();
    const deckA = new ChanHongHe();
    const deckB = new ChanHongHe();
    const deckC = new ChanHongHe();
    const filler = new TestCard();
    const { player } = TestUtils.getAll(sim);

    player.hand.cards = [card];
    player.deck.cards = [deckA, filler, deckB, deckC];

    sim.dispatch(new PlayCardAction(1, 0, {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.BENCH,
      index: 0,
    }));

    const choosePrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt | undefined;
    expect(choosePrompt).toBeTruthy();

    sim.dispatch(new ResolvePromptAction(choosePrompt.id, [deckA, deckB, deckC]));

    const showPrompt = TestUtils.getLastPrompt(sim) as ShowCardsPrompt | undefined;
    if (showPrompt) {
      sim.dispatch(new ResolvePromptAction(showPrompt.id, true));
    }

    expect(player.hand.cards).toContain(deckA);
    expect(player.hand.cards).toContain(deckB);
    expect(player.hand.cards).toContain(deckC);
    expect(player.deck.cards).toContain(filler);
    expect(player.deck.cards).not.toContain(deckA);
    expect(player.deck.cards).not.toContain(deckB);
    expect(player.deck.cards).not.toContain(deckC);
  });

  it('keeps 利刃之风 at 30 damage and scales 投羽枭团结之翼 from discard', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new TouYuXiao();
    const discardA = new DianHaiYan();
    const discardB = new HeiAnYa();
    const { player, opponent } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.active.energies.cards = [new TestEnergy(CardType.GRASS)];
    player.discard.cards = [discardA, discardB];
    opponent.active.pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '团结之翼'));
    expect(opponent.active.damage).toBe(40);

    const effect = new AttackEffect(player, opponent, card.attacks[1]);
    card.reduceEffect(sim.store, TestUtils.getAll(sim).state, effect);
    expect(effect.damage).toBe(30);
  });
});
