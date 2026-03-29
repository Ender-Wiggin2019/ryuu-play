import { Component, Inject } from '@angular/core';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';

import {
  ScenarioActor,
  ScenarioBoardStateEditorValue,
  ScenarioTurnMarker
} from '../api/interfaces/testing.interface';

export interface ScenarioStateEditorPopupData {
  title: string;
  value: ScenarioBoardStateEditorValue;
}

@Component({
  selector: 'ptcg-scenario-state-editor-popup',
  templateUrl: './scenario-state-editor-popup.component.html',
  styleUrls: ['./scenario-state-editor-popup.component.scss']
})
export class ScenarioStateEditorPopupComponent {
  public readonly actors: ScenarioActor[] = ['PLAYER_1', 'PLAYER_2'];
  public readonly markerRows: Array<{ player: ScenarioActor; marker: ScenarioTurnMarker; value: number }>;
  public phase: number;
  public turn: number;
  public activePlayer: ScenarioActor;
  public winner: number;

  constructor(
    private dialogRef: MatDialogRef<ScenarioStateEditorPopupComponent, ScenarioBoardStateEditorValue | undefined>,
    @Inject(MAT_DIALOG_DATA) data: ScenarioStateEditorPopupData
  ) {
    this.phase = data.value.phase;
    this.turn = data.value.turn;
    this.activePlayer = data.value.activePlayer;
    this.winner = data.value.winner;
    this.markerRows = data.value.markers.map(item => ({ ...item }));
  }

  public save(): void {
    this.dialogRef.close({
      phase: Number(this.phase) || 0,
      turn: Number(this.turn) || 0,
      activePlayer: this.activePlayer,
      winner: Number(this.winner) || 0,
      markers: this.markerRows.map(item => ({
        player: item.player,
        marker: item.marker,
        value: Number(item.value) || 0
      }))
    });
  }

  public close(): void {
    this.dialogRef.close();
  }
}
