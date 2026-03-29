import {
  AttackAction,
  AttackEffect,
  AfterDamageEffect,
  CardType,
  CheckHpEffect,
  CheckProvidedEnergyEffect,
  DealDamageEffect,
  DiscardCardsEffect,
  PlayCardAction,
  PlayPokemonEffect,
  PlayerType,
  ResolvePromptAction,
  SlotType,
  UseAbilityAction,
  UseStadiumAction,
} from '@ptcg/common';

import { setF } from '../../../src/standard/set_f';
import { Artazon } from '../../../src/standard/set_f/artazon';
import { BraveryCharm } from '../../../src/standard/set_f/bravery-charm';
import { DoubleTurboEnergy } from '../../../src/standard/set_f/double-turbo-energy';
import { HuiLiBiaoEnergy } from '../../../src/standard/set_f/hui-li-biao-energy';
import { JetEnergy } from '../../../src/standard/set_f/jet-energy';
import { Kirlia } from '../../../src/standard/set_f/kirlia';
import { PenHuoLongEx } from '../../../src/standard/set_f/pen-huo-long-ex';
import { RotomV } from '../../../src/standard/set_f/rotom-v';
import { VGuardEnergy } from '../../../src/standard/set_f/v-guard-energy';
import { ZhongLiZhongXin } from '../../../src/standard/set_f/zhong-li-zhong-xin';
import { TestCard } from '../../test-cards/test-card';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

function getCard(name: string) {
  const card = setF.find(c => c.name === name);
  expect(card).toBeDefined();
  return card!;
}

