import { CardManager, type Card, type CardsInfo, CardType, EnergyCard, PokemonCard, SuperType, TrainerCard } from '@ptcg/common';

import { apiClient } from '@/lib/api-client';

type CardsInfoResponse = {
  cardsInfo: CardsInfo;
};

type CardsPageResponse = {
  cards: Card[];
};

export type CardCatalogFilter = {
  formatName: string;
  searchValue: string;
  superTypes: number[];
  cardTypes: number[];
};

type CatalogData = {
  cardManager: CardManager;
  cards: Card[];
  displayCards: Card[];
  names: string[];
  variantGroups: Map<string, Card[]>;
};

let catalogPromise: Promise<CatalogData> | null = null;

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

function compareCards(c1: Card, c2: Card): number {
  if (c1.superType !== c2.superType) {
    return c1.superType - c2.superType;
  }

  switch (c1.superType) {
    case SuperType.POKEMON: {
      const p1 = c1 as PokemonCard;
      const p2 = c2 as PokemonCard;
      const type1 = p1.cardTypes.length > 0 ? p1.cardTypes[0] : CardType.ANY;
      const type2 = p2.cardTypes.length > 0 ? p2.cardTypes[0] : CardType.ANY;
      if (type1 !== type2) {
        return type1 - type2;
      }
      break;
    }
    case SuperType.ENERGY: {
      const e1 = c1 as EnergyCard;
      const e2 = c2 as EnergyCard;
      if (e1.energyType !== e2.energyType) {
        return e1.energyType - e2.energyType;
      }
      const type1 = e1.provides.length > 0 ? e1.provides[0] : CardType.ANY;
      const type2 = e2.provides.length > 0 ? e2.provides[0] : CardType.ANY;
      if (type1 !== type2) {
        return type1 - type2;
      }
      break;
    }
    case SuperType.TRAINER: {
      const t1 = c1 as TrainerCard;
      const t2 = c2 as TrainerCard;
      if (t1.trainerType !== t2.trainerType) {
        return t1.trainerType - t2.trainerType;
      }
      break;
    }
  }

  return c1.fullName < c2.fullName ? -1 : 1;
}

