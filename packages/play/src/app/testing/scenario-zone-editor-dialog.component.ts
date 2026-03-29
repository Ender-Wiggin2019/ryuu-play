import { Component, Inject } from '@angular/core';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';

import {
  SCENARIO_ZONE_OPTIONS,
  ScenarioZoneEditorDialogData,
  ScenarioZoneEditorDialogResult
} from './scenario-sandbox-dialog.types';
import { ScenarioActor, ScenarioZoneName } from '../api/interfaces/testing.interface';

@Component({
  selector: 'ptcg-scenario-zone-editor-dialog',
  templateUrl: './scenario-zone-editor-dialog.component.html',
  styleUrls: ['./scenario-zone-editor-dialog.component.scss']
})
export class ScenarioZoneEditorDialogComponent {
  public readonly zoneOptions = SCENARIO_ZONE_OPTIONS;
  public readonly actorOptions: ScenarioActor[] = ['PLAYER_1', 'PLAYER_2'];

  public cards: string[] = [];
  public cardName = '';
  public bulkCards = '';
  public moveEnabled = false;
  public moveCardIndex = 0;
  public movePlayer: ScenarioActor;
  public moveZone: ScenarioZoneName;
  public moveSlotIndex = 0;

  constructor(
    private dialogRef: MatDialogRef<ScenarioZoneEditorDialogComponent, ScenarioZoneEditorDialogResult | undefined>,
    @Inject(MAT_DIALOG_DATA) public data: ScenarioZoneEditorDialogData
  ) {
    this.cards = [...data.cards];
    this.movePlayer = data.target.player;
    this.moveZone = data.target.zone;
    this.moveSlotIndex = data.target.slotIndex ?? 0;
  }

  public addCard(): void {
    const trimmed = this.cardName.trim();
    if (!trimmed) {
      return;
    }
    this.cards.push(trimmed);
    this.cardName = '';
  }

  public addBulkCards(): void {
    const nextCards = this.bulkCards
      .split('\n')
      .map(card => card.trim())
      .filter(card => card.length > 0);

    if (nextCards.length === 0) {
      return;
    }

    this.cards.push(...nextCards);
    this.bulkCards = '';
  }

  public removeCard(index: number): void {
    this.cards.splice(index, 1);
    if (this.moveCardIndex >= this.cards.length) {
      this.moveCardIndex = Math.max(0, this.cards.length - 1);
    }
  }

  public confirm(): void {
    const result: ScenarioZoneEditorDialogResult = {
      cards: [...this.cards]
    };

    if (this.moveEnabled && this.cards.length > 0) {
      result.moveCard = {
        index: Math.max(0, Math.min(this.moveCardIndex, this.cards.length - 1)),
        to: {
          player: this.movePlayer,
          zone: this.moveZone,
          slotIndex: this.requiresSlotIndex(this.moveZone) ? this.moveSlotIndex : undefined
        }
      };
    }

    this.dialogRef.close(result);
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public trackByCard(_index: number, card: string): string {
    return card;
  }

  public requiresSlotIndex(zone: ScenarioZoneName): boolean {
    return zone === 'prize' || zone.startsWith('bench.');
  }
}