describe('set_f bugfix regressions', () => {
  it('lets 奇鲁莉安 use 精炼', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new Kirlia();
    const discardCard = new TestCard();
    const drawA = new TestCard();
    const drawB = new TestCard();
    const { player } = TestUtils.getAll(sim);
    player.bench[0].pokemons.cards = [card];
    player.hand.cards = [discardCard];
    player.deck.cards = [drawA, drawB];

    sim.dispatch(new UseAbilityAction(1, '精炼', {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.BENCH,
      index: 0,
    }));

    const prompt = TestUtils.getLastPrompt(sim) as any;
    sim.dispatch(new ResolvePromptAction(prompt.id, [discardCard]));

    expect(player.discard.cards).toContain(discardCard);
    expect(player.hand.cards).toEqual(jasmine.arrayContaining([drawA, drawB]));
  });

  it('attaches Fire Energy on 恶喷 evolution and boosts 燃烧黑暗', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new PenHuoLongEx();
    const target = new TestPokemon();
    const { player, opponent } = TestUtils.getAll(sim);
    sim.store.state.turn = 1;
    const base = new TestPokemon();
    base.name = '火恐龙';
    player.active.pokemons.cards = [base];
    player.active.pokemonPlayedTurn = 0;
    player.hand.cards = [card];
    player.deck.cards = TestUtils.makeEnergies([CardType.FIRE, CardType.FIRE, CardType.FIRE]);
    opponent.active.pokemons.cards = [target];

    sim.store.reduceEffect(sim.store.state, new PlayPokemonEffect(player, card, player.active));
    const prompt = TestUtils.getLastPrompt(sim) as any;
    sim.dispatch(new ResolvePromptAction(prompt.id, [
      { card: player.deck.cards[0], to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 } },
      { card: player.deck.cards[1], to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 } },
      { card: player.deck.cards[2], to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 } },
    ]));

    expect(player.active.energies.cards.length).toBe(3);

    opponent.prizes[0].cards = [];
    opponent.prizes[1].cards = [];
    sim.dispatch(new AttackAction(1, '燃烧黑暗'));

    expect(opponent.active.damage).toBe(240);
  });

  it('lets 深钵镇 bench a non-rule basic Pokemon', () => {
    const sim = TestUtils.createTestSimulator();
    const stadium = new Artazon();
    const basic = new TestPokemon();
    const { player } = TestUtils.getAll(sim);
    sim.store.state.turn = 1;
    player.stadium.cards = [stadium];
    player.stadiumUsedTurn = 0;
    player.deck.cards = [basic];

    sim.dispatch(new UseStadiumAction(1));
    const prompt = TestUtils.getLastPrompt(sim) as any;
    sim.dispatch(new ResolvePromptAction(prompt.id, [basic]));

    expect(player.bench[0].getPokemonCard()).toBe(basic);
  });

  it('uses real special energy implementations in setF and applies 双重涡轮效果', () => {
    expect(getCard('双重涡轮能量').constructor.name).toBe('DoubleTurboEnergy');
    expect(getCard('喷射能量').constructor.name).toBe('JetEnergy');
    expect(getCard('馈赠能量').constructor.name).toBe('GiftEnergy');
    expect(getCard('薄雾能量').constructor.name).toBe('MistEnergy');
    expect(getCard('遗赠能量').constructor.name).toBe('LegacyEnergy');

    const energy = new DoubleTurboEnergy();
    const sim = TestUtils.createTestSimulator();
    const { player, opponent } = TestUtils.getAll(sim);
    const attacker = new TestPokemon();
    player.active.pokemons.cards = [attacker];
    player.active.energies.cards = [energy];
    opponent.active.pokemons.cards = [new TestPokemon()];

    const check = new CheckProvidedEnergyEffect(player);
    check.source = player.active;
    energy.reduceEffect(sim.store, sim.store.state, check);
    expect(check.energyMap[0].provides).toEqual([CardType.COLORLESS, CardType.COLORLESS]);

    const attack = { name: 'test', cost: [], damage: '100', text: '' };
    const attackEffect = new AttackEffect(player, opponent, attack);
    const dealDamage = new DealDamageEffect(attackEffect, 100);
    energy.reduceEffect(sim.store, sim.store.state, dealDamage);
    expect(dealDamage.damage).toBe(80);
  });

  it('switches the attached bench Pokemon with 喷射能量 from hand', () => {
    const sim = TestUtils.createTestSimulator();
    const energy = new JetEnergy();
    const active = new TestPokemon();
    const bench = new TestPokemon();
    const { player } = TestUtils.getAll(sim);
    sim.store.state.turn = 1;
    player.energyPlayedTurn = 0;
    player.hand.cards = [energy];
    player.active.pokemons.cards = [active];
    player.bench[0].pokemons.cards = [bench];

    sim.dispatch(new PlayCardAction(1, 0, { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 }));
    expect(player.active.getPokemonCard()).toBe(bench);
  });

  it('uses real implementations for 崩塌的竞技场 中立中心 阻碍之塔 V防守能量 回力镖能量', () => {
    expect(getCard('崩塌的竞技场').constructor.name).toBe('BengTaDeJingJiChang');
    expect(getCard('阻碍之塔').constructor.name).toBe('ZuAiZhiTa');
    expect(getCard('中立中心').constructor.name).toBe('ZhongLiZhongXin');
    expect(getCard('V防守能量').constructor.name).toBe('VGuardEnergy');
    expect(getCard('回力镖能量').constructor.name).toBe('HuiLiBiaoEnergy');
  });

  it('prevents damage to non-rule Pokemon from ex and V under 中立中心', () => {
    const sim = TestUtils.createTestSimulator();
    const stadium = new ZhongLiZhongXin(getCard('中立中心') as any);
    const attacker = new RotomV();
    const defender = new TestPokemon();
    const { player, opponent } = TestUtils.getAll(sim);
    player.stadium.cards = [stadium];
    player.active.pokemons.cards = [attacker];
    opponent.active.pokemons.cards = [defender];

    const attack = { name: 'test', cost: [], damage: '100', text: '' };
    const attackEffect = new AttackEffect(player, opponent, attack);
    sim.store.reduceEffect(sim.store.state, new DealDamageEffect(attackEffect, 100));

    expect(opponent.active.damage).toBe(0);
  });

  it('turns off Pokemon Tool effects under 阻碍之塔', () => {
    const sim = TestUtils.createTestSimulator();
    const stadium = getCard('阻碍之塔');
    const charm = new BraveryCharm(getCard('勇气护符') as any);
    const basic = new TestPokemon();
    const { player } = TestUtils.getAll(sim);
    player.stadium.cards = [stadium];
    player.active.pokemons.cards = [basic];
    player.active.trainers.cards = [charm];

    const checkHp = new CheckHpEffect(player, player.active);
    sim.store.reduceEffect(sim.store.state, checkHp);

    expect(checkHp.hp).toBe(basic.hp);
  });

  it('reduces damage from Pokemon V by 30 with V防守能量', () => {
    const sim = TestUtils.createTestSimulator();
    const energy = new VGuardEnergy();
    const attack = { name: 'test', cost: [], damage: '120', text: '' };
    const attacker = new RotomV();
    const defender = new TestPokemon();
    const { player, opponent } = TestUtils.getAll(sim);
    player.active.pokemons.cards = [attacker];
    opponent.active.pokemons.cards = [defender];
    opponent.active.energies.cards = [energy];

    const attackEffect = new AttackEffect(player, opponent, attack);
    const dealDamage = new DealDamageEffect(attackEffect, 120);
    energy.reduceEffect(sim.store, sim.store.state, dealDamage);

    expect(dealDamage.damage).toBe(90);
  });

  it('treats 宝可梦VMAX as Pokemon V for 中立中心 and V防守能量', () => {
    const sim = TestUtils.createTestSimulator();
    const stadium = new ZhongLiZhongXin(getCard('中立中心') as any);
    const energy = new VGuardEnergy();
    const vmax = new TestPokemon() as any;
    const defender = new TestPokemon();
    vmax.rawData = { raw_card: { details: { pokemonTypeLabel: '宝可梦VMAX' } } };

    const { player, opponent } = TestUtils.getAll(sim);
    player.stadium.cards = [stadium];
    player.active.pokemons.cards = [vmax];
    opponent.active.pokemons.cards = [defender];
    opponent.active.energies.cards = [energy];

    const attack = { name: 'test', cost: [], damage: '120', text: '' };
    const attackEffect = new AttackEffect(player, opponent, attack);
    sim.store.reduceEffect(sim.store.state, new DealDamageEffect(attackEffect, 120));

    expect(opponent.active.damage).toBe(0);

    const reducedDamage = new DealDamageEffect(attackEffect, 120);
    energy.reduceEffect(sim.store, sim.store.state, reducedDamage);
    expect(reducedDamage.damage).toBe(90);
  });

  it('reattaches 回力镖能量 after the attack effect discards it', () => {
    const sim = TestUtils.createTestSimulator();
    const energy = new HuiLiBiaoEnergy();
    const attack = { name: 'test', cost: [], damage: '20', text: '' };
    const attacker = new TestPokemon();
    const defender = new TestPokemon();
    const { player, opponent } = TestUtils.getAll(sim);
    player.active.pokemons.cards = [attacker];
    player.active.energies.cards = [energy];
    opponent.active.pokemons.cards = [defender];

    const attackEffect = new AttackEffect(player, opponent, attack);
    const discardEffect = new DiscardCardsEffect(attackEffect, [energy]);
    discardEffect.target = player.active;
    sim.store.reduceEffect(sim.store.state, discardEffect);
    expect(player.discard.cards).toContain(energy);

    energy.reduceEffect(sim.store, sim.store.state, new AfterDamageEffect(attackEffect, 20));

    expect(player.active.energies.cards).toContain(energy);
    expect(player.discard.cards).not.toContain(energy);
  });
});
