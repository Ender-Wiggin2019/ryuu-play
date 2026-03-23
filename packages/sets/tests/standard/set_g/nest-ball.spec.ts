import {
  CardType,
  ChooseCardsPrompt,
  PlayCardAction,
  PlayerType,
  PokemonCard,
  ResolvePromptAction,
  Simulator,
  SlotType,
  Stage,
} from '@ptcg/common';

import { NestBall } from '../../../src/standard/set_g/nest-ball';
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

describe('Nest Ball set_g', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('puts a Basic Pokemon from deck onto the Bench', () => {
    const nestBall = new NestBall();
    const pokemon = new DummyBasicPokemon();

    const { player } = TestUtils.getAll(sim);
    player.hand.cards = [nestBall];
    player.deck.cards = [pokemon];

    expect(() => {
      sim.dispatch(
        new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 })
      );
    }).not.toThrow();

    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    expect(() => {
      sim.dispatch(new ResolvePromptAction(prompt.id, [pokemon]));
    }).not.toThrow();

    expect(player.bench[0].pokemons.cards).toEqual([pokemon]);
    expect(player.discard.cards).toContain(nestBall);
    expect(player.deck.cards).not.toContain(pokemon);
  });
});
