import { Component } from '@angular/core';
import { DndService } from '@ng-dnd/core';

import { BoardComponent } from '../board.component';
import { CardsBaseService } from '../../../shared/cards/cards-base.service';
import { GameService } from '../../../api/services/game.service';

@Component({
  selector: 'ptcg-mobile-board',
  templateUrl: './mobile-board.component.html',
  styleUrls: ['./mobile-board.component.scss']
})
export class MobileBoardComponent extends BoardComponent {
  constructor(
    cardsBaseService: CardsBaseService,
    dnd: DndService,
    gameService: GameService
  ) {
    super(cardsBaseService, dnd, gameService);
  }
}
