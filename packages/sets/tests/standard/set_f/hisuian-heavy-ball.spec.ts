import {
  CardType,
  ChooseCardsPrompt,
  PlayCardAction,
  PlayerType,
  PokemonCard,
  ResolvePromptAction,
  ShowCardsPrompt,
  Simulator,
  SlotType,
  Stage,
} from '@ptcg/common';

import { HisuianHeavyBall } from '../../../src/standard/set_f/hisuian-heavy-ball';
import { TestCard } from '../../test-cards/test-card';
import { TestUtils } from '../../test-utils';

class DummyBasicPokemon extends PokemonCard {
  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 70;

  public weakness = [];

  public retreat = [];

  public set: string = 'TEST';

  public name: string = 'Dummy Basic Pokemon';

  public fullName: string = 'Dummy Basic Pokemon TEST';
}

describe('Hisuian Heavy Ball set_f', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('puts itself into Prize cards and shuffles after taking a Basic Pokemon', () => {
    spyOn(Math, 'random').and.returnValue(0);

    const hisuianHeavyBall = new HisuianHeavyBall();
    const basicPokemon = new DummyBasicPokemon();
    const prizeCardA = new TestCard();
    const prizeCardB = new TestCard();
    const prizeCardC = new TestCard();
    const prizeCardD = new TestCard();
    const prizeCardE = new TestCard();

    const { player } = TestUtils.getAll(sim);
    player.hand.cards = [hisuianHeavyBall];
    player.prizes[0].cards = [basicPokemon];
    player.prizes[1].cards = [prizeCardA];
    player.prizes[2].cards = [prizeCardB];
    player.prizes[3].cards = [prizeCardC];
    player.prizes[4].cards = [prizeCardD];
    player.prizes[5].cards = [prizeCardE];
    player.prizes.forEach(prize => {
      prize.isSecret = true;
    });

    expect(() => {
      sim.dispatch(
        new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 })
      );
    }).not.toThrow();

    const choosePrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(choosePrompt.id, [0]));
    }).not.toThrow();

    const showPrompt = TestUtils.getLastPrompt(sim) as ShowCardsPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(showPrompt.id, true));
    }).not.toThrow();

    expect(player.hand.cards).toContain(basicPokemon);
    expect(player.hand.cards).not.toContain(hisuianHeavyBall);
    expect(player.discard.cards).not.toContain(hisuianHeavyBall);

    const prizesWithHeavyBall = player.prizes.filter(prize => prize.cards.includes(hisuianHeavyBall));
    expect(prizesWithHeavyBall.length).toBe(1);

    // Deterministic shuffle with Math.random = 0
    expect(player.prizes[0].cards[0]).toBe(prizeCardA);
    expect(player.prizes[1].cards[0]).toBe(prizeCardB);
    expect(player.prizes[2].cards[0]).toBe(prizeCardC);
    expect(player.prizes[3].cards[0]).toBe(prizeCardD);
    expect(player.prizes[4].cards[0]).toBe(prizeCardE);
    expect(player.prizes[5].cards[0]).toBe(hisuianHeavyBall);
  });

  it('goes to discard pile when no Basic Pokemon is chosen', () => {
    const hisuianHeavyBall = new HisuianHeavyBall();

    const { player } = TestUtils.getAll(sim);
    player.hand.cards = [hisuianHeavyBall];
    player.prizes.forEach(prize => {
      prize.cards = [new TestCard()];
      prize.isSecret = true;
    });

    expect(() => {
      sim.dispatch(
        new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 })
      );
    }).not.toThrow();

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(prompt.id, null));
    }).not.toThrow();

    expect(player.discard.cards).toContain(hisuianHeavyBall);
    expect(player.prizes.some(prize => prize.cards.includes(hisuianHeavyBall))).toBe(false);
  });
});
