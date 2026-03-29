import { Injectable } from '@angular/core';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';
import { map, Observable } from 'rxjs';

import {
  ScenarioPatchOperation,
  ScenarioPokemonSlotRef,
  ScenarioTurnMarker,
  ScenarioZoneRef
} from '../api/interfaces/testing.interface';
import {
  ScenarioBoardStateEditorDialogData,
  ScenarioBoardStateEditorDialogResult,
  ScenarioPokemonSlotEditorDialogData,
  ScenarioPokemonSlotEditorDialogResult,
  ScenarioZoneEditorDialogData,
  ScenarioZoneEditorDialogResult
} from './scenario-sandbox-dialog.types';
import { ScenarioBoardStateEditorDialogComponent } from './scenario-board-state-editor-dialog.component';
import { ScenarioPokemonSlotEditorDialogComponent } from './scenario-pokemon-slot-editor-dialog.component';
import { ScenarioZoneEditorDialogComponent } from './scenario-zone-editor-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ScenarioSandboxEditorDialogService {
  constructor(private dialog: MatDialog) {}

  public openZoneEditor(
    data: ScenarioZoneEditorDialogData
  ): MatDialogRef<ScenarioZoneEditorDialogComponent, ScenarioZoneEditorDialogResult | undefined> {
    return this.dialog.open(ScenarioZoneEditorDialogComponent, {
      width: '760px',
      maxWidth: '96vw',
      data
    });
  }

  public openZoneEditorAsPatchOperations(data: ScenarioZoneEditorDialogData): Observable<ScenarioPatchOperation[] | undefined> {
    return this.openZoneEditor(data).afterClosed().pipe(
      map(result => result ? this.buildZoneOperations(data.target, result) : undefined)
    );
  }

  public openPokemonSlotEditor(
    data: ScenarioPokemonSlotEditorDialogData
  ): MatDialogRef<ScenarioPokemonSlotEditorDialogComponent, ScenarioPokemonSlotEditorDialogResult | undefined> {
    return this.dialog.open(ScenarioPokemonSlotEditorDialogComponent, {
      width: '760px',
      maxWidth: '96vw',
      data
    });
  }

  public openPokemonSlotEditorAsPatchOperations(
    data: ScenarioPokemonSlotEditorDialogData
  ): Observable<ScenarioPatchOperation[] | undefined> {
    return this.openPokemonSlotEditor(data).afterClosed().pipe(
      map(result => result ? this.buildPokemonSlotOperations(data.target, result) : undefined)
    );
  }

  public openBoardStateEditor(
    data: ScenarioBoardStateEditorDialogData
  ): MatDialogRef<ScenarioBoardStateEditorDialogComponent, ScenarioBoardStateEditorDialogResult | undefined> {
    return this.dialog.open(ScenarioBoardStateEditorDialogComponent, {
      width: '760px',
      maxWidth: '96vw',
      data
    });
  }

  public openBoardStateEditorAsPatchOperations(
    data: ScenarioBoardStateEditorDialogData
  ): Observable<ScenarioPatchOperation[] | undefined> {
    return this.openBoardStateEditor(data).afterClosed().pipe(
      map(result => result ? this.buildBoardStateOperations(result) : undefined)
    );
  }

  public buildZoneOperations(target: ScenarioZoneRef, result: ScenarioZoneEditorDialogResult): ScenarioPatchOperation[] {
    const operations: ScenarioPatchOperation[] = [
      {
        op: 'setZoneCards',
        target,
        cards: result.cards
      }
    ];

    if (result.moveCard) {
      operations.push({
        op: 'moveCard',
        from: target,
        to: result.moveCard.to,
        index: result.moveCard.index
      });
    }

    return operations;
  }

  public buildPokemonSlotOperations(
    target: ScenarioPokemonSlotRef,
    result: ScenarioPokemonSlotEditorDialogResult
  ): ScenarioPatchOperation[] {
    const zonePrefix = target.slot === 'ACTIVE' ? 'active' : 'bench';
    const slotIndex = target.slot === 'BENCH' ? target.index ?? 0 : undefined;

    return [
      {
        op: 'setZoneCards',
        target: { player: target.player, zone: `${zonePrefix}.pokemons`, slotIndex },
        cards: result.pokemons
      },
      {
        op: 'setZoneCards',
        target: { player: target.player, zone: `${zonePrefix}.energies`, slotIndex },
        cards: result.energies
      },
      {
        op: 'setZoneCards',
        target: { player: target.player, zone: `${zonePrefix}.trainers`, slotIndex },
        cards: result.trainers
      },
      {
        op: 'setDamage',
        target,
        damage: result.damage
      },
      {
        op: 'setSpecialCondition',
        target,
        conditions: result.conditions
      }
    ];
  }

  public buildBoardStateOperations(result: ScenarioBoardStateEditorDialogResult): ScenarioPatchOperation[] {
    const operations: ScenarioPatchOperation[] = [];

    if (result.clearPrompts) {
      operations.push({ op: 'clearPrompts' });
    }

    operations.push({
      op: 'setState',
      phase: result.phase,
      turn: result.turn,
      activePlayer: result.activePlayer,
      winner: result.winner
    });

    (['PLAYER_1', 'PLAYER_2'] as const).forEach(player => {
      this.appendTurnMarkerOperations(operations, player, result.markers[player]);
    });

    return operations;
  }

  private appendTurnMarkerOperations(
    operations: ScenarioPatchOperation[],
    player: 'PLAYER_1' | 'PLAYER_2',
    markers: Partial<Record<ScenarioTurnMarker, number>>
  ): void {
    Object.entries(markers).forEach(([marker, value]) => {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return;
      }

      operations.push({
        op: 'setTurnMarker',
        player,
        marker: marker as ScenarioTurnMarker,
        value
      });
    });
  }
}
