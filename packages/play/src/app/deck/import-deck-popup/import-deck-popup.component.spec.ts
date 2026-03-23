import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { TranslateModule } from '@ngx-translate/core';

import { ImportDeckPopupComponent } from './import-deck-popup.component';
import { SessionService } from '../../shared/session/session.service';
import { CardsBaseService } from '../../shared/cards/cards-base.service';

describe('ImportDeckPopupComponent', () => {
  let component: ImportDeckPopupComponent;
  let fixture: ComponentFixture<ImportDeckPopupComponent>;
  let cardsBaseService: jasmine.SpyObj<CardsBaseService>;

  const mewExPaf = {
    fullName: 'Mew ex PAF',
    name: 'Mew ex',
    rawData: {
      collection: { commodityCode: 'PAF' },
      raw_card: { details: { collectionNumber: '232/091' } }
    }
  } as any;

  const mewExSvp = {
    fullName: 'Mew ex SVP',
    name: 'Mew ex',
    rawData: {
      collection: { commodityCode: 'SVP' },
      raw_card: { details: { collectionNumber: '053' } }
    }
  } as any;

  const cards = [mewExSvp, mewExPaf];

  beforeEach(waitForAsync(() => {
    cardsBaseService = jasmine.createSpyObj('CardsBaseService', ['getCards', 'getCardByName']);
    cardsBaseService.getCards.and.returnValue(cards);
    cardsBaseService.getCardByName.and.callFake((name: string) => {
      return cards.find(card => card.fullName === name);
    });

    const sessionServiceStub = {
      session: { config: { avatarFileSize: 1000 } }
    } as SessionService;

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        TranslateModule.forRoot()
      ],
      declarations: [ ImportDeckPopupComponent ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: SessionService, useValue: sessionServiceStub },
        { provide: CardsBaseService, useValue: cardsBaseService }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDeckPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should decode pasted deck text in quantity format', () => {
    component.updatePreviewFromText([
      'By: Jihuanshe',
      'Pokémon:1',
      '3 Mew ex PAF 232',
      'Total Cards:3'
    ].join('\n'));

    expect(component.deckTextError).toBe('');
    expect(component.cardNames).toEqual(['Mew ex PAF', 'Mew ex PAF', 'Mew ex PAF']);
  });

  it('should fallback to first name match when edition does not match', () => {
    component.updatePreviewFromText('2 Mew ex XXX 999');
    expect(component.cardNames).toEqual(['Mew ex SVP', 'Mew ex SVP']);
  });

  it('should decode quantity with fullName fallback format', () => {
    component.updatePreviewFromText('2 Mew ex PAF');
    expect(component.cardNames).toEqual(['Mew ex PAF', 'Mew ex PAF']);
  });

  it('should report unmatched lines when card name cannot be resolved', () => {
    component.updatePreviewFromText('1 Missing Card PAF 1');
    expect(component.cardNames).toBeUndefined();
    expect(component.deckTextError).toBe('DECK_IMPORT_CANNOT_MATCH');
    expect(component.unmatchedLines).toEqual(['1 Missing Card PAF 1']);
  });
});
