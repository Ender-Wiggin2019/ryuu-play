import { Pipe, PipeTransform } from '@angular/core';

import { DeckEditToolbarFilter } from './deck-edit-toolbar-filter.interface';
import { Card, CardType, SuperType, PokemonCard, EnergyCard } from '@ptcg/common';
import { LibraryItem } from '../deck-card/deck-card.interface';
import { CardsBaseService } from '../../shared/cards/cards-base.service';

@Pipe({
  name: 'filterCards'
})
export class FilterCardsPipe implements PipeTransform {

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
      if (filter.formatName !== '' && !this.cardBaseService.isCardFromFormat(card.fullName, filter.formatName)) {
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

  private matchesSearch(card: Card, searchValue: string): boolean {
    const rawName = (card.rawData?.raw_card as { name?: unknown } | undefined)?.name;
    const chineseName = typeof rawName === 'string' ? rawName.toLowerCase() : '';

    return card.name.toLowerCase().includes(searchValue)
      || chineseName.includes(searchValue)
      || card.fullName.toLowerCase().includes(searchValue);
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

}
