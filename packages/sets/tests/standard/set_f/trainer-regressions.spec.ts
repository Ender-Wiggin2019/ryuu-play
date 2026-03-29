import {
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  EnergyType,
  PassTurnAction,
  PlayCardAction,
  PlayerType,
  ResolvePromptAction,
  SlotType,
  TrainerCard,
  UseTrainerInPlayAction,
} from '@ptcg/common';

import { setF } from '../../../src/standard/set_f';
import { TestEnergy } from '../../test-cards/test-energy';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

function getCard(name: string) {
  const card = setF.find(c => c.name === name);
  expect(card).toBeDefined();
  return card!;
}

describe('trainer regressions set_f', () => {
  it('ends the turn and discards 招式学习器 临危一击 after use', () => {
    const sim = TestUtils.createTestSimulator();
    const tm = getCard('招式学习器 临危一击') as TrainerCard;
    const { player, opponent, state } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [new TestPokemon()], [
      CardType.COLORLESS,
      CardType.COLORLESS,
      CardType.COLORLESS,
    ], [tm]);
    opponent.prizes.slice(0, 5).forEach(prize => {
      prize.cards = [];
    });

    sim.dispatch(new UseTrainerInPlayAction(1, {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }, '招式学习器 临危一击'));

    expect(player.active.trainers.cards).not.toContain(tm);
    expect(player.discard.cards).toContain(tm);
    expect(state.activePlayer).toBe(1);
  });

  it('ends the turn and discards 招式学习器 能量涡轮 after attaching Energy', () => {
    const sim = TestUtils.createTestSimulator();
    const tm = getCard('招式学习器 能量涡轮') as TrainerCard;
    const attachedEnergy = new TestEnergy(CardType.LIGHTNING);
    const { player, state } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [new TestPokemon()], [CardType.COLORLESS], [tm]);
    player.bench[0].pokemons.cards = [new TestPokemon()];
    player.deck.cards = [attachedEnergy];

    sim.dispatch(new UseTrainerInPlayAction(1, {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }, '招式学习器 能量涡轮'));

    const chooseEnergyPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(chooseEnergyPrompt.id, [attachedEnergy]));

    const choosePokemonPrompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(choosePokemonPrompt.id, [player.bench[0]]));

    expect(player.bench[0].energies.cards).toContain(attachedEnergy);
    expect(player.active.trainers.cards).not.toContain(tm);
    expect(player.discard.cards).toContain(tm);
    expect(state.activePlayer).toBe(1);
  });

  it('discards 招式学习器 at end of turn even if it was not used', () => {
    const sim = TestUtils.createTestSimulator();
    const tm = getCard('招式学习器 临危一击') as TrainerCard;
    const { player, state } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [new TestPokemon()], [], [tm]);

    sim.dispatch(new PassTurnAction(1));

    expect(player.active.trainers.cards).not.toContain(tm);
    expect(player.discard.cards).toContain(tm);
    expect(state.activePlayer).toBe(1);
  });

  it('discards an opponent special Energy when 改造之锤 is played', () => {
    const sim = TestUtils.createTestSimulator();
    const hammer = getCard('改造之锤');
    const specialEnergy = new TestEnergy(CardType.COLORLESS);
    specialEnergy.energyType = EnergyType.SPECIAL;
    const { player, opponent } = TestUtils.getAll(sim);

    player.hand.cards = [hammer];
    opponent.active.energies.cards = [specialEnergy];

    sim.dispatch(new PlayCardAction(1, 0, {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.HAND,
      index: 0,
    }));

    const choosePokemonPrompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(choosePokemonPrompt.id, [opponent.active]));

    const chooseEnergyPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(chooseEnergyPrompt.id, [specialEnergy]));

    expect(opponent.active.energies.cards).not.toContain(specialEnergy);
    expect(opponent.discard.cards).toContain(specialEnergy);
    expect(player.discard.cards).toContain(hammer);
  });

  it('cannot be played when the opponent has no Special Energy in play', () => {
    const sim = TestUtils.createTestSimulator();
    const hammer = getCard('改造之锤');
    const { player, opponent } = TestUtils.getAll(sim);

    player.hand.cards = [hammer];
    opponent.active.energies.cards = [new TestEnergy(CardType.COLORLESS)];

    expect(() => sim.dispatch(new PlayCardAction(1, 0, {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.HAND,
      index: 0,
    }))).toThrow();
    expect(player.hand.cards).toContain(hammer);
    expect(player.discard.cards).not.toContain(hammer);
  });

  it('allows 顶尖捕捉器 when only the opponent has a Benched Pokemon', () => {
    const sim = TestUtils.createTestSimulator();
    const catcher = getCard('顶尖捕捉器');
    const { player, opponent } = TestUtils.getAll(sim);
    const opponentBenchPokemon = new TestPokemon();

    player.hand.cards = [catcher];
    const playerActivePokemon = new TestPokemon();
    player.active.pokemons.cards = [playerActivePokemon];
    player.bench[0].pokemons.cards = [new TestPokemon()];
    player.bench.slice(1).forEach(slot => slot.pokemons.cards = []);
    opponent.active.pokemons.cards = [new TestPokemon()];
    opponent.bench[0].pokemons.cards = [opponentBenchPokemon];

    sim.dispatch(new PlayCardAction(1, 0, {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.HAND,
      index: 0,
    }));

    expect(sim.store.state.prompts.length).toBe(1);
    const choosePokemonPrompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(choosePokemonPrompt.id, [opponent.bench[0]]));

    expect(opponent.active.getPokemonCard()).toBe(opponentBenchPokemon);
    expect(player.active.getPokemonCard()).toBe(playerActivePokemon);
    expect(player.discard.cards).toContain(catcher);
  });
});
