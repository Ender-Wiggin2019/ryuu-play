import { Card, PokemonCard } from '@ptcg/common';

export function getSpecialCardLabels(card: Card): string[] {
  const cardData = card as any;
  const rawData = cardData.rawData || {};
  const nestedRawData = rawData.rawData || {};
  return [
    rawData.raw_card?.details?.specialCardLabel,
    rawData.api_card?.specialCardLabel,
    rawData.raw_card?.specialCard,
    rawData.api_card?.specialCard,
    nestedRawData.raw_card?.details?.specialCardLabel,
    nestedRawData.api_card?.specialCardLabel,
    nestedRawData.raw_card?.specialCard,
    nestedRawData.api_card?.specialCard,
  ]
    .filter((label: unknown): label is string => typeof label === 'string')
    .map(label => label.trim().toLowerCase());
}

export function hasSpecialCardLabel(card: Card, label: string): boolean {
  const normalized = label.trim().toLowerCase();
  return getSpecialCardLabels(card).some(value => value === normalized);
}

export function isAncientPokemonCard(card: Card): card is PokemonCard {
  return card instanceof PokemonCard && hasSpecialCardLabel(card, '古代');
}
