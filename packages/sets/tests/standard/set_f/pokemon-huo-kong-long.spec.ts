import {
  AddSpecialConditionsEffect,
  AttackAction,
  AttackEffect,
  CardType,
  ChooseCardsPrompt,
  ResolvePromptAction,
  SpecialCondition,
} from '@ptcg/common';

import { setF } from '../../../src/standard/set_f';
import { HuoKongLong } from '../../../src/standard/set_f/huo-kong-long';
import { HuoKongLong151C } from '../../../src/standard/set_f/huo-kong-long-151c';
import { HuoKongLongCsv5c } from '../../../src/standard/set_f/huo-kong-long-csv5c';
import { HuoKongLongCs5aC } from '../../../src/standard/set_f/huo-kong-long-cs5ac';
import { TestPokemon } from '../../test-cards/test-pokemon';
import { TestUtils } from '../../test-utils';

function groupByLogicKey() {
  const cards = setF.filter(card => card.name === '火恐龙') as any[];
  const grouped = new Map<string, any[]>();

  cards.forEach(card => {
    const key = card.rawData.logic_group_key;
    const list = grouped.get(key) ?? [];
    list.push(card);
    grouped.set(key, list);
  });

  return { cards, grouped };
}

describe('火恐龙 set_f variants', () => {
  it('registers all F/G/H 火恐龙 logic groups with highest-rarity variants first', () => {
    const { cards, grouped } = groupByLogicKey();

    expect(cards.length).toBe(14);
    expect(grouped.size).toBe(4);

    const firePromos = grouped.get('pokemon:火恐龙:P005:G:hp90:高温冲撞70+self20') ?? [];
    expect(firePromos.map(card => card.rawData.raw_card.id)).toEqual([15981]);
    expect(firePromos[0].rawData.variant_group_size).toBe(1);
    expect(firePromos[0].rawData.variant_group_key).toBe('pokemon:火恐龙:P005:G:hp90:高温冲撞70+self20');

    const cs5aC = grouped.get('pokemon:火恐龙:P005:F:hp90:抓+喷射火焰') ?? [];
    expect(cs5aC.map(card => card.rawData.raw_card.id)).toEqual([9962, 9786]);
    expect(cs5aC[0].rawData.raw_card.details.rarityLabel).toBe('U☆★');
    expect(cs5aC[0].rawData.variant_group_size).toBe(2);
    expect(cs5aC.every(card => card.rawData.variant_group_key === 'pokemon:火恐龙:P005:F:hp90:抓+喷射火焰')).toBeTrue();

    const g151 = grouped.get('pokemon:火恐龙:P005:G:hp100:烈焰20+大字爆炎90') ?? [];
    expect(g151.map(card => card.rawData.raw_card.id)).toEqual([11691, 11552, 11368, 12510, 14018]);
    expect(g151[0].rawData.raw_card.details.rarityLabel).toBe('U★★★');
    expect(g151[0].rawData.variant_group_size).toBe(5);
    expect(g151.every(card => card.rawData.variant_group_key === 'pokemon:火恐龙:P005:G:hp100:烈焰20+大字爆炎90')).toBeTrue();

    const csv5c = grouped.get('pokemon:火恐龙:P005:G:hp90:烈焰50+闪焰之幕') ?? [];
    expect(csv5c.map(card => card.rawData.raw_card.id)).toEqual([14949, 14834, 14672, 16055, 16007, 16932]);
    expect(csv5c[0].rawData.raw_card.details.rarityLabel).toBe('C★★★');
    expect(csv5c[0].rawData.variant_group_size).toBe(6);
    expect(csv5c.every(card => card.rawData.variant_group_key === 'pokemon:火恐龙:P005:G:hp90:烈焰50+闪焰之幕')).toBeTrue();
  });

  it('lets CS5aC 火恐龙喷射火焰 discard one Fire Energy', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new HuoKongLongCs5aC();
    const target = new TestPokemon();
    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.FIRE, CardType.FIRE, CardType.FIRE, CardType.FIRE]);
    opponent.active.pokemons.cards = [target];
    const selectedEnergy = player.active.energies.cards[0];

    sim.dispatch(new AttackAction(1, '喷射火焰'));
    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [selectedEnergy]));

    expect(opponent.active.damage).toBe(100);
    expect(player.discard.cards).toContain(selectedEnergy);
    expect(player.active.energies.cards.length).toBe(3);
  });

  it('lets 151C 火恐龙大字爆炎 discard one Fire Energy', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new HuoKongLong151C();
    const target = new TestPokemon();
    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.FIRE, CardType.FIRE, CardType.FIRE, CardType.FIRE]);
    opponent.active.pokemons.cards = [target];
    const selectedEnergy = player.active.energies.cards[0];

    sim.dispatch(new AttackAction(1, '大字爆炎'));
    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [selectedEnergy]));

    expect(opponent.active.damage).toBe(90);
    expect(player.discard.cards).toContain(selectedEnergy);
    expect(player.active.energies.cards.length).toBe(3);
  });

  it('blocks opponent attack special conditions with 闪焰之幕', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new HuoKongLongCsv5c();
    const { player, opponent } = TestUtils.getAll(sim);
    player.active.pokemons.cards = [card];
    opponent.active.pokemons.cards = [new TestPokemon()];

    const attack = { name: 'test', cost: [], damage: '0', text: '' };
    const attackEffect = new AttackEffect(opponent, player, attack);
    const specialConditionEffect = new AddSpecialConditionsEffect(attackEffect, [SpecialCondition.CONFUSED]);
    specialConditionEffect.target = player.active;

    sim.store.reduceEffect(sim.store.state, specialConditionEffect);

    expect(specialConditionEffect.preventDefault).toBeTrue();
    expect(player.active.specialConditions).toEqual([]);
  });

  it('exposes the promo 火恐龙 as a unique variant group', () => {
    const card = new HuoKongLong();

    expect(card.rawData.logic_group_key).toBe('pokemon:火恐龙:P005:G:hp90:高温冲撞70+self20');
    expect(card.rawData.variant_group_key).toBe('pokemon:火恐龙:P005:G:hp90:高温冲撞70+self20');
    expect(card.rawData.variant_group_size).toBe(1);
  });
});