function normalizeVariantText(value: string | undefined): string {
  return (value || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTrainerText(value: string | undefined): string {
  return normalizeVariantText(value)
    .replace(/在自己的回合可以使用任意张物品卡。?/g, '')
    .replace(/在自己的回合可使用任意张物品卡。?/g, '')
    .replace(/[，。、「」『』（）()【】［］〔〕…・：:；;？！?！!,.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getPokemonVariantGroupKey(card: PokemonCard): string {
  const logicGroupKey = (card.rawData as { logic_group_key?: string } | undefined)?.logic_group_key;
  if (logicGroupKey) {
    return logicGroupKey;
  }

  const rawGroupKey = (card.rawData as { variant_group_key?: string } | undefined)?.variant_group_key;
  if (rawGroupKey) {
    return rawGroupKey;
  }

  return JSON.stringify({
    superType: card.superType,
    name: card.name,
    tags: card.tags,
    cardTypes: card.cardTypes,
    stage: card.stage,
    hp: card.hp,
    evolvesFrom: card.evolvesFrom,
    retreat: card.retreat,
    weakness: card.weakness,
    resistance: card.resistance,
    powers: card.powers.map(power => ({
      name: power.name,
      powerType: power.powerType,
      text: power.text
    })),
    attacks: card.attacks.map(attack => ({
      name: attack.name,
      cost: attack.cost,
      damage: attack.damage,
      text: attack.text
    }))
  });
}

function getTrainerVariantGroupKey(card: TrainerCard): string {
  const logicGroupKey = (card.rawData as { logic_group_key?: string } | undefined)?.logic_group_key;
  if (logicGroupKey) {
    return logicGroupKey;
  }

  const constructorName = card.constructor?.name;
  if (constructorName && constructorName !== 'GeneratedTrainerCard' && constructorName !== 'Object') {
    return `trainer:${card.trainerType}:${constructorName}`;
  }

  return JSON.stringify({
    superType: card.superType,
    trainerType: card.trainerType,
    name: normalizeVariantText(card.name),
    tags: card.tags,
    text: normalizeTrainerText(card.text),
    canUseOnFirstTurn: card.canUseOnFirstTurn,
    useWhenInPlay: card.useWhenInPlay
  });
}

function getEnergyVariantGroupKey(card: EnergyCard): string {
  const rawCard = (card.rawData?.raw_card as { yorenCode?: string } | undefined);
  if (rawCard?.yorenCode) {
    return `energy:${card.energyType}:${rawCard.yorenCode}`;
  }

  const rawGroupKey = (card.rawData as { variant_group_key?: string } | undefined)?.variant_group_key;
  if (rawGroupKey) {
    return rawGroupKey;
  }

  return JSON.stringify({
    superType: card.superType,
    energyType: card.energyType,
    name: card.name,
    tags: card.tags,
    text: card.text,
    provides: card.provides
  });
}

function getVariantGroupKey(card: Card): string {
  switch (card.superType) {
    case SuperType.POKEMON:
      return getPokemonVariantGroupKey(card as PokemonCard);
    case SuperType.TRAINER:
      return getTrainerVariantGroupKey(card as TrainerCard);
    case SuperType.ENERGY:
      return getEnergyVariantGroupKey(card as EnergyCard);
    default:
      return card.fullName;
  }
}

export function getRarityLabel(card: Card): string {
  return ((card.rawData?.raw_card as { details?: { rarityLabel?: string } } | undefined)?.details?.rarityLabel) || '';
}

export function getCollectionNumber(card: Card): string {
  return ((card.rawData?.raw_card as { details?: { collectionNumber?: string } } | undefined)?.details?.collectionNumber) || '';
}

function getCollectionNumberValue(value: string): number {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : -1;
}

function getRarityRank(rarityLabel: string): number {
  const label = rarityLabel.toUpperCase();
  if (label.includes('SAR')) return 700;
  if (label.includes('UR')) return 650;
  if (label.includes('SR')) return 600;
  if (label.includes('AR')) return 550;
  if (label.includes('ACE')) return 500;
  if (label.includes('RRR')) return 450;
  if (label.includes('RR')) return 400;
  if (label.includes('R')) return 300;
  if (label.includes('U')) return 200;
  if (label.includes('C')) return 100;
  return 0;
}

function compareVariantCards(left: Card, right: Card): number {
  const rarityDiff = getRarityRank(getRarityLabel(right)) - getRarityRank(getRarityLabel(left));
  if (rarityDiff !== 0) {
    return rarityDiff;
  }

  const leftNumber = getCollectionNumberValue(getCollectionNumber(left));
  const rightNumber = getCollectionNumberValue(getCollectionNumber(right));
  if (leftNumber !== rightNumber) {
    return rightNumber - leftNumber;
  }

  return compareCards(left, right);
}

async function loadCatalog(): Promise<CatalogData> {
  const [cardsInfoResponse, cards] = await Promise.all([
    apiClient.get<CardsInfoResponse>('/v1/cards/info'),
    fetchAllCards()
  ]);

  const cardManager = CardManager.getInstance();
  cardManager.loadCardsInfo(cardsInfoResponse.cardsInfo, cards);

  const sortedCards = cardManager.getAllCards().slice().sort(compareCards);
  const variantGroups = new Map<string, Card[]>();

  sortedCards.forEach(card => {
    const key = getVariantGroupKey(card);
    const group = variantGroups.get(key) || [];
    group.push(card);
    variantGroups.set(key, group);
  });

  variantGroups.forEach(group => group.sort(compareVariantCards));

  const displayCards = Array.from(variantGroups.values())
    .map(group => group[0])
    .sort(compareCards);

  return {
    cardManager,
    cards: sortedCards,
    displayCards,
    names: sortedCards.map(card => card.fullName),
    variantGroups
  };
}

async function getCatalog(): Promise<CatalogData> {
  if (!catalogPromise) {
    catalogPromise = loadCatalog();
  }
  return catalogPromise;
}

export async function getDisplayCards(): Promise<Card[]> {
  return (await getCatalog()).displayCards;
}

export async function getCardByName(cardName: string): Promise<Card | undefined> {
  return (await getCatalog()).cardManager.getCardByName(cardName);
}

export async function getAllFormatNames(): Promise<string[]> {
  return (await getCatalog()).cardManager.getAllFormats().map(format => format.name);
}

export async function getVariantCards(card: Card): Promise<Card[]> {
  return (await getCatalog()).variantGroups.get(getVariantGroupKey(card)) || [card];
}

export async function isCardFromFormat(cardName: string, formatName: string): Promise<boolean> {
  const catalog = await getCatalog();
  return catalog.cardManager.getCardFormats(cardName).some(format => format.name === formatName);
}

export function getCardTypes(card: Card): CardType[] {
  if (card.superType === SuperType.POKEMON) {
    return (card as PokemonCard).cardTypes;
  }
  if (card.superType === SuperType.ENERGY) {
    return (card as EnergyCard).provides;
  }
  return [];
}

export function getCardScanUrl(card: Card, apiUrl: string, scansUrl: string): string {
  const remoteImageUrl = (card as Card & { rawData?: { image_url?: string } }).rawData?.image_url;
  if (remoteImageUrl) {
    return remoteImageUrl;
  }

  return `${apiUrl}${scansUrl}`
    .replace('{set}', card.set)
    .replace('{name}', card.fullName);
}

function matchesStandardRegulationMark(card: Card): boolean {
  const regulationMarkText = (card.rawData?.raw_card as { details?: { regulationMarkText?: string } } | undefined)?.details?.regulationMarkText;
  return typeof regulationMarkText === 'string' && new Set(['F', 'G', 'H']).has(regulationMarkText.toUpperCase());
}

export async function matchesFormat(card: Card, formatName: string): Promise<boolean> {
  if (formatName === 'Standard') {
    return matchesStandardRegulationMark(card);
  }
  return isCardFromFormat(card.fullName, formatName);
}

export function matchesSearch(card: Card, searchValue: string): boolean {
  const lowered = searchValue.toLowerCase().trim();
  if (!lowered) {
    return true;
  }

  const rawCard = (card.rawData?.raw_card as Record<string, unknown> | undefined) || {};
  const rawDetails = (rawCard.details as Record<string, unknown> | undefined) || {};
  const collection = (card.rawData?.collection as Record<string, unknown> | undefined) || {};
  const chineseName = typeof rawCard.name === 'string' ? rawCard.name.toLowerCase() : '';
  const cardText = typeof (card as Card & { text?: string }).text === 'string' ? ((card as Card & { text?: string }).text || '').toLowerCase() : '';
  const collectionNumber = typeof rawDetails.collectionNumber === 'string' ? rawDetails.collectionNumber.toLowerCase() : '';
  const rarityLabel = typeof rawDetails.rarityLabel === 'string' ? rawDetails.rarityLabel.toLowerCase() : '';
  const yorenCode = typeof rawCard.yorenCode === 'string' ? rawCard.yorenCode.toLowerCase() : '';
  const commodityCode = typeof rawCard.commodityCode === 'string' ? rawCard.commodityCode.toLowerCase() : '';
  const collectionName = typeof collection.name === 'string' ? collection.name.toLowerCase() : '';

  return card.name.toLowerCase().includes(lowered)
    || chineseName.includes(lowered)
    || card.fullName.toLowerCase().includes(lowered)
    || cardText.includes(lowered)
    || collectionNumber.includes(lowered)
    || rarityLabel.includes(lowered)
    || yorenCode.includes(lowered)
    || commodityCode.includes(lowered)
    || collectionName.includes(lowered);
}

export async function filterDisplayCards(cards: Card[], filter: CardCatalogFilter): Promise<Card[]> {
  if (!filter.searchValue && !filter.formatName && filter.superTypes.length === 0 && filter.cardTypes.length === 0) {
    return cards;
  }

  const checks = await Promise.all(cards.map(async card => {
    if (filter.formatName && !(await matchesFormat(card, filter.formatName))) {
      return false;
    }
    if (!matchesSearch(card, filter.searchValue)) {
      return false;
    }
    if (filter.superTypes.length > 0 && !filter.superTypes.includes(card.superType)) {
      return false;
    }
    if (filter.cardTypes.length > 0 && !filter.cardTypes.every(type => getCardTypes(card).includes(type))) {
      return false;
    }
    return true;
  }));

  return cards.filter((_, index) => checks[index]);
}
