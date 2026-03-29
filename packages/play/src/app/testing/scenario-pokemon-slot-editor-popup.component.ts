import { Component, Inject } from '@angular/core';
import { Card, SuperType } from '@ptcg/common';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';

import {
  ScenarioPokemonSlotEditorValue,
  ScenarioSpecialCondition
} from '../api/interfaces/testing.interface';
import { CardsBaseService } from '../shared/cards/cards-base.service';

export interface ScenarioPokemonSlotEditorPopupData {
  title: string;
  value: ScenarioPokemonSlotEditorValue;
}

type ScenarioSlotCardBucket = 'pokemon' | 'energies' | 'trainers';

@Component({
  selector: 'ptcg-scenario-pokemon-slot-editor-popup',
  templateUrl: './scenario-pokemon-slot-editor-popup.component.html',
  styleUrls: ['./scenario-pokemon-slot-editor-popup.component.scss']
})
export class ScenarioPokemonSlotEditorPopupComponent {
  public readonly title: string;
  public readonly allCards: Card[];
  public readonly specialConditions: ScenarioSpecialCondition[] = ['PARALYZED', 'CONFUSED', 'ASLEEP', 'POISONED', 'BURNED'];
  public selectedBucket: ScenarioSlotCardBucket = 'pokemon';
  public searchTerm = '';
  public pokemonLines = '';
  public energyLines = '';
  public trainerLines = '';
  public damage = 0;
  public conditions: ScenarioSpecialCondition[] = [];

  constructor(
    private cardsBaseService: CardsBaseService,
    private dialogRef: MatDialogRef<ScenarioPokemonSlotEditorPopupComponent, ScenarioPokemonSlotEditorValue | undefined>,
    @Inject(MAT_DIALOG_DATA) data: ScenarioPokemonSlotEditorPopupData
  ) {
    this.title = data.title;
    this.allCards = this.cardsBaseService.getDisplayCards();
    this.pokemonLines = data.value.pokemon.join('\n');
    this.energyLines = data.value.energies.join('\n');
    this.trainerLines = data.value.trainers.join('\n');
    this.damage = data.value.damage;
    this.conditions = data.value.conditions.slice();
  }

  public get filteredCards(): Card[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.allCards
      .filter(card => this.matchesBucket(card, this.selectedBucket))
      .filter(card => {
        return !query
          || card.name.toLowerCase().includes(query)
          || card.fullName.toLowerCase().includes(query);
      })
      .slice(0, 24);
  }

  public addCard(card: Card): void {
    const entries = this.getLines(this.selectedBucket);
    entries.push(card.fullName);
    this.setLines(this.selectedBucket, entries);
  }

  public save(): void {
    this.dialogRef.close({
      ...this.dialogRef._containerInstance._config.data.value,
      pokemon: this.getLines('pokemon'),
      energies: this.getLines('energies'),
      trainers: this.getLines('trainers'),
      damage: Number(this.damage) || 0,
      conditions: this.conditions.slice()
    });
  }

  public close(): void {
    this.dialogRef.close();
  }

  private matchesBucket(card: Card, bucket: ScenarioSlotCardBucket): boolean {
    if (bucket === 'pokemon') {
      return card.superType === SuperType.POKEMON;
    }
    if (bucket === 'energies') {
      return card.superType === SuperType.ENERGY;
    }
    return card.superType === SuperType.TRAINER;
  }

  private getLines(bucket: ScenarioSlotCardBucket): string[] {
    const raw = bucket === 'pokemon'
      ? this.pokemonLines
      : bucket === 'energies'
        ? this.energyLines
        : this.trainerLines;

    return raw
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  private setLines(bucket: ScenarioSlotCardBucket, values: string[]): void {
    const joined = values.join('\n');
    if (bucket === 'pokemon') {
      this.pokemonLines = joined;
      return;
    }
    if (bucket === 'energies') {
      this.energyLines = joined;
      return;
    }
    this.trainerLines = joined;
  }
}
