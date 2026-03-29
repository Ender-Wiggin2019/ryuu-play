import { SuperType, TrainerType, EnergyType } from '@ptcg/common';

import { setF } from '../../../src/standard/set_f';

type VariantRawData = {
  logic_group_key?: string;
  variant_group_key?: string;
  variant_group_size?: number;
};

describe('set_f', () => {
  it('contains trainer, energy, and explicitly added pokemon cards', () => {
    for (const card of setF) {
      expect([SuperType.TRAINER, SuperType.ENERGY, SuperType.POKEMON]).toContain(card.superType);
    }

    expect(setF.length).toBeGreaterThan(344);
  });

  it('stores variant grouping metadata while keeping all card faces', () => {
    const groups = new Map<string, typeof setF>();

    for (const card of setF) {
      const rawData = (card.rawData || {}) as VariantRawData;
      const groupKey = rawData.logic_group_key || rawData.variant_group_key || card.fullName;
      const group = groups.get(groupKey) || [];
      group.push(card);
      groups.set(groupKey, group);
    }

    expect(groups.size).toBeGreaterThan(412);

    const nestBallGroup = Array.from(groups.values()).find(group =>
      group.some(card => card.name === '巢穴球')
    );
    const doubleTurboGroup = Array.from(groups.values()).find(group =>
      group.some(card => card.name === '双重涡轮能量')
    );

    expect(nestBallGroup).toBeDefined();
    expect(nestBallGroup!.length).toBeGreaterThan(1);
    expect(
      new Set(nestBallGroup!.map(card => ((card.rawData || {}) as VariantRawData).variant_group_size)).size
    ).toBe(1);

    expect(doubleTurboGroup).toBeDefined();
    expect(doubleTurboGroup!.length).toBeGreaterThan(1);
    expect(doubleTurboGroup!.every(card => card.superType === SuperType.ENERGY)).toBe(true);

    const professorResearchGroup = Array.from(groups.values()).find(group =>
      group.some(card => card.name === '博士的研究')
    );
    const houJiaoWeiHGroup = Array.from(groups.values()).find(group =>
      group.some(card => card.name === '吼叫尾' && card.fullName === '吼叫尾 107/204#16692')
    );
    const houJiaoWeiGGroup = Array.from(groups.values()).find(group =>
      group.some(card => card.name === '吼叫尾' && card.fullName === '吼叫尾 065/128#15924')
    );

    expect(professorResearchGroup).toBeDefined();
    expect(professorResearchGroup!.some(card => (card as any).trainerType === TrainerType.SUPPORTER)).toBe(true);
    expect(doubleTurboGroup!.some(card => (card as any).energyType === EnergyType.SPECIAL)).toBe(true);
    expect(houJiaoWeiHGroup).toBeDefined();
    expect(houJiaoWeiHGroup!.length).toBe(3);
    expect(houJiaoWeiGGroup).toBeDefined();
    expect(houJiaoWeiGGroup!.length).toBe(5);
  });
});
