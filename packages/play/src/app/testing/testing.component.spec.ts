import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Rules } from '@ptcg/common';

import { TestingComponent } from './testing.component';
import { SharedModule } from '../shared/shared.module';
import { CardsBaseService } from '../shared/cards/cards-base.service';
import { DeckService } from '../api/services/deck.service';
import { GameService } from '../api/services/game.service';
import { TestingService } from '../api/services/testing.service';
import { SessionService } from '../shared/session/session.service';

describe('TestingComponent', () => {
  let component: TestingComponent;
  let fixture: ComponentFixture<TestingComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslateModule.forRoot()
      ],
      declarations: [TestingComponent],
      providers: [
        {
          provide: CardsBaseService,
          useValue: {
            getAllFormats: () => [{ name: 'Standard', cards: [], ranges: [], rules: new Rules({ formatName: 'Standard' }) }]
          }
        },
        {
          provide: DeckService,
          useValue: {
            getList: () => of({
              decks: [
                { id: 1, name: 'Deck A', formatNames: ['Standard'], cardType: [], isValid: true },
                { id: 2, name: 'Deck B', formatNames: ['Standard'], cardType: [], isValid: true }
              ]
            })
          }
        },
        {
          provide: TestingService,
          useValue: {
            createGame: () => of({ gameId: 99 })
          }
        },
        {
          provide: SessionService,
          useValue: {
            session: {
              clientId: 17
            }
          }
        },
        {
          provide: GameService,
          useValue: {
            join: () => of({ localId: 7 })
          }
        },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads valid decks and creates a testing game', () => {
    expect(component.playerDeck?.name).toBe('Deck A');
    expect(component.botDeck?.name).toBe('Deck B');

    component.createGame();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/table', 7]);
  });

  it('keeps player and bot selections independent', () => {
    component.playerDeckId = 1;
    component.botDeckId = 2;

    expect(component.playerDeck?.name).toBe('Deck A');
    expect(component.botDeck?.name).toBe('Deck B');
  });
});
