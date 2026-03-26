import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CardType, Stage, SuperType } from '@ptcg/common';

import { ApiModule } from '../../api/api.module';
import { CardsBaseService } from './cards-base.service';

describe('CardsBaseService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      ApiModule,
      TranslateModule.forRoot()
    ]
  }));

  it('should be created', () => {
    const service: CardsBaseService = TestBed.inject(CardsBaseService);
    expect(service).toBeTruthy();
  });

  it('separates same-name Pokemon with different logic even when yorenCode matches', () => {
    const service = TestBed.inject(CardsBaseService) as any;

    const cardA = {
      superType: SuperType.POKEMON,
      fullName: '拉鲁拉丝 CSV2C',
      name: '拉鲁拉丝',
      tags: [],
      cardTypes: [CardType.PSYCHIC],
      stage: Stage.BASIC,
      hp: 70,
      evolvesFrom: '',
      retreat: [CardType.COLORLESS],
      weakness: [{ type: CardType.DARK }],
      resistance: [{ type: CardType.FIGHTING, value: -30 }],
      powers: [],
      attacks: [{ name: '精神射击', cost: [CardType.PSYCHIC, CardType.COLORLESS], damage: '30', text: '' }],
      rawData: { raw_card: { yorenCode: 'P280', details: { rarityLabel: 'C', collectionNumber: '053/128' } } }
    };
    const cardB = {
      superType: SuperType.POKEMON,
      fullName: '拉鲁拉丝 CS5aC',
      name: '拉鲁拉丝',
      tags: [],
      cardTypes: [CardType.PSYCHIC],
      stage: Stage.BASIC,
      hp: 70,
      evolvesFrom: '',
      retreat: [CardType.COLORLESS],
      weakness: [{ type: CardType.DARK }],
      resistance: [{ type: CardType.FIGHTING, value: -30 }],
      powers: [],
      attacks: [{ name: '瞬移破坏', cost: [CardType.PSYCHIC], damage: '10', text: '将这只宝可梦与备战宝可梦互换。' }],
      rawData: { raw_card: { yorenCode: 'P280', details: { rarityLabel: 'C', collectionNumber: '043/127' } } }
    };

    service.cards = [cardA as any, cardB as any];
    service.buildVariantGroups();

    expect(service.getDisplayCards().map((card: any) => card.fullName)).toEqual([
      '拉鲁拉丝 CS5aC',
      '拉鲁拉丝 CSV2C'
    ]);
    expect(service.getVariantCards(cardA as any).map((card: any) => card.fullName)).toEqual(['拉鲁拉丝 CSV2C']);
    expect(service.getVariantCards(cardB as any).map((card: any) => card.fullName)).toEqual(['拉鲁拉丝 CS5aC']);
  });

  it('uses highest rarity card as the display card inside one variant group', () => {
    const service = TestBed.inject(CardsBaseService) as any;

    const base = {
      superType: SuperType.POKEMON,
      name: '喷火龙ex',
      tags: [],
      cardTypes: [CardType.DARK],
      stage: Stage.STAGE_2,
      hp: 330,
      evolvesFrom: '火恐龙',
      retreat: [CardType.COLORLESS, CardType.COLORLESS],
      weakness: [{ type: CardType.GRASS }],
      resistance: [],
      powers: [{ name: '烈炎支配', powerType: 0, text: '' }],
      attacks: [{ name: '燃烧黑暗', cost: [CardType.FIRE, CardType.FIRE], damage: '180+', text: '' }],
      rawData: { variant_group_key: 'pokemon:dark-charizard-ex', raw_card: { yorenCode: 'P006', details: {} } }
    };
    const rr = {
      ...base,
      fullName: '喷火龙ex RR',
      rawData: { ...base.rawData, raw_card: { yorenCode: 'P006', details: { rarityLabel: 'RR', collectionNumber: '006/190' } } }
    };
    const sar = {
      ...base,
      fullName: '喷火龙ex SAR',
      rawData: { ...base.rawData, raw_card: { yorenCode: 'P006', details: { rarityLabel: 'SAR', collectionNumber: '155/190' } } }
    };

    service.cards = [rr as any, sar as any];
    service.buildVariantGroups();

    expect(service.getDisplayCards().map((card: any) => card.fullName)).toEqual(['喷火龙ex SAR']);
    expect(service.getVariantCards(rr as any).map((card: any) => card.fullName)).toEqual(['喷火龙ex SAR', '喷火龙ex RR']);
  });
});
