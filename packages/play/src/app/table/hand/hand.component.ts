import { Component, Input, OnChanges } from '@angular/core';
import { Player, Card, CardList } from '@ptcg/common';
import { SortableSpec, DraggedItem } from '@ng-dnd/sortable';

import { CardsBaseService } from '../../shared/cards/cards-base.service';
import { HandItem, HandCardType } from './hand-item.interface';
import { LocalGameState } from '../../shared/session/session.interface';
import { GameService } from '../../api/services/game.service';

@Component({
  selector: 'ptcg-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss']
})
export class HandComponent implements OnChanges {

  public readonly handListId = 'HAND_LIST';

  @Input() player: Player;
  @Input() gameState: LocalGameState;
  @Input() clientId: number;

  public cards: Card[] = [];
  public selectedCard: Card | undefined;
  public selectedIndex = 0;
  public isFaceDown: boolean;
  public isDeleted: boolean;
  public handSpec: SortableSpec<HandItem>;
  public list: HandItem[] = [];
  public tempList: HandItem[] = [];

  private isOwner: boolean;

  constructor(
    private cardsBaseService: CardsBaseService,
    private gameService: GameService
  ) {
    this.handSpec = {
      type: HandCardType,
      trackBy: item => item.index,
      hover: item => {
        this.tempList = this.move(item);
      },
      drop: item => {
        this.tempList = this.move(item);
        this.list = this.tempList;
        this.dispatchAction(this.list);
      },
      canDrag: () => {
        const isMinimized = this.gameState && this.gameState.promptMinimized;
        return this.isOwner && !this.isDeleted && !isMinimized;
      },
      endDrag: () => {
        this.tempList = this.list;
      }
    };
  }

  ngOnChanges() {
    if (this.gameState) {
      this.isDeleted = this.gameState.deleted;
    }

    if (this.player) {
      const hand = this.player.hand;
      this.isOwner = this.player.id === this.clientId;
      this.cards = hand.cards;
      this.list = this.buildHandList(hand);
      this.tempList = this.list;
      this.isFaceDown = hand.isSecret || (!hand.isPublic && !this.isOwner);
      this.syncSelectedCard();
    } else {
      this.cards = [];
      this.selectedCard = undefined;
      this.selectedIndex = 0;
      this.list = [];
      this.tempList = [];
    }
  }

  public showCardInfo(card: Card) {
    const facedown = this.isFaceDown;
    const allowReveal = facedown && !!this.gameState.replay;
    this.cardsBaseService.showCardInfo({ card, allowReveal, facedown });
  }

  public selectCard(card: Card, index: number) {
    this.selectedCard = card;
    this.selectedIndex = index;
  }

  private dispatchAction(list: HandItem[]) {
    if (!this.gameState) {
      return;
    }
    const order = list.map(i => i.index);
    this.gameService.reorderHandAction(this.gameState.gameId, order);
  }

  private move(item: DraggedItem<HandItem>) {
    const temp = this.list.slice();
    temp.splice(item.index, 1);
    temp.splice(item.hover.index, 0, item.data);
    return temp;
  }

  private buildHandList(cards: CardList): HandItem[] {
    return cards.cards.map((card, index) => {
      const item: HandItem = {
        card,
        index,
        scanUrl: this.cardsBaseService.getScanUrl(card)
      };
      return item;
    });
  }

  private syncSelectedCard() {
    if (this.cards.length === 0) {
      this.selectedCard = undefined;
      this.selectedIndex = 0;
      return;
    }

    const nextIndex = Math.min(this.selectedIndex, this.cards.length - 1);
    this.selectedIndex = Math.max(nextIndex, 0);
    this.selectedCard = this.cards[this.selectedIndex];
  }

}
