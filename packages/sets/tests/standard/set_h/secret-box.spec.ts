import {
  ChooseCardsPrompt,
  PlayCardAction,
  PlayerType,
  ResolvePromptAction,
  ShowCardsPrompt,
  SlotType,
  Simulator,
  TrainerCard,
  TrainerType,
} from '@ptcg/common';

import { SecretBox } from '../../../src/standard/set_h/secret-box';
import { TestCard } from '../../test-cards/test-card';
import { TestUtils } from '../../test-utils';

class DummyTrainer extends TrainerCard {
  public set: string = 'TEST';

  public name: string;

  public fullName: string;

  public text: string = '';

  constructor(name: string, trainerType: TrainerType) {
    super();
    this.name = name;
    this.fullName = `${name} TEST`;
    this.trainerType = trainerType;
  }
}

describe('Secret Box set_h', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('puts 4 trainer subtypes into hand', () => {
    const secretBox = new SecretBox();
    const discardA = new TestCard();
    const discardB = new TestCard();
    const discardC = new TestCard();

    const item = new DummyTrainer('Item Card', TrainerType.ITEM);
    const tool = new DummyTrainer('Tool Card', TrainerType.TOOL);
    const supporter = new DummyTrainer('Supporter Card', TrainerType.SUPPORTER);
    const stadium = new DummyTrainer('Stadium Card', TrainerType.STADIUM);

    const { player } = TestUtils.getAll(sim);
    player.hand.cards = [secretBox, discardA, discardB, discardC];
    player.deck.cards = [item, tool, supporter, stadium];

    expect(() => {
      sim.dispatch(
        new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 })
      );
    }).not.toThrow();

    const discardPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(discardPrompt).toBeTruthy();
    expect(discardPrompt.options.min).toEqual(3);
    expect(discardPrompt.options.max).toEqual(3);
    expect(() => {
      sim.dispatch(new ResolvePromptAction(discardPrompt.id, [discardA, discardB, discardC]));
    }).not.toThrow();

    const itemPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(itemPrompt.id, [item]));
    }).not.toThrow();

    const toolPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(toolPrompt.id, [tool]));
    }).not.toThrow();

    const supporterPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(supporterPrompt.id, [supporter]));
    }).not.toThrow();

    const stadiumPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(stadiumPrompt.id, [stadium]));
    }).not.toThrow();

    const showPrompt = TestUtils.getLastPrompt(sim) as ShowCardsPrompt;
    expect(showPrompt).toBeTruthy();
    expect(() => {
      sim.dispatch(new ResolvePromptAction(showPrompt.id, true));
    }).not.toThrow();

    expect(player.hand.cards).toContain(item);
    expect(player.hand.cards).toContain(tool);
    expect(player.hand.cards).toContain(supporter);
    expect(player.hand.cards).toContain(stadium);
    expect(player.discard.cards).toContain(secretBox);
    expect(player.discard.cards).toContain(discardA);
    expect(player.discard.cards).toContain(discardB);
    expect(player.discard.cards).toContain(discardC);
  });

  it('can be played and partially resolve when deck misses trainer subtypes', () => {
    const secretBox = new SecretBox();
    const discardA = new TestCard();
    const discardB = new TestCard();
    const discardC = new TestCard();
    const item = new DummyTrainer('Item Card', TrainerType.ITEM);

    const { player } = TestUtils.getAll(sim);
    player.hand.cards = [secretBox, discardA, discardB, discardC];
    player.deck.cards = [item];

    expect(() => {
      sim.dispatch(
        new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 })
      );
    }).not.toThrow();

    const discardPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(discardPrompt.id, [discardA, discardB, discardC]));
    }).not.toThrow();

    const itemPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(itemPrompt.id, [item]));
    }).not.toThrow();

    const showPrompt = TestUtils.getLastPrompt(sim) as ShowCardsPrompt;
    expect(showPrompt).toBeTruthy();
    expect(() => {
      sim.dispatch(new ResolvePromptAction(showPrompt.id, true));
    }).not.toThrow();

    expect(player.hand.cards).toContain(item);
    expect(player.discard.cards).toContain(secretBox);
    expect(player.discard.cards).toContain(discardA);
    expect(player.discard.cards).toContain(discardB);
    expect(player.discard.cards).toContain(discardC);
  });
});
