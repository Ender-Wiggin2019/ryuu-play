import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Format, Rules } from '@ptcg/common';
import { finalize, map, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DeckListEntry } from '../api/interfaces/deck.interface';
import { DeckService } from '../api/services/deck.service';
import { GameService } from '../api/services/game.service';
import { TestingService } from '../api/services/testing.service';
import { CardsBaseService } from '../shared/cards/cards-base.service';
import { SessionService } from '../shared/session/session.service';

@Component({
  selector: 'ptcg-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.scss']
})
export class TestingComponent implements OnInit {
  public loading = false;
  public allDecks: DeckListEntry[] = [];
  public decks: DeckListEntry[] = [];
  public playerDeckId: number | undefined;
  public botDeckId: number | undefined;
  public formats: Format[] = [];
  public format: Format | undefined;
  private destroyRef = inject(DestroyRef);

  constructor(
    private cardsBaseService: CardsBaseService,
    private deckService: DeckService,
    private gameService: GameService,
    private router: Router,
    private sessionService: SessionService,
    private testingService: TestingService
  ) {}

  public ngOnInit(): void {
    this.loading = true;
    this.deckService.getList()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => { this.loading = false; })
      )
      .subscribe(result => {
        this.allDecks = result.decks.filter(deck => deck.isValid);
        const availableFormatNames = new Set(this.allDecks.flatMap(deck => deck.formatNames));
        this.formats = this.cardsBaseService.getAllFormats().filter(format => availableFormatNames.has(format.name));
        this.formats.push({
          name: '',
          cards: [],
          rules: new Rules(),
          ranges: []
        });
        this.onFormatChange(this.formats[0]);
      });
  }

  public onFormatChange(format: Format) {
    this.format = format;
    this.decks = format.name
      ? this.allDecks.filter(deck => deck.formatNames.includes(format.name))
      : this.allDecks.slice();

    if (!this.playerDeck || !this.decks.some(deck => deck.id === this.playerDeck.id)) {
      this.playerDeckId = this.decks[0]?.id;
    }

    if (!this.botDeck || !this.decks.some(deck => deck.id === this.botDeck.id)) {
      const fallbackBotDeck = this.decks.find(deck => deck.id !== this.playerDeckId) ?? this.decks[0];
      this.botDeckId = fallbackBotDeck?.id;
    }
  }

  public createGame() {
    if (!this.playerDeck || !this.botDeck || !this.format) {
      return;
    }

    this.loading = true;
    this.testingService.createGame(
      this.playerDeck.id,
      this.botDeck.id,
      this.format.name,
      this.sessionService.session.clientId
    )
      .pipe(
        switchMap(result => this.gameService.join(result.gameId)),
        map(gameState => gameState?.localId),
        finalize(() => { this.loading = false; }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(localId => {
        if (localId !== undefined) {
          this.router.navigate(['/table', localId]);
        }
      });
  }

  public get playerDeck(): DeckListEntry | undefined {
    return this.decks.find(deck => deck.id === this.playerDeckId);
  }

  public get botDeck(): DeckListEntry | undefined {
    return this.decks.find(deck => deck.id === this.botDeckId);
  }
}
