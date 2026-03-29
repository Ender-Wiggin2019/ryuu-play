import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import {Player, CardList, Card} from '@ptcg/common';

export interface BoardDeckZoneClickEvent {
  zone: 'deck' | 'discard' | 'lostzone';
}

@Component({
  selector: 'ptcg-board-deck',
  templateUrl: './board-deck.component.html',
  styleUrls: ['./board-deck.component.scss']
})
export class BoardDeckComponent implements OnChanges {

  @Input() player: Player;
  @Input() clientId: number;
  @Input() sandboxMode = false;
  @Output() deckClick = new EventEmitter<Card>();
  @Output() discardClick = new EventEmitter<Card>();
  @Output() lostZoneClick = new EventEmitter<Card>();
  @Output() zoneClick = new EventEmitter<BoardDeckZoneClickEvent>();

  public deck: CardList;
  public discard: CardList;
  public lostZone: CardList;
  public isOwner: boolean;

  constructor() { }

  ngOnChanges() {
    if (this.player) {
      this.deck = this.player.deck;
      this.discard = this.player.discard;
      this.lostZone = this.player.lostzone;
      this.isOwner = this.player.id === this.clientId;
    } else {
      this.deck = undefined;
      this.discard = undefined;
      this.lostZone = undefined;
      this.isOwner = false;
    }
  }

  public onDeckClick() {
    if (this.sandboxMode) {
      this.zoneClick.next({ zone: 'deck' });
      return;
    }
    let card;
    if (this.deck && this.deck.cards.length > 0) {
      card = this.deck.cards[0];
    }
    this.deckClick.next(card);
  }

  public onDiscardClick(card: Card) {
    if (this.sandboxMode) {
      this.zoneClick.next({ zone: 'discard' });
      return;
    }
    this.discardClick.next(card);
  }

  public onLostZoneClick(card: Card) {
    if (this.sandboxMode) {
      this.zoneClick.next({ zone: 'lostzone' });
      return;
    }
    this.lostZoneClick.next(card);
  }

}
