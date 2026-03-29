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
  TrainerType,
} from '@ptcg/common';

import { setF } from '../../../src/standard/set_f';
import { BuddyBuddyPoffin } from '../../../src/standard/set_f/buddy-buddy-poffin';
import { CapturingAroma } from '../../../src/standard/set_f/capturing-aroma';
import { PokeBall } from '../../../src/standard/set_f/poke-ball';
import { TestUtils } from '../../test-utils';

class DummyPokemon extends PokemonCard {
  public stage: Stage;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number;

  public weakness = [];

  public retreat = [];

  public set: string = 'TEST';

  public name: string;

  public fullName: string;

  public evolvesFrom = '';

  constructor(name: string, stage: Stage, hp: number, evolvesFrom = '') {
    super();
    this.name = name;
    this.stage = stage;
    this.hp = hp;
    this.fullName = `${name} TEST`;
    this.evolvesFrom = evolvesFrom;
  }
}

describe('set_f trainer overrides', () => {
  it('replaces generated empty trainers with real card implementations', () => {
    const pokeBall = setF.find(card => card.name === '精灵球');
    const poffin = setF.find(card => card.name === '友好宝芬');
    const aroma = setF.find(card => card.name === '捕获香氛');

    expect(pokeBall).toBeInstanceOf(PokeBall);
    expect(poffin).toBeInstanceOf(BuddyBuddyPoffin);
    expect(aroma).toBeInstanceOf(CapturingAroma);
    expect((pokeBall as any).trainerType).toBe(TrainerType.ITEM);
  });
});

describe('PokeBall set_f', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('searches for a Pokemon on heads', () => {
    const pokeBall = new PokeBall({
      set: 'set_g',
      name: '精灵球',
      fullName: '精灵球 TEST',
      text: '抛掷1次硬币如果为正面，则选择自己牌库中的1张宝可梦，在给对手看过之后，加入手牌。并重洗牌库。',
      trainerType: TrainerType.ITEM,
      rawData: {
        raw_card: { id: 1, name: '精灵球' },
        image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/26/46.png'
      }
    });
    const target = new DummyPokemon('Target', Stage.BASIC, 60);

    const { player } = TestUtils.getAll(sim);
    player.hand.cards = [pokeBall];
    player.deck.cards = [target];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));

    const choosePrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(choosePrompt.id, [target]));

    expect(player.hand.cards).toContain(target);
    expect(player.discard.cards).toContain(pokeBall);
  });
});

describe('BuddyBuddyPoffin set_f', () => {
  let sim: Simulator;

  beforeEach(() => {
    sim = TestUtils.createTestSimulator();
  });

  it('puts up to 2 eligible Basic Pokemon onto the Bench', () => {
    const poffin = new BuddyBuddyPoffin({
      set: 'set_h',
      name: '友好宝芬',
      fullName: '友好宝芬 TEST',
      text: '选择自己牌库中，最多2张HP在「70」及以下的【基础】宝可梦，放于备战区。并重洗牌库。',
      trainerType: TrainerType.ITEM,
      rawData: {
        raw_card: { id: 2, name: '友好宝芬' },
        image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/25/50.png'
      }
    });
    const eligibleA = new DummyPokemon('Eligible A', Stage.BASIC, 60);
    const ineligible = new DummyPokemon('Ineligible', Stage.BASIC, 90);
    const eligibleB = new DummyPokemon('Eligible B', Stage.BASIC, 70);

    const { player } = TestUtils.getAll(sim);
    player.hand.cards = [poffin];
    player.deck.cards = [eligibleA, ineligible, eligibleB];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));

    const choosePrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(choosePrompt.id, [eligibleA, eligibleB]));

    expect(player.bench[0].pokemons.cards).toEqual([eligibleA]);
    expect(player.bench[1].pokemons.cards).toEqual([eligibleB]);
    expect(player.discard.cards).toContain(poffin);
  });
});

describe('CapturingAroma set_f', () => {
  it('searches for an Evolution Pokemon on heads', () => {
    const sim = TestUtils.createTestSimulator();
    const aroma = new CapturingAroma({
      set: 'set_f',
      name: '捕获香氛',
      fullName: '捕获香氛 TEST',
      text: '抛掷1次硬币。如果为正面则从自己牌库中选择1张进化宝可梦，如果为反面则从自己牌库中选择1张【基础】宝可梦，在给对手看过之后，加入手牌。并重洗牌库。',
      trainerType: TrainerType.ITEM,
      rawData: {
        raw_card: { id: 3, name: '捕获香氛' },
        image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/24/50.png'
      }
    });
    const basic = new DummyPokemon('Basic', Stage.BASIC, 60);
    const evolution = new DummyPokemon('Evolution', Stage.STAGE_1, 90, 'Basic');

    const { player } = TestUtils.getAll(sim);
    player.hand.cards = [aroma];
    player.deck.cards = [basic, evolution];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));

    const choosePrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(choosePrompt.id, [evolution]));

    expect(player.hand.cards).toContain(evolution);
    expect(player.discard.cards).toContain(aroma);
  });

  it('searches for a Basic Pokemon on tails', () => {
    const sim = TestUtils.createTailsTestSimulator();
    const aroma = new CapturingAroma({
      set: 'set_f',
      name: '捕获香氛',
      fullName: '捕获香氛 TEST',
      text: '抛掷1次硬币。如果为正面则从自己牌库中选择1张进化宝可梦，如果为反面则从自己牌库中选择1张【基础】宝可梦，在给对手看过之后，加入手牌。并重洗牌库。',
      trainerType: TrainerType.ITEM,
      rawData: {
        raw_card: { id: 4, name: '捕获香氛' },
        image_url: 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/22/42.png'
      }
    });
    const basic = new DummyPokemon('Basic', Stage.BASIC, 60);
    const evolution = new DummyPokemon('Evolution', Stage.STAGE_1, 90, 'Basic');

    const { player } = TestUtils.getAll(sim);
    player.hand.cards = [aroma];
    player.deck.cards = [basic, evolution];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.HAND, index: 0 }));

    const choosePrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(choosePrompt.id, [basic]));

    expect(player.hand.cards).toContain(basic);
    expect(player.discard.cards).toContain(aroma);
  });
});
