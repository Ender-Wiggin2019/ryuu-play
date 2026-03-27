import { CardTag, CardType, Stage } from '@ptcg/common';
import { RadiantGreninja } from '../../../src/standard/set-sword-and-shield/radiant-greninja';

describe('RadiantGreninja', () => {
  let card: RadiantGreninja;

  beforeEach(() => {
    card = new RadiantGreninja();
  });

  it('should have correct properties', () => {
    expect(card.stage).toBe(Stage.BASIC);
    expect(card.hp).toBe(130);
    expect(card.cardTypes).toEqual([CardType.WATER]);
    expect(card.weakness).toEqual([{ type: CardType.LIGHTNING }]);
    expect(card.retreat).toEqual([CardType.COLORLESS]);
    expect(card.name).toBe('Radiant Greninja');
    expect(card.fullName).toBe('Radiant Greninja SSH');
  });

  it('should have Radiant tag', () => {
    expect(card.tags).toContain(CardTag.RADIANT);
  });

  it('should have Moonlight Shuriken attack', () => {
    expect(card.attacks.length).toBe(1);
    expect(card.attacks[0].name).toBe('Moonlight Shuriken');
    expect(card.attacks[0].cost).toEqual([CardType.WATER, CardType.WATER, CardType.COLORLESS]);
  });

  it('should have Concealed Cards ability', () => {
    expect(card.powers.length).toBe(1);
    expect(card.powers[0].name).toBe('Concealed Cards');
  });

  it('should have correct raw data from PTCG-CHS', () => {
    expect(card.rawData.raw_card.name).toBe('光辉甲贺忍蛙');
    expect(card.rawData.collection.name).toBe('强化包 胜象星引');
    expect(card.rawData.image_url).toBe('https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev/222/33.png');
  });
});
