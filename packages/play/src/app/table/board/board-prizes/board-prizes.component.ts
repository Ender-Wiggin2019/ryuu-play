import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Player, CardList } from '@ptcg/common';

export interface BoardPrizeClickEvent {
  prize: CardList;
  index: number;
}

@Component({
  selector: 'ptcg-board-prizes',
  templateUrl: './board-prizes.component.html',
  styleUrls: ['./board-prizes.component.scss']
})
export class BoardPrizesComponent implements OnChanges {

  @Input() player: Player;
  @Input() clientId: number;
  @Input() sandboxMode = false;
  @Output() prizeClick = new EventEmitter<CardList>();
  @Output() prizeSlotClick = new EventEmitter<BoardPrizeClickEvent>();

  public prizes: CardList[] = new Array(6);
  public isOwner: boolean;

  constructor() { }

  ngOnChanges() {
    if (this.player) {
      this.prizes = this.player.prizes;
      this.isOwner = this.player.id === this.clientId;
    } else {
      this.prizes = new Array(6);
      this.isOwner = false;
    }
  }

  public onPrizeClick(cardList: CardList, index: number) {
    if (this.sandboxMode) {
      this.prizeSlotClick.next({ prize: cardList, index });
      return;
    }
    this.prizeClick.next(cardList);
  }

}
