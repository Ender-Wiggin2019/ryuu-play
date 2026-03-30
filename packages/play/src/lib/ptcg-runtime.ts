import { apiClient } from '@/lib/api-client';

import { Base64 } from '../../../common/src/utils/base64';
import { StateSerializer } from '../../../common/src/serializer/state-serializer';
import type { Card } from '../../../common/src/store/card/card';
import type { State } from '../../../common/src/store/state/state';

type CardsPageResponse = {
  cards: Card[];
};

let loadCardsPromise: Promise<void> | null = null;

async function fetchAllCards(): Promise<Card[]> {
  const cards: Card[] = [];
  let page = 0;
  while (true) {
    const response = await apiClient.get<CardsPageResponse>(`/v1/cards/get/${page}`);
    if (!response.cards || response.cards.length === 0) {
      break;
    }
    cards.push(...response.cards);
    page += 1;
  }
  return cards;
}

export async function ensureCardRuntimeReady(): Promise<void> {
  if (!loadCardsPromise) {
    loadCardsPromise = (async () => {
      const cards = await fetchAllCards();
      StateSerializer.setKnownCards(cards);
    })();
  }
  return loadCardsPromise;
}

export async function decodeStateData(stateData: string): Promise<State> {
  await ensureCardRuntimeReady();
  const base64 = new Base64();
  const serializer = new StateSerializer();
  const serializedState = base64.decode(stateData);
  return serializer.deserialize(serializedState);
}
