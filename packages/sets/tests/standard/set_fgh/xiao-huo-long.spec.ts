import {
  AttackAction,
  CardType,
  ChooseCardsPrompt,
  PokemonCard,
  ResolvePromptAction,
  Stage,
} from '@ptcg/common';

import { TestCard } from '../../test-cards/test-card';
import { TestUtils } from '../../test-utils';
import { setFgh } from '../../../src/standard/set_fgh';
import { XiaoHuoLong, XiaoHuoLongCs5aC, XiaoHuoLongCsv5C } from '../../../src/standard/set_fgh/xiao-huo-long';

class DummyPokemon extends PokemonCard {
  public stage: Stage = Stage.BASIC;
  public cardTypes: CardType[] = [];
  public hp = 60;
  public weakness = [];
  public resistance = [];
  public retreat = [];
  public set = 'TEST';
  public name = 'Target';
  public fullName = 'Target TEST';
  public evolvesFrom = '';
  public attacks = [];
  public powers = [];
}

function getGroupKey(card: PokemonCard): string {
  return ((card.rawData || {}) as any).logic_group_key || ((card.rawData || {}) as any).variant_group_key || card.fullName;
}

describe('xiao-huo-long set_fgh', () => {
  it('registers all F/G same-name variants with separate logic groups', () => {
    const cards = setFgh.filter(card => card.name === '小火龙');
    const fullNames = cards.map(card => card.fullName);

    expect(cards.length).toBe(13);
    expect(fullNames).toContain('小火龙 152/151#11515');
    expect(fullNames).toContain('小火龙 004/151#11367');
    expect(fullNames).toContain('小火龙 090/049#14017');
    expect(fullNames).toContain('小火龙 012/177#12509');
    expect(fullNames).toContain('小火龙 004/151#11690');
    expect(fullNames).toContain('小火龙 004/151#11551');
    expect(fullNames).toContain('小火龙 001/033#16931');
    expect(fullNames).toContain('小火龙 001/127#9961');
    expect(fullNames).toContain('小火龙 001/127#9785');
    expect(fullNames).toContain('小火龙 014/129#14948');
    expect(fullNames).toContain('小火龙 014/129#14833');
    expect(fullNames).toContain('小火龙 014/129#14671');
    expect(fullNames).toContain('小火龙 098/SV-P#15463');

    const groups = new Map<string, PokemonCard[]>();
    for (const card of cards) {
      const key = getGroupKey(card as PokemonCard);
      const group = groups.get(key) || [];
      group.push(card as PokemonCard);
      groups.set(key, group);
    }

    expect(new Set(cards.map(card => (card.rawData as any).logic_group_key)).size).toBe(3);
    expect(new Set(cards.map(card => (card.rawData as any).variant_group_key)).size).toBe(3);

    const burnStadiumGroup = groups.get('pokemon:xiao-huo-long:burn-stadium');
    const burningTailGroup = groups.get('pokemon:xiao-huo-long:burning-tail');
    const highTempGroup = groups.get('pokemon:xiao-huo-long:high-temp');

    expect(burnStadiumGroup?.map(card => card.fullName)).toEqual([
      '小火龙 152/151#11515',
      '小火龙 004/151#11367',
      '小火龙 090/049#14017',
      '小火龙 012/177#12509',
      '小火龙 004/151#11690',
      '小火龙 004/151#11551',
      '小火龙 001/033#16931',
    ]);
    expect(burningTailGroup?.map(card => card.fullName)).toEqual([
      '小火龙 001/127#9961',
      '小火龙 001/127#9785',
    ]);
    expect(highTempGroup?.map(card => card.fullName)).toEqual([
      '小火龙 014/129#14948',
      '小火龙 014/129#14833',
      '小火龙 014/129#14671',
      '小火龙 098/SV-P#15463',
    ]);
    expect(burnStadiumGroup?.some(card => card.fullName === '小火龙 152/151#11515')).toBeTrue();
    expect(burningTailGroup?.some(card => card.fullName === '小火龙 001/127#9961')).toBeTrue();
    expect(highTempGroup?.some(card => card.fullName === '小火龙 014/129#14948')).toBeTrue();
  });

  it('lets 小火龙 discard the stadium in play', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new XiaoHuoLong();
    const stadium = new TestCard();
    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.FIRE]);
    player.stadium.cards = [stadium];

    sim.dispatch(new AttackAction(1, '烧光'));

    expect(player.stadium.cards.length).toBe(0);
    expect(player.discard.cards).toContain(stadium);
  });

  it('lets 小火龙附着 basic Fire Energy from the deck', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new XiaoHuoLongCs5aC();
    const fireEnergy = TestUtils.makeEnergies([CardType.FIRE])[0];
    const filler = new TestCard();
    const { player } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.FIRE]);
    player.deck.cards = [fireEnergy, filler];

    sim.dispatch(new AttackAction(1, '燃烧之尾'));
    const prompt = TestUtils.getLastPrompt(sim) as ChooseCardsPrompt;
    sim.dispatch(new ResolvePromptAction(prompt.id, [fireEnergy]));

    expect(player.active.energies.cards).toContain(fireEnergy);
    expect(player.deck.cards).toContain(filler);
  });

  it('deals self damage for 小火龙高温冲撞', () => {
    const sim = TestUtils.createTestSimulator();
    const card = new XiaoHuoLongCsv5C();
    const target = new DummyPokemon();
    const { player, opponent } = TestUtils.getAll(sim);
    TestUtils.setActive(sim, [card], [CardType.FIRE]);
    opponent.active.pokemons.cards = [target];

    sim.dispatch(new AttackAction(1, '高温冲撞'));

    expect(opponent.active.damage).toBe(30);
    expect(player.active.damage).toBe(10);
  });
});
