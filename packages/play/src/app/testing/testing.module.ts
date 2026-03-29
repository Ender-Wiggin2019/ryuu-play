import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { BoardModule } from '../table/board/board.module';
import { ScenarioBoardStateEditorDialogComponent } from './scenario-board-state-editor-dialog.component';
import { ScenarioPokemonSlotEditorDialogComponent } from './scenario-pokemon-slot-editor-dialog.component';
import { ScenarioLabComponent } from './scenario-lab.component';
import { ScenarioZoneEditorDialogComponent } from './scenario-zone-editor-dialog.component';
import { TestingComponent } from './testing.component';

@NgModule({
  declarations: [
    TestingComponent,
    ScenarioLabComponent,
    ScenarioZoneEditorDialogComponent,
    ScenarioPokemonSlotEditorDialogComponent,
    ScenarioBoardStateEditorDialogComponent
  ],
  imports: [
    SharedModule,
    BoardModule
  ]
})
export class TestingModule { }
