import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Card } from '@ptcg/common';

import { CardsBaseService } from '../../shared/cards/cards-base.service';
import { FileInput } from '../../shared/file-input/file-input.model';
import { SessionService } from '../../shared/session/session.service';

@Component({
  selector: 'ptcg-import-deck-popup',
  templateUrl: './import-deck-popup.component.html',
  styleUrls: ['./import-deck-popup.component.scss']
})
export class ImportDeckPopupComponent {

  public loading = false;
  public deckFile: FileInput;
  public name: string;
  public deckError: string;
  public deckTextError = '';
  public deckText = '';
  public maxFileSize: number;
  public cardNames: string[] | undefined;
  public unmatchedLines: string[] = [];

  constructor(
    private cardsBaseService: CardsBaseService,
    private dialogRef: MatDialogRef<ImportDeckPopupComponent>,
    private sessionService: SessionService
  ) {
    this.maxFileSize = this.sessionService.session.config.avatarFileSize;
  }

  public updatePreview(value: FileInput) {
    this.cardNames = undefined;
    this.deckTextError = '';
    this.unmatchedLines = [];

    if (value === null || value.files.length === 0) {
      this.deckError = '';
      return;
    }

    const file = value.files[0];

    // handled by different validator
    if (file.size > this.maxFileSize) {
      this.deckError = '';
      return;
    }

    this.loading = true;
    const fileReader = new FileReader();

    fileReader.onload = event => {
      const deckData = event.target.result as string;
      const parsedDeck = this.parseDeckData(deckData);
      if (parsedDeck.cardNames !== undefined) {
        this.cardNames = parsedDeck.cardNames;
        this.deckError = '';
        this.deckTextError = '';
        this.unmatchedLines = [];
      } else {
        this.cardNames = undefined;
        this.deckError = parsedDeck.error;
        this.deckTextError = parsedDeck.error;
        this.unmatchedLines = parsedDeck.unmatchedLines;
      }
      this.loading = false;
    };

    fileReader.onerror = () => {
      this.loading = false;
      this.deckError = 'CANNOT_READ_DECK_FILE';
    };

    fileReader.readAsText(file);
  }

  public updatePreviewFromText(value: string) {
    this.deckText = value;
    this.deckError = '';
    this.cardNames = undefined;
    this.unmatchedLines = [];

    if (!value || value.trim() === '') {
      this.deckTextError = '';
      return;
    }

    const parsedDeck = this.parseDeckData(value);
    if (parsedDeck.cardNames !== undefined) {
      this.cardNames = parsedDeck.cardNames;
      this.deckTextError = '';
    } else {
      this.deckTextError = parsedDeck.error;
      this.unmatchedLines = parsedDeck.unmatchedLines;
    }
  }

  private parseDeckData(data: string): { cardNames: string[] | undefined; error: string; unmatchedLines: string[] } {
    const cardNames: string[] = [];
    const unmatchedLines: string[] = [];
    const lines = data
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line !== '');

    for (const line of lines) {
      if (this.isDeckHeaderLine(line)) {
        continue;
      }

      const decodedLine = this.decodeDeckLine(line);
      if (decodedLine === undefined) {
        unmatchedLines.push(line);
        continue;
      }

      for (let i = 0; i < decodedLine.count; i++) {
        cardNames.push(decodedLine.card.fullName);
      }
    }

    if (unmatchedLines.length > 0) {
      return {
        cardNames: undefined,
        error: 'DECK_IMPORT_CANNOT_MATCH',
        unmatchedLines
      };
    }

    if (cardNames.length === 0) {
      return {
        cardNames: undefined,
        error: 'CANNOT_DECODE_DECK_FILE',
        unmatchedLines: []
      };
    }

