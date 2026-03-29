import { Pipe, PipeTransform } from '@angular/core';

import { DeckEditToolbarFilter } from './deck-edit-toolbar-filter.interface';
import { Card, CardType, SuperType, PokemonCard, EnergyCard } from '@ptcg/common';
import { LibraryItem } from '../deck-card/deck-card.interface';
import { CardsBaseService } from '../../shared/cards/cards-base.service';

@Pipe({
  name: 'filterCards'
})
export class FilterCardsPipe implements PipeTransform {

  private readonly standardRegulationMarks = new Set(['F', 'G', 'H']);

  constructor(private cardBaseService: CardsBaseService) { }

  transform(items: LibraryItem[], filter: DeckEditToolbarFilter): any {

    if (filter === undefined) {
      return items;
    }

    if (filter.searchValue === ''
      && filter.formatName === ''
      && filter.superTypes.length === 0
      && filter.cardTypes.length === 0) {
      return items;
    }

    const searchValue = filter.searchValue.toLowerCase().trim();

    return items.filter(item => {
      const card = item.card;
      if (filter.formatName !== '' && !this.matchesFormat(card, filter.formatName)) {
        return false;
      }

      if (searchValue !== '' && !this.matchesSearch(card, searchValue)) {
        return false;
      }

      if (filter.superTypes.length && !filter.superTypes.includes(card.superType)) {
        return false;
      }

      if (filter.cardTypes.length && !filter.cardTypes.every(t => this.getCardTypes(card).includes(t))) {
        return false;
      }

      return true;
    });
  }

  private matchesFormat(card: Card, formatName: string): boolean {
    if (formatName === 'Standard') {
      return this.matchesStandardRegulationMark(card);
    }

    return this.cardBaseService.isCardFromFormat(card.fullName, formatName);
  }

  private matchesSearch(card: Card, searchValue: string): boolean {
    const cardRecord = card as Card & { text?: unknown };
    const rawCard = (card.rawData?.raw_card as Record<string, unknown> | undefined) || {};
    const rawDetails = (rawCard.details as Record<string, unknown> | undefined) || {};
    const collection = (card.rawData?.collection as Record<string, unknown> | undefined) || {};
    const rawName = rawCard.name;
    const chineseName = typeof rawName === 'string' ? rawName.toLowerCase() : '';
    const cardText = typeof cardRecord.text === 'string' ? cardRecord.text.toLowerCase() : '';
    const collectionNumber = typeof rawDetails.collectionNumber === 'string' ? rawDetails.collectionNumber.toLowerCase() : '';
    const rarityLabel = typeof rawDetails.rarityLabel === 'string' ? rawDetails.rarityLabel.toLowerCase() : '';
    const yorenCode = typeof rawCard.yorenCode === 'string' ? rawCard.yorenCode.toLowerCase() : '';
    const commodityCode = typeof rawCard.commodityCode === 'string' ? rawCard.commodityCode.toLowerCase() : '';
    const collectionName = typeof collection.name === 'string' ? collection.name.toLowerCase() : '';

    return card.name.toLowerCase().includes(searchValue)
      || chineseName.includes(searchValue)
      || card.fullName.toLowerCase().includes(searchValue)
      || cardText.includes(searchValue)
      || collectionNumber.includes(searchValue)
      || rarityLabel.includes(searchValue)
      || yorenCode.includes(searchValue)
      || commodityCode.includes(searchValue)
      || collectionName.includes(searchValue);
  }

  private getCardTypes(card: Card): CardType[] {
    if (card.superType === SuperType.POKEMON) {
      return (card as PokemonCard).cardTypes;
    }
    if (card.superType === SuperType.ENERGY) {
      return (card as EnergyCard).provides;
    }
    return []
  }

  private matchesStandardRegulationMark(card: Card): boolean {
    const rawCard = (card.rawData?.raw_card as Record<string, unknown> | undefined) || {};
    const rawDetails = (rawCard.details as Record<string, unknown> | undefined) || {};
    const regulationMarkText = rawDetails.regulationMarkText;

    return typeof regulationMarkText === 'string'
      && this.standardRegulationMarks.has(regulationMarkText.toUpperCase());
  }

}
