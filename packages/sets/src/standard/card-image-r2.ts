import { CARD_IMAGE_URLS_BY_ID } from './card-image-r2.generated';

export function getR2CardImageUrl(cardId: number): string {
  return CARD_IMAGE_URLS_BY_ID[cardId] ?? '';
}

export function getCardImageUrl(cardId: number): string {
  return getR2CardImageUrl(cardId) || `/api/v1/cards/${cardId}/image`;
}
