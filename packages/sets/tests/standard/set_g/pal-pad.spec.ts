import {
  ChooseCardsPrompt,
  PlayCardAction,
  PlayerType,
  ResolvePromptAction,
  ShowCardsPrompt,
  Simulator,
  SlotType,
  TrainerCard,
  TrainerType,
} from '@ptcg/common';

import { PalPad } from '../../../src/standard/set_g/pal-pad';
import { TestCard } from '../../test-cards/test-card';
import { TestUtils } from '../../test-utils';

class DummySupporter extends TrainerCard {
  public trainerType: TrainerType = TrainerType.SUPPORTER;

  public set: string = 'TEST';

  public name: string;

  public fullName: string;

  public text: string = '';

  constructor(name: string) {
    super();
    this.name = name;
    this.fullName = `${name} TEST`;
  }
}

describe('Pal Pad set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('shuffles up to 2 Supporter cards from discard into deck', () => {
    const palPad = new PalPad();
    const supporterA = new DummySupporter('Supporter A');
    const supporterB = new DummySupporter('Supporter B');
    const nonSupporter = new TestCard();

    const { player } = TestUtils.getAll(sim);
    player.hand.cards = [palPad];
    player.discard.cards = [supporterA, supporterB, nonSupporter];

    expect(() => {
      sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));
    }).not.toThrow();

    const choosePrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(choosePrompt.id, [supporterA, supporterB]));
    }).not.toThrow();

    const showPrompt = TestUtils.getLastPrompt(sim) as ShowCardsPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(showPrompt.id, true));
    }).not.toThrow();

    expect(player.deck.cards).toContain(supporterA);
    expect(player.deck.cards).toContain(supporterB);
    expect(player.discard.cards).toContain(nonSupporter);
    expect(player.discard.cards).toContain(palPad);
  });
});
