import { CardType, EnergyType } from '@ptcg/common';

import { DarknessEnergy } from '../../../src/standard/set_h/darkness-energy';
import { FightingEnergy } from '../../../src/standard/set_h/fighting-energy';
import { FireEnergy } from '../../../src/standard/set_h/fire-energy';
import { GrassEnergy } from '../../../src/standard/set_h/grass-energy';
import { LightningEnergy } from '../../../src/standard/set_h/lightning-energy';
import { MetalEnergy } from '../../../src/standard/set_h/metal-energy';
import { PsychicEnergy } from '../../../src/standard/set_h/psychic-energy';
import { WaterEnergy } from '../../../src/standard/set_h/water-energy';

describe('Basic Energy set_h', () => {
  it('provides the expected card type and remains basic energy', () => {
    const cases = [
      { card: new GrassEnergy(), provides: CardType.GRASS, fullName: 'Grass Energy CSVSC' },
      { card: new FireEnergy(), provides: CardType.FIRE, fullName: 'Fire Energy CSVSC' },
      { card: new WaterEnergy(), provides: CardType.WATER, fullName: 'Water Energy CSVSC' },
      { card: new LightningEnergy(), provides: CardType.LIGHTNING, fullName: 'Lightning Energy CSVSC' },
      { card: new PsychicEnergy(), provides: CardType.PSYCHIC, fullName: 'Psychic Energy CSVSC' },
      { card: new FightingEnergy(), provides: CardType.FIGHTING, fullName: 'Fighting Energy CSVSC' },
      { card: new DarknessEnergy(), provides: CardType.DARK, fullName: 'Darkness Energy CSVSC' },
      { card: new MetalEnergy(), provides: CardType.METAL, fullName: 'Metal Energy CSVSC' },
    ];

    for (const item of cases) {
      expect(item.card.set).toBe('set_h');
      expect(item.card.energyType).toBe(EnergyType.BASIC);
      expect(item.card.provides).toEqual([item.provides]);
      expect(item.card.fullName).toBe(item.fullName);
    }
  });
});
