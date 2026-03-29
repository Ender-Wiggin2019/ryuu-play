import { Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Card, CardList } from '@ptcg/common';
import { CardInfoPaneOptions, CardInfoPaneAction } from '../card-info-pane/card-info-pane.component';
import { CardListPopupComponent, CardListPopupData } from '../card-list-popup/card-list-popup.component';

export interface CardInfoPopupData {
  card?: Card;
  cardList?: CardList;
  options?: CardInfoPaneOptions;
  allowReveal?: boolean;
  facedown?: boolean;
}

@Component({
  selector: 'ptcg-card-info-popup',
  templateUrl: './card-info-popup.component.html',
  styleUrls: ['./card-info-popup.component.scss']
})
export class CardInfoPopupComponent {

  public card: Card;
  public cardList: CardList;
  public facedown: boolean;
  public allowReveal: boolean;
  public options: CardInfoPaneOptions;
  private data: CardInfoPopupData;

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CardInfoPopupComponent>,
    @Inject(MAT_DIALOG_DATA) data: CardInfoPopupData,
  ) {
    this.data = data;
    this.card = data.card;
    this.cardList = data.cardList;
    this.facedown = data.facedown;
    this.allowReveal = data.allowReveal;
    this.options = data.options || {};
  }

  public async showCardList(): Promise<void> {
    const data: CardListPopupData = {
      card: this.card,
      cardList: this.cardList,
      facedown: this.facedown
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 767;
    const dialog = this.dialog.open(CardListPopupComponent, {
      maxWidth: isMobile ? '100vw' : '100%',
      width: isMobile ? '100vw' : '670px',
      height: isMobile ? '100vh' : undefined,
      maxHeight: isMobile ? '100vh' : '92vh',
      panelClass: ['ptcg-card-dialog', isMobile ? 'ptcg-card-dialog-mobile' : 'ptcg-card-dialog-desktop'],
      data
    });

    const card = await dialog.afterClosed().toPromise();
    if (card !== undefined) {
      this.card = card;
    }
  }

  public close(result?: CardInfoPaneAction) {
    this.dialogRef.close(result);
  }

}
