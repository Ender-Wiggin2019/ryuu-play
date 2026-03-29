import { Component, Inject } from '@angular/core';
import { Card } from '@ptcg/common';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';

import { CardsBaseService } from '../shared/cards/cards-base.service';
import { ScenarioZoneEditorValue } from '../api/interfaces/testing.interface';

export interface ScenarioZoneEditorPopupData {
  title: string;
  value: ScenarioZoneEditorValue;
}

@Component({
  selector: 'ptcg-scenario-zone-editor-popup',
  templateUrl: './scenario-zone-editor-popup.component.html',
  styleUrls: ['./scenario-zone-editor-popup.component.scss']
})
export class ScenarioZoneEditorPopupComponent {
  public readonly allCards: Card[];
  public readonly title: string;
  public searchTerm = '';
  public cardLines = '';

  constructor(
    private cardsBaseService: CardsBaseService,
    private dialogRef: MatDialogRef<ScenarioZoneEditorPopupComponent, ScenarioZoneEditorValue | undefined>,
    @Inject(MAT_DIALOG_DATA) data: ScenarioZoneEditorPopupData
  ) {
    this.title = data.title;
    this.allCards = this.cardsBaseService.getDisplayCards();
    this.cardLines = data.value.cards.join('\n');
  }

  public get filteredCards(): Card[] {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) {
      return this.allCards.slice(0, 24);
    }

    return this.allCards
      .filter(card => {
        return card.name.toLowerCase().includes(query)
          || card.fullName.toLowerCase().includes(query);
      })
      .slice(0, 24);
  }

  public addCard(card: Card): void {
    const entries = this.parseCardLines();
    entries.push(card.fullName);
    this.cardLines = entries.join('\n');
  }

  public clearCards(): void {
    this.cardLines = '';
  }

  public save(): void {
    this.dialogRef.close({
      ...this.dialogRef._containerInstance._config.data.value,
      cards: this.parseCardLines()
    });
  }

  public close(): void {
    this.dialogRef.close();
  }

  private parseCardLines(): string[] {
    return this.cardLines
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }
}
