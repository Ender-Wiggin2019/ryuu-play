import {
  ChooseCardsPrompt,
  PlayerType,
  ResolvePromptAction,
  SlotType,
  SuperType,
  TrainerCard,
  TrainerType,
  UseAbilityAction,
} from '@ptcg/common';

import { OranguruV } from '../../../src/standard/set_f/oranguru-v';
import { TestCard } from '../../test-cards/test-card';
import { TestUtils } from '../../test-utils';

class ToolCard extends TrainerCard {
  public trainerType = TrainerType.TOOL;
  public superType = SuperType.TRAINER;
  public set = 'TEST';
  public name = 'Tool';
  public fullName = 'Tool TEST';
  public text = '';
}

describe('worker E set_f batch', () => {
  it('lets 智挥猩V search up to 2 Pokemon Tools with 预订', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new OranguruV();
    const toolA = new ToolCard();
    const toolB = new ToolCard();
    const filler = new TestCard();
    const { player } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.hand.cards = [];
    player.deck.cards = [toolA, filler, toolB];

    sim.dispatch(new UseAbilityAction(1, '预订', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(prompt).toBeTruthy();

    sim.dispatch(new ResolvePromptAction(prompt.id, [toolA, toolB]));

    expect(player.hand.cards).toContain(toolA);
    expect(player.hand.cards).toContain(toolB);
    expect(player.deck.cards).toContain(filler);

    expect(() => {
      sim.dispatch(new UseAbilityAction(1, '预订', {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.ACTIVE,
        index: 0,
      }));
    }).toThrow();
  });
});
