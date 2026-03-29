import { Component, Inject } from '@angular/core';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';

import {
  SCENARIO_TURN_MARKER_OPTIONS,
  ScenarioBoardStateEditorDialogData,
  ScenarioBoardStateEditorDialogResult
} from './scenario-sandbox-dialog.types';
import { ScenarioActor, ScenarioTurnMarker } from '../api/interfaces/testing.interface';

@Component({
  selector: 'ptcg-scenario-board-state-editor-dialog',
  templateUrl: './scenario-board-state-editor-dialog.component.html',
  styleUrls: ['./scenario-board-state-editor-dialog.component.scss']
})
export class ScenarioBoardStateEditorDialogComponent {
  public readonly actorOptions: ScenarioActor[] = ['PLAYER_1', 'PLAYER_2'];
  public readonly turnMarkerOptions = SCENARIO_TURN_MARKER_OPTIONS;

  public phase: number;
  public turn: number;
  public activePlayer: number;
  public winner: number;
  public clearPrompts: boolean;
  public markers: Record<ScenarioActor, Partial<Record<ScenarioTurnMarker, number>>>;

  constructor(
    private dialogRef: MatDialogRef<ScenarioBoardStateEditorDialogComponent, ScenarioBoardStateEditorDialogResult | undefined>,
    @Inject(MAT_DIALOG_DATA) public data: ScenarioBoardStateEditorDialogData
  ) {
    this.phase = data.phase;
    this.turn = data.turn;
    this.activePlayer = data.activePlayer;
    this.winner = data.winner;
    this.clearPrompts = data.clearPrompts;
    this.markers = {
      PLAYER_1: { ...data.markers.PLAYER_1 },
      PLAYER_2: { ...data.markers.PLAYER_2 }
    };
  }

  public confirm(): void {
    this.dialogRef.close({
      phase: Math.floor(this.phase || 0),
      turn: Math.floor(this.turn || 0),
      activePlayer: Math.floor(this.activePlayer || 0),
      winner: Math.floor(this.winner || 0),
      clearPrompts: this.clearPrompts,
      markers: this.markers
    });
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}
