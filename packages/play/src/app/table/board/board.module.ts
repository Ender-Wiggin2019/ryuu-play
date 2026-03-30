import { NgModule } from '@angular/core';

import { BoardComponent } from './board.component';
import { BoardPrizesComponent } from './board-prizes/board-prizes.component';
import { BoardDeckComponent } from './board-deck/board-deck.component';
import { BoardCardComponent } from './board-card/board-card.component';
import { MobileBoardComponent } from './mobile-board/mobile-board.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    BoardComponent,
    BoardPrizesComponent,
    BoardDeckComponent,
    BoardCardComponent,
    MobileBoardComponent,
  ],
  exports: [
    BoardComponent,
    BoardCardComponent,
    MobileBoardComponent
  ]
})
export class BoardModule { }
