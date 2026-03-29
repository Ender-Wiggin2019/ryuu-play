import { Component, Inject } from '@angular/core';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';

import {
  SCENARIO_SPECIAL_CONDITION_OPTIONS,
  ScenarioPokemonSlotEditorDialogData,
  ScenarioPokemonSlotEditorDialogResult
} from './scenario-sandbox-dialog.types';

@Component({
  selector: 'ptcg-scenario-pokemon-slot-editor-dialog',
  templateUrl: './scenario-pokemon-slot-editor-dialog.component.html',
  styleUrls: ['./scenario-pokemon-slot-editor-dialog.component.scss']
})
export class ScenarioPokemonSlotEditorDialogComponent {
  public readonly conditionOptions = SCENARIO_SPECIAL_CONDITION_OPTIONS;

  public damage = 0;
  public conditions = new Set(this.data.conditions);
  public pokemonInput = '';
  public energyInput = '';
  public trainerInput = '';

  constructor(
    private dialogRef: MatDialogRef<ScenarioPokemonSlotEditorDialogComponent, ScenarioPokemonSlotEditorDialogResult | undefined>,
    @Inject(MAT_DIALOG_DATA) public data: ScenarioPokemonSlotEditorDialogData
  ) {
    this.damage = data.damage;
    this.pokemonInput = data.pokemons.join('\n');
    this.energyInput = data.energies.join('\n');
    this.trainerInput = data.trainers.join('\n');
  }

  public toggleCondition(condition: typeof this.data.conditions[number]): void {
    if (this.conditions.has(condition)) {
      this.conditions.delete(condition);
    } else {
      this.conditions.add(condition);
    }
  }

  public confirm(): void {
    this.dialogRef.close({
      damage: Math.max(0, Math.floor(this.damage || 0)),
      conditions: [...this.conditions],
      pokemons: this.parseLines(this.pokemonInput),
      energies: this.parseLines(this.energyInput),
      trainers: this.parseLines(this.trainerInput)
    });
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public hasCondition(condition: typeof this.data.conditions[number]): boolean {
    return this.conditions.has(condition);
  }

  private parseLines(value: string): string[] {
    return value
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
}
