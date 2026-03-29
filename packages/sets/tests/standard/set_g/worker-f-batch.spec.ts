import {
  AttackEffect,
  AttackAction,
  AttachEnergyPrompt,
  CardType,
  ChooseCardsPrompt,
  PlayerType,
  ResolvePromptAction,
  SlotType,
  Stage,
  UseAbilityAction,
} from '@ptcg/common';

import { Ditto } from '../../../src/standard/set_g/ditto';
import { Klawf } from '../../../src/standard/set_g/klawf';
import { MiLiLong } from '../../../src/standard/set_g/mi-li-long';
import { Noibat } from '../../../src/standard/set_g/noibat';
import { TestEnergy } from '../../test-cards/test-energy';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

class BasicPokemon extends TestPokemon {
  public stage = Stage.BASIC;
  public name = 'Basic Pokemon';
  public fullName = 'Basic Pokemon TEST';
}

describe('worker F set_g batch', () => {
  it('replaces active 百变怪 with a searched Basic Pokemon on the first turn', () => {
    const sim = TestUtils.createTestSimulator();
    const ditto = new Ditto();
    const target = new BasicPokemon();
    const energy = new TestEnergy(CardType.COLORLESS);
    const { player, state } = TestUtils.getAll(sim);

    state.turn = 1;
    player.active.pokemons.cards = [ditto];
    player.active.energies.cards = [energy];
    player.deck.cards = [target];

    sim.dispatch(new UseAbilityAction(1, '变身启动', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [target]));

    expect(player.active.getPokemonCard()).toBe(target);
    expect(player.discard.cards).toContain(ditto);
    expect(player.discard.cards).toContain(energy);
  });

  it('adds bonus damage for 毛崖蟹 歇斯底里巨钳 while Special Conditioned', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new Klawf();
    const { player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.COLORLESS, CardType.COLORLESS]);
    player.active.specialConditions = ['POISONED' as any];
    opponent.active.pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '歇斯底里巨钳'));

    expect(opponent.active.damage).toBe(190);
  });

  it('deals 40 damage with 嗡蝠 起风', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new Noibat();
    const { opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.PSYCHIC, CardType.DARK]);
    opponent.active.pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '起风'));

    expect(opponent.active.damage).toBe(40);
  });

  it('attaches up to 2 Water Energy to the same Basic Pokemon with 米立龙 预先准备', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new MiLiLong();
    const target = new BasicPokemon();
    const waterA = new TestEnergy(CardType.WATER);
    const waterB = new TestEnergy(CardType.WATER);
    const lightning = new TestEnergy(CardType.LIGHTNING);
    const { player, opponent, state } = TestUtils.getAll(sim);
    let prompt: AttachEnergyPrompt | undefined;

    player.active.pokemons.cards = [card];
    player.bench[0].pokemons.cards = [target];
    player.deck.cards = [waterA, lightning, waterB];

    const store = {
      prompt: (promptState: typeof state, currentPrompt: unknown, callback: (result: unknown) => void) => {
        if (currentPrompt instanceof AttachEnergyPrompt) {
          prompt = currentPrompt;
          callback([
            { to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 }, card: waterA },
            { to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 }, card: waterB },
          ]);
          return promptState;
        }

        callback([]);
        return promptState;
      },
      reduceEffect: sim.store.reduceEffect.bind(sim.store),
    } as any;

    card.reduceEffect(store, state, new AttackEffect(player, opponent, card.attacks[0]));

    expect(prompt).toBeDefined();
    expect(prompt?.options.sameTarget).toBe(true);
    expect(player.bench[0].energies.cards).toEqual([waterA, waterB]);
    expect(player.deck.cards).toEqual([lightning]);
  });

  it('returns itself and attached cards to hand with 米立龙 上弓折返', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new MiLiLong();
    const attached = new TestEnergy(CardType.WATER);
    const { player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.WATER]);
    player.active.energies.cards = [attached];
    opponent.active.pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '上弓折返'));

    expect(opponent.active.damage).toBe(30);
    expect(player.hand.cards).toContain(card);
    expect(player.hand.cards).toContain(attached);
    expect(player.active.pokemons.cards.length).toBe(0);
  });
});