    return {
      cardNames,
      error: '',
      unmatchedLines: []
    };
  }

  private decodeDeckLine(line: string): { count: number; card: Card } | undefined {
    const exactCard = this.cardsBaseService.getCardByName(line);
    if (exactCard !== undefined) {
      return { count: 1, card: exactCard };
    }

    const countMatch = line.match(/^(\d+)\s+(.+)$/);
    const count = countMatch ? parseInt(countMatch[1], 10) : 1;
    const body = countMatch ? countMatch[2].trim() : line;
    if (body.length === 0 || count <= 0) {
      return undefined;
    }
    const exactBodyCard = this.cardsBaseService.getCardByName(body);
    if (exactBodyCard !== undefined) {
      return { count, card: exactBodyCard };
    }

    const tokens = body.split(/\s+/).filter(token => token !== '');
    let cardName = body;
    let editionCode: string | undefined;
    let editionNumber: string | undefined;

    if (tokens.length >= 3) {
      const possibleEditionCode = tokens[tokens.length - 2];
      const possibleEditionNumber = tokens[tokens.length - 1];
      const editionLooksValid = /[A-Za-z]/.test(possibleEditionCode) && /[0-9A-Za-z]/.test(possibleEditionNumber);
      if (editionLooksValid) {
        cardName = tokens.slice(0, -2).join(' ');
        editionCode = possibleEditionCode;
        editionNumber = possibleEditionNumber;
      }
    }

    const card = this.resolveCardByName(cardName, editionCode, editionNumber);
    if (card === undefined) {
      return undefined;
    }

    return { count, card };
  }

  private resolveCardByName(name: string, editionCode?: string, editionNumber?: string): Card | undefined {
    const normalizedName = this.normalizeCardToken(name);
    const candidates = this.cardsBaseService.getCards()
      .filter(card => this.normalizeCardToken(card.name) === normalizedName);

    if (candidates.length === 0) {
      return undefined;
    }

    if (editionCode !== undefined && editionNumber !== undefined) {
      const matchingEdition = candidates.find(card => this.matchesEdition(card, editionCode, editionNumber));
      if (matchingEdition !== undefined) {
        return matchingEdition;
      }
    }

    return candidates[0];
  }

  private matchesEdition(card: Card, editionCode: string, editionNumber: string): boolean {
    const normalizedEditionCode = this.normalizeCardToken(editionCode);
    const normalizedEditionNumber = this.normalizeCardToken(editionNumber);
    const expectedEditionNumber = this.extractCollectionNumber(editionNumber);

    const rawData = card.rawData as {
      collection?: { commodityCode?: string };
      raw_card?: { commodityCode?: string; details?: { collectionNumber?: string } };
    } | undefined;
    const collectionCode = rawData?.collection?.commodityCode;
    const rawCardCode = rawData?.raw_card?.commodityCode;
    const fullNameCode = card.fullName.split(/\s+/).pop();
    const candidateEditionCode = this.normalizeCardToken(collectionCode || rawCardCode || fullNameCode || '');

    const collectionNumber = rawData?.raw_card?.details?.collectionNumber || '';
    const candidateEditionNumber = this.extractCollectionNumber(collectionNumber);

    const codeMatches = candidateEditionCode === normalizedEditionCode;
    const numberMatches = candidateEditionNumber === expectedEditionNumber
      || this.normalizeCardToken(collectionNumber) === normalizedEditionNumber;

    return codeMatches && numberMatches;
  }

  private extractCollectionNumber(collectionNumber: string): string {
    const normalized = this.normalizeCardToken(collectionNumber);
    const match = normalized.match(/[0-9]+/);
    return match ? match[0] : normalized;
  }

  private normalizeCardToken(token: string): string {
    return token
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isDeckHeaderLine(line: string): boolean {
    return /^by\s*:/i.test(line)
      || /^pok[eé]mon\s*:/i.test(line)
      || /^trainer\s*:/i.test(line)
      || /^energy\s*:/i.test(line)
      || /^total cards\s*:/i.test(line);
  }

  public importDeck() {
    this.dialogRef.close(this.cardNames);
  }

}
