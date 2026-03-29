import {
  AttackAction,
  CardType,
  ChooseCardsPrompt,
  PlayerType,
  ResolvePromptAction,
  SlotType,
  SuperType,
  TrainerCard,
  TrainerType,
  UseAbilityAction,
} from '@ptcg/common';

import { EnteiV } from '../../../src/standard/set_f/entei-v';
import { OranguruV } from '../../../src/standard/set_f/oranguru-v';
import { TestCard } from '../../test-cards/test-card';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

class ToolCard extends TrainerCard {
  public trainerType = TrainerType.TOOL;
  public superType = SuperType.TRAINER;
  public set = 'TEST';
  public name = 'Tool';
  public fullName = 'Tool TEST';
  public text = '';
}

describe('worker F set_f batch', () => {
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
    sim.dispatch(new ResolvePromptAction(prompt.id, [toolA, toolB]));

    expect(player.hand.cards).toContain(toolA);
    expect(player.hand.cards).toContain(toolB);
    expect(player.deck.cards).toContain(filler);
  });

  it('draws the top deck card with 炎帝V 瞬步', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new EnteiV();
    const drawCard = new TestCard();
    const { player } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.deck.cards = [drawCard];

    sim.dispatch(new UseAbilityAction(1, '瞬步', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.ACTIVE,
      index: 0,
    }));

    expect(player.hand.cards).toContain(drawCard);
    expect(player.deck.cards).not.toContain(drawCard);
  });

  it('scales 炎帝V 燃烧回旋曲 with both benches', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new EnteiV();
    const { opponent, player } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.FIRE, CardType.COLORLESS]);
    player.bench[0].pokemons.cards = [new TestPokemon()];
    player.bench[1].pokemons.cards = [new TestPokemon()];
    opponent.active.pokemons.cards = [new TestPokemon()];
    opponent.bench[0].pokemons.cards = [new TestPokemon()];

    sim.dispatch(new AttackAction(1, '燃烧回旋曲'));

    expect(opponent.active.damage).toBe(80);
  });
});
