import {
  AttackAction,
  AttackEffect,
  AttachEnergyPrompt,
  CardType,
  ChooseCardsPrompt,
  ChoosePokemonPrompt,
  PowerEffect,
  PlayerType,
  ResolvePromptAction,
  ShuffleDeckPrompt,
  SlotType,
} from '@ptcg/common';

import { AErZhouSiV } from '../../../src/standard/set_f/a-er-zhou-si-v';
import { AErZhouSiVSTAR } from '../../../src/standard/set_f/a-er-zhou-si-vstar';
import { QiYuanDiYaLuKaV } from '../../../src/standard/set_f/qi-yuan-di-ya-lu-ka-v';
import { QiYuanDiYaLuKaVSTAR } from '../../../src/standard/set_f/qi-yuan-di-ya-lu-ka-vstar';
import { YaoHuoHongHuV } from '../../../src/standard/set_f/yao-huo-hong-hu-v';
import { TestCard } from '../../test-cards/test-card';
import { TestEnergy } from '../../test-cards/test-energy';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

describe('worker C batch set_f', () => {
  it('attaches up to 3 basic Energy cards from deck with 阿尔宙斯V三重蓄能', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new AErZhouSiV();
    const benchVStar = new AErZhouSiVSTAR();
    const lightning = new TestEnergy(CardType.LIGHTNING);
    const water = new TestEnergy(CardType.WATER);
    const psychic = new TestEnergy(CardType.PSYCHIC);
    const { player, opponent, state } = TestUtils.getAll(sim);
    let prompt: AttachEnergyPrompt | undefined;

    player.active.pokemons.cards = [card];
    player.bench[0].pokemons.cards = [benchVStar];
    player.deck.cards = [lightning, water, psychic];

    const store = {
      prompt: (promptState: typeof state, currentPrompt: unknown, callback: (result: unknown) => void) => {
        prompt = currentPrompt as AttachEnergyPrompt;
        callback([
          { to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 }, card: lightning },
          { to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 }, card: water },
          { to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 }, card: psychic },
        ]);
        return promptState;
      },
      reduceEffect: sim.store.reduceEffect.bind(sim.store),
    } as any;

    card.reduceEffect(store, state, new AttackEffect(player, opponent, card.attacks[0]));

    expect(prompt).toBeDefined();
    expect(player.active.energies.cards).toContain(lightning);
    expect(player.bench[0].energies.cards).toEqual([water, psychic]);
    expect(player.deck.cards).toEqual([]);
  });

  it('searches up to 2 cards to hand with 阿尔宙斯VSTAR创世之星', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new AErZhouSiVSTAR();
    const cardA = new TestCard();
    const cardB = new TestCard();
    const cardC = new TestCard();
    const { player, state } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.deck.cards = [cardA, cardB, cardC];
    player.hand.cards = [];

    const store = {
      prompt: (promptState: typeof state, currentPrompt: unknown, callback: (result: unknown) => void) => {
        if (currentPrompt instanceof ChooseCardsPrompt) {
          callback([cardA, cardB]);
        } else if (currentPrompt instanceof ShuffleDeckPrompt) {
          callback([0]);
        }
        return promptState;
      },
      reduceEffect: sim.store.reduceEffect.bind(sim.store),
    } as any;

    card.reduceEffect(store, state, new PowerEffect(player, card.powers[0], card));

    expect(player.hand.cards).toEqual([cardA, cardB]);
    expect(player.deck.cards).toEqual([cardC]);
  });

  it('attaches 2 Steel Energy cards from discard with 起源帝牙卢卡V金属涂层', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new QiYuanDiYaLuKaV();
    const metalA = new TestEnergy(CardType.METAL);
    const metalB = new TestEnergy(CardType.METAL);
    const fire = new TestEnergy(CardType.FIRE);
    const { player, opponent, state } = TestUtils.getAll(sim);

    player.active.pokemons.cards = [card];
    player.discard.cards = [metalA, metalB, fire];

    const store = {
      prompt: (promptState: typeof state, currentPrompt: unknown, callback: (result: unknown) => void) => {
        expect(currentPrompt instanceof ChooseCardsPrompt).toBe(true);
        callback([metalA, metalB]);
        return promptState;
      },
      reduceEffect: sim.store.reduceEffect.bind(sim.store),
    } as any;

    card.reduceEffect(store, state, new AttackEffect(player, opponent, card.attacks[0]));

    expect(player.active.energies.cards).toEqual([metalA, metalB]);
    expect(player.discard.cards).toEqual([fire]);
  });

  it('scales 起源帝牙卢卡VSTAR金属爆破 by attached Steel Energy', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new QiYuanDiYaLuKaVSTAR();
    const { player, opponent, state } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.METAL, CardType.METAL, CardType.METAL]);

    const effect = new AttackEffect(player, opponent, card.attacks[0]);
    card.reduceEffect(sim.store, state, effect);

    expect(effect.damage).toBe(160);
  });

  it('puts 2 energies in the Lost Zone and snipes the Bench with 妖火红狐V魔法烈火', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new YaoHuoHongHuV();
    const opponentBench = new TestPokemon();
    const { player, opponent } = TestUtils.getAll(sim);

    TestUtils.setActive(sim, [card], [CardType.FIRE, CardType.FIRE, CardType.COLORLESS]);
    opponent.bench[0].pokemons.cards = [opponentBench];

    const chosenEnergyA = player.active.energies.cards[0];
    const chosenEnergyB = player.active.energies.cards[1];

    sim.dispatch(new AttackAction(1, '魔法烈火'));

    const chooseEnergyPrompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(chooseEnergyPrompt.id, [chosenEnergyA, chosenEnergyB]));

    const chooseBenchPrompt = TestUtils.getLastPrompt(sim) as ChoosePokemonPrompt;
    sim.dispatch(new ResolvePromptAction(chooseBenchPrompt.id, [opponent.bench[0]]));

    expect(player.lostzone.cards).toEqual([chosenEnergyA, chosenEnergyB]);
    expect(player.active.energies.cards.length).toBe(1);
    expect(opponent.active.damage).toBe(120);
    expect(opponent.bench[0].damage).toBe(120);
  });
});
