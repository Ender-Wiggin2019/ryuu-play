import {
  AttackAction,
  AttackEffect,
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  KnockOutEffect,
  PlayerType,
  ResolvePromptAction,
  Simulator,
  SlotType,
  UseAttackEffect,
  UseAbilityAction,
} from '@ptcg/common';

import { GiantHearth } from '../../../src/standard/set-sword-and-shield/giant-hearth';
import { OriginFormePalkiaV } from '../../../src/standard/set-sword-and-shield/origin-forme-palkia-v';
import { OriginFormePalkiaVSTAR } from '../../../src/standard/set-sword-and-shield/origin-forme-palkia-vstar';
import { TestCard } from '../../test-cards/test-card';
import { TestEnergy } from '../../test-cards/test-energy';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('Origin Forme Palkia V / VSTAR set-sword-and-shield', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('gives up 2 Prize cards when V or VSTAR is Knocked Out', () => {
    const palkiaV = new OriginFormePalkiaV();
    const palkiaVstar = new OriginFormePalkiaVSTAR();
    const { state, opponent } = TestUtils.getAll(sim);

    TestUtils.setDefending(sim, [palkiaV]);
    const vEffect = new KnockOutEffect(opponent, opponent.active);
    sim.store.reduceEffect(state, vEffect);
    expect(vEffect.prizeCount).toBe(2);

    TestUtils.setDefending(sim, [palkiaVstar]);
    const vstarEffect = new KnockOutEffect(opponent, opponent.active);
    sim.store.reduceEffect(state, vstarEffect);
    expect(vstarEffect.prizeCount).toBe(2);
  });

  it('can use Star Portal only once per game', () => {
    const palkiaVstar = new OriginFormePalkiaVSTAR();
    const waterA = new TestEnergy(CardType.WATER);
    const waterB = new TestEnergy(CardType.WATER);

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [palkiaVstar]);
    player.discard.cards = [waterA, waterB];

    sim.dispatch(new UseAbilityAction(1, 'Star Portal', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    const chooseCardsPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(chooseCardsPrompt.id, [waterA]));

    const choosePokemonPrompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(choosePokemonPrompt.id, [player.active]));

    expect(player.active.energies.cards).toContain(waterA);

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, 'Star Portal', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.ACTIVE,
        index: 0,
      }));
    }).toThrow();
  });

  it('shares the VSTAR Power usage limit across multiple VSTAR Pokemon', () => {
    const activePalkiaVstar = new OriginFormePalkiaVSTAR();
    const benchedPalkiaVstar = new OriginFormePalkiaVSTAR();
    const waterA = new TestEnergy(CardType.WATER);

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [activePalkiaVstar]);
    player.bench[0].pokemons.cards = [benchedPalkiaVstar];
    player.discard.cards = [waterA];

    sim.dispatch(new UseAbilityAction(1, 'Star Portal', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    const chooseCardsPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(chooseCardsPrompt.id, [waterA]));

    const choosePokemonPrompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(choosePokemonPrompt.id, [player.active]));

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, 'Star Portal', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.BENCH,
        index: 0,
      }));
    }).toThrow();
  });

  it('searches a Stadium card with Rule the Region', () => {
    const palkiaV = new OriginFormePalkiaV();
    const giantHearth = new GiantHearth();
    const deckCard = new TestCard();

    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [palkiaV], [CardType.WATER]);
    player.deck.cards = [deckCard, giantHearth];
    player.hand.cards = [];

    sim.dispatch(new AttackAction(1, 'Rule the Region'));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [giantHearth]));

    expect(player.hand.cards).toContain(giantHearth);
  });

  it('adds bench based damage for Subspace Swell', () => {
    const palkiaVstar = new OriginFormePalkiaVSTAR();
    const { player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [palkiaVstar], [CardType.WATER, CardType.WATER]);
    player.bench[0].pokemons.cards = [new TestPokemon()];
    player.bench[1].pokemons.cards = [new TestPokemon()];
    opponent.bench[0].pokemons.cards = [new TestPokemon()];
    opponent.bench[1].pokemons.cards = [new TestPokemon()];
    opponent.bench[2].pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, 'Subspace Swell'));

    expect(opponent.active.damage).toBe(160);
  });

  it('blocks Hydro Break on the next turn after use', () => {
    const palkiaV = new OriginFormePalkiaV();
    const { player, opponent, state } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [palkiaV], [CardType.WATER, CardType.WATER, CardType.COLORLESS]);
    opponent.active.pokemons.cards = [new TestPokemon()];

    const attackEffect = new AttackEffect(player, opponent, palkiaV.attacks[1]);
    palkiaV.reduceEffect(sim.store, state, attackEffect);

    const blockedAttack = new UseAttackEffect(player, palkiaV.attacks[1]);
    expect(() => palkiaV.reduceEffect(sim.store, state, blockedAttack)).toThrow();
  });
});
