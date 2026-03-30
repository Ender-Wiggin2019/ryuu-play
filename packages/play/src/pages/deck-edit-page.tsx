import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CardType, SuperType, type Card } from '@ptcg/common';
import { useDrag, useDrop } from 'react-dnd';

import { FileInputButton } from '@/components/shared/file-input-button';
import { TableDndProvider } from '@/components/table/table-dnd-provider';
import { Button } from '@/components/ui/button';
import { Card as UiCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { FilterCombobox } from '@/components/ui/filter-combobox';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import {
  filterDisplayCards,
  getAllFormatNames,
  getCardByName,
  getCardScanUrl,
  getCollectionNumber,
  getDisplayCards,
  getRarityLabel,
  getVariantCards,
  type CardCatalogFilter
} from '@/lib/cards-catalog';
import { useAuth } from '@/lib/auth-context';
import { showToast } from '@/lib/toast';

type Deck = {
  id: number;
  name: string;
  cardType: number[];
  formatNames: string[];
  isValid: boolean;
  cards: string[];
};

type DeckResponse = {
  deck: Deck;
};

type DeckEntry = {
  card: Card;
  count: number;
  scanUrl: string;
  variantCards: Card[];
};

type CardDialogState = {
  open: boolean;
  card: Card | null;
  scanUrl: string;
};

type VariantDialogState = {
  open: boolean;
  cards: Card[];
  selected: Card | null;
  targetIndex?: number;
};

type MobilePane = 'library' | 'deck' | 'split';

type VirtualGridState = {
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  startIndex: number;
  endIndex: number;
  topSpacerHeight: number;
  bottomSpacerHeight: number;
};

const CARD_WIDTH = 160;
const CARD_HEIGHT = 248;
const CARD_GAP = 12;
const OVERSCAN_ROWS = 3;

const CARD_TYPE_OPTIONS = [
  { value: CardType.COLORLESS, label: 'LABEL_COLORLESS' },
  { value: CardType.GRASS, label: 'LABEL_GRASS' },
  { value: CardType.FIGHTING, label: 'LABEL_FIGHTING' },
  { value: CardType.PSYCHIC, label: 'LABEL_PSYCHIC' },
  { value: CardType.WATER, label: 'LABEL_WATER' },
  { value: CardType.LIGHTNING, label: 'LABEL_LIGHTNING' },
  { value: CardType.METAL, label: 'LABEL_METAL' },
  { value: CardType.DARK, label: 'LABEL_DARK' },
  { value: CardType.FIRE, label: 'LABEL_FIRE' },
  { value: CardType.DRAGON, label: 'LABEL_DRAGON' },
  { value: CardType.FAIRY, label: 'LABEL_FAIRY' }
];

const SUPER_TYPE_OPTIONS = [
  { value: SuperType.POKEMON, label: 'LABEL_POKEMON' },
  { value: SuperType.TRAINER, label: 'LABEL_TRAINER' },
  { value: SuperType.ENERGY, label: 'LABEL_ENERGY' }
];

const DECK_DND_ITEM = {
  LIBRARY_CARD: 'DECK_LIBRARY_CARD',
  DECK_CARD: 'DECK_CARD'
} as const;

type LibraryDragItem = {
  type: typeof DECK_DND_ITEM.LIBRARY_CARD;
  card: Card;
};

type DeckDragItem = {
  type: typeof DECK_DND_ITEM.DECK_CARD;
  fullName: string;
  orderIndex: number;
};

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildCardsText(entries: DeckEntry[]): string {
  return entries.flatMap(entry => Array.from({ length: entry.count }, () => entry.card.fullName)).join('\n');
}

function getStageLabel(card: Card): string {
  const stage = (card as Card & { stage?: number }).stage;
  switch (stage) {
    case 0:
      return 'Basic';
    case 1:
      return 'Stage 1';
    case 2:
      return 'Stage 2';
    case 3:
      return 'Restored';
    default:
      return '';
  }
}

function getCardTypesLabel(card: Card): string {
  const cardTypes = (card as Card & { cardTypes?: number[] }).cardTypes;
  if (Array.isArray(cardTypes) && cardTypes.length > 0) {
    return cardTypes.join(', ');
  }
  const provides = (card as Card & { provides?: number[] }).provides;
  if (Array.isArray(provides) && provides.length > 0) {
    return provides.join(', ');
  }
  return '';
}

function getTrainerTypeLabel(card: Card): string {
  const trainerType = (card as Card & { trainerType?: number }).trainerType;
  switch (trainerType) {
    case 1:
      return 'Supporter';
    case 2:
      return 'Stadium';
    case 3:
      return 'Pokemon Tool';
    default:
      return 'Item';
  }
}

function formatStatList(items: Array<{ type?: number; value?: string | number }> | undefined): string {
  if (!items || items.length === 0) {
    return '-';
  }
  return items.map(item => `${String(item.type ?? '-')}${item.value ? ` ${String(item.value)}` : ''}`).join(', ');
}

function useVirtualGrid(itemCount: number): VirtualGridState {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(720);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const onScroll = () => setScrollTop(node.scrollTop);
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (!rect) {
        return;
      }
      setContainerWidth(rect.width);
      setContainerHeight(rect.height);
    });

    observer.observe(node);
    onScroll();
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      node.removeEventListener('scroll', onScroll);
    };
  }, [itemCount]);

  const columns = Math.max(1, Math.floor((containerWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP)));
  const rowHeight = CARD_HEIGHT + CARD_GAP;
  const totalRows = Math.ceil(itemCount / columns);
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN_ROWS);
  const endRow = Math.min(totalRows, Math.ceil((scrollTop + containerHeight) / rowHeight) + OVERSCAN_ROWS);

  return {
    containerRef,
    startIndex: startRow * columns,
    endIndex: Math.min(itemCount, endRow * columns),
    topSpacerHeight: startRow * rowHeight,
    bottomSpacerHeight: Math.max(0, (totalRows - endRow) * rowHeight)
  };
}

function CardTile(props: {
  imageUrl: string;
  title: string;
  subtitle: string;
  count?: number;
  actions: React.ReactNode;
  attachRef?: (node: HTMLDivElement | null) => void;
  style?: React.CSSProperties;
}): JSX.Element {
  const { imageUrl, title, subtitle, count, actions, attachRef, style } = props;

  return (
    <div ref={attachRef} className="mx-auto flex w-[160px] flex-col gap-2" style={style}>
      <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <img src={imageUrl} alt={title} className="h-[214px] w-[160px] object-cover" />
        {count !== undefined && (
          <div className="absolute right-2 top-2 rounded-full bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
            {count}x
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {actions}
      </div>
    </div>
  );
}

function LibraryCardTile(props: {
  card: Card;
  imageUrl: string;
  onAdd: (card: Card) => void;
  onShowInfo: (card: Card, imageUrl: string) => void;
}): JSX.Element {
  const { card, imageUrl, onAdd, onShowInfo } = props;
  const [{ isDragging }, dragRef] = useDrag<LibraryDragItem, void, { isDragging: boolean }>(() => ({
    type: DECK_DND_ITEM.LIBRARY_CARD,
    item: { type: DECK_DND_ITEM.LIBRARY_CARD, card },
    collect: monitor => ({ isDragging: monitor.isDragging() })
  }), [card]);

  return (
    <CardTile
      imageUrl={imageUrl}
      title={card.name}
      subtitle={card.fullName}
      attachRef={dragRef}
      style={{ opacity: isDragging ? 0.45 : 1 }}
      actions={(
        <>
          <Button size="sm" variant="outline" onClick={() => onShowInfo(card, imageUrl)}>Info</Button>
          <Button size="sm" onClick={() => onAdd(card)}>Add</Button>
        </>
      )}
    />
  );
}

function DeckCardTile(props: {
  entry: DeckEntry;
  orderIndex: number;
  onMove: (from: number, to: number) => void;
  onDropLibraryCard: (card: Card, targetIndex: number) => void;
  onRemove: (fullName: string) => void;
  onAdd: (card: Card) => void;
  onShowInfo: (card: Card, imageUrl: string) => void;
}): JSX.Element {
  const { entry, orderIndex, onMove, onDropLibraryCard, onRemove, onAdd, onShowInfo } = props;
  const [{ isDragging }, dragRef] = useDrag<DeckDragItem, void, { isDragging: boolean }>(() => ({
    type: DECK_DND_ITEM.DECK_CARD,
    item: { type: DECK_DND_ITEM.DECK_CARD, fullName: entry.card.fullName, orderIndex },
    collect: monitor => ({ isDragging: monitor.isDragging() })
  }), [entry.card.fullName, orderIndex]);

  const [{ isOver }, dropRef] = useDrop<LibraryDragItem | DeckDragItem, void, { isOver: boolean }>(() => ({
    accept: [DECK_DND_ITEM.LIBRARY_CARD, DECK_DND_ITEM.DECK_CARD],
    hover: item => {
      if (item.type !== DECK_DND_ITEM.DECK_CARD || item.orderIndex === orderIndex) {
        return;
      }
      onMove(item.orderIndex, orderIndex);
      item.orderIndex = orderIndex;
    },
    drop: item => {
      if (item.type === DECK_DND_ITEM.LIBRARY_CARD) {
        onDropLibraryCard(item.card, orderIndex);
      }
    },
    collect: monitor => ({ isOver: monitor.isOver({ shallow: true }) })
  }), [onDropLibraryCard, onMove, orderIndex]);

  return (
    <CardTile
      imageUrl={entry.scanUrl}
      title={entry.card.name}
      subtitle={entry.card.fullName}
      count={entry.count}
      attachRef={node => dragRef(dropRef(node))}
      style={{
        opacity: isDragging ? 0.45 : 1,
        outline: isOver ? '2px solid hsl(var(--ring))' : undefined
      }}
      actions={(
        <>
          <Button size="sm" variant="outline" onClick={() => onShowInfo(entry.card, entry.scanUrl)}>Info</Button>
          <Button size="sm" variant="outline" onClick={() => onRemove(entry.card.fullName)}>-</Button>
          <Button size="sm" variant="outline" onClick={() => onAdd(entry.card)}>+</Button>
        </>
      )}
    />
  );
}

function DeckEditPageContent(props: { deckId: number; scansUrl: string }): JSX.Element {
  const { deckId, scansUrl } = props;
  const { t } = useTranslation();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [error, setError] = useState('');
  const [deckName, setDeckName] = useState('');
  const [formatNames, setFormatNames] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [formatOptions, setFormatOptions] = useState<string[]>([]);
  const [displayCards, setDisplayCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [deckEntries, setDeckEntries] = useState<DeckEntry[]>([]);
  const [cardDialog, setCardDialog] = useState<CardDialogState>({ open: false, card: null, scanUrl: '' });
  const [variantDialog, setVariantDialog] = useState<VariantDialogState>({ open: false, cards: [], selected: null });
  const [mobilePane, setMobilePane] = useState<MobilePane>('split');
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1280 : true);
  const [filter, setFilter] = useState<CardCatalogFilter>({
    formatName: '',
    searchValue: '',
    superTypes: [],
    cardTypes: []
  });
  const [draftFilter, setDraftFilter] = useState<CardCatalogFilter>({
    formatName: '',
    searchValue: '',
    superTypes: [],
    cardTypes: []
  });

  const totalCards = useMemo(() => deckEntries.reduce((sum, entry) => sum + entry.count, 0), [deckEntries]);
  const libraryGrid = useVirtualGrid(filteredCards.length);
  const deckGrid = useVirtualGrid(deckEntries.length);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1280);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toDeckEntry = useCallback(async (card: Card, count: number): Promise<DeckEntry> => ({
    card,
    count,
    variantCards: await getVariantCards(card),
    scanUrl: getCardScanUrl(card, auth.apiUrl, scansUrl)
  }), [auth.apiUrl, scansUrl]);

  const showCardInfo = (card: Card, scanUrl: string) => {
    setCardDialog({ open: true, card, scanUrl });
  };

  const addCardToDeck = useCallback(async (card: Card, targetIndex?: number) => {
    const existingIndex = deckEntries.findIndex(entry => entry.card.fullName === card.fullName);
    if (existingIndex !== -1) {
      setDeckEntries(current => current.map(entry => (
        entry.card.fullName === card.fullName
          ? { ...entry, count: entry.count + 1 }
          : entry
      )));
      return;
    }

    const variants = await getVariantCards(card);
    if (variants.length > 1) {
      setVariantDialog({
        open: true,
        cards: variants,
        selected: variants[0],
        targetIndex
      });
      return;
    }

    const entry = await toDeckEntry(card, 1);
    setDeckEntries(current => {
      const next = current.slice();
      const index = targetIndex === undefined ? next.length : Math.max(0, Math.min(targetIndex, next.length));
      next.splice(index, 0, entry);
      return next;
    });
  }, [deckEntries, toDeckEntry]);

  const confirmVariantSelection = async () => {
    if (!variantDialog.selected) {
      return;
    }

    const entry = await toDeckEntry(variantDialog.selected, 1);
    setDeckEntries(current => {
      const next = current.slice();
      const index = variantDialog.targetIndex === undefined ? next.length : Math.max(0, Math.min(variantDialog.targetIndex, next.length));
      next.splice(index, 0, entry);
      return next;
    });
    setVariantDialog({ open: false, cards: [], selected: null });
  };

  const removeCardFromDeck = (fullName: string) => {
    setDeckEntries(current => current.flatMap(entry => {
      if (entry.card.fullName !== fullName) {
        return [entry];
      }
      return entry.count <= 1 ? [] : [{ ...entry, count: entry.count - 1 }];
    }));
  };

  const moveDeckEntry = (from: number, to: number) => {
    setDeckEntries(current => {
      if (from === to || from < 0 || to < 0 || from >= current.length || to >= current.length) {
        return current;
      }
      const next = current.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const loadDeck = useCallback(async () => {
    if (!deckId) {
      setError('Invalid deck id.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get<DeckResponse>(`/v1/decks/get/${deckId}`);
      setDeckName(response.deck.name);
      setFormatNames(response.deck.formatNames || []);
      setIsValid(response.deck.isValid);

      const counts = new Map<string, number>();
      response.deck.cards.forEach(name => counts.set(name, (counts.get(name) || 0) + 1));
      const entries = await Promise.all(Array.from(counts.entries()).map(async ([name, count]) => {
        const card = await getCardByName(name);
        return card ? toDeckEntry(card, count) : null;
      }));
      setDeckEntries(entries.filter(Boolean) as DeckEntry[]);
    } catch (e) {
      setError((e as Error).message || 'Unable to load deck.');
    } finally {
      setLoading(false);
    }
  }, [deckId, toDeckEntry]);

  useEffect(() => {
    const loadCatalog = async () => {
      setCatalogLoading(true);
      try {
        const [cards, formats] = await Promise.all([getDisplayCards(), getAllFormatNames()]);
        setDisplayCards(cards);
        setFilteredCards(cards);
        setFormatOptions(formats);
      } catch (e) {
        setError((e as Error).message || 'Unable to load card catalog.');
      } finally {
        setCatalogLoading(false);
      }
    };

    void loadCatalog();
  }, []);

  useEffect(() => {
    void loadDeck();
  }, [loadDeck]);

  useEffect(() => {
    const applyFilter = async () => {
      setFilteredCards(await filterDisplayCards(displayCards, filter));
    };
    void applyFilter();
  }, [displayCards, filter]);

  const formatFilterOptions = useMemo(() => (
    [
      { label: t('DECK_EDIT_ALL_FORMATS', { defaultValue: 'All formats' }), value: '' },
      ...formatOptions.map(formatName => ({ label: formatName, value: formatName }))
    ]
  ), [formatOptions, t]);

  const superTypeFilterOptions = useMemo(() => (
    SUPER_TYPE_OPTIONS.map(option => ({
      label: t(option.label, { defaultValue: option.label }),
      value: String(option.value)
    }))
  ), [t]);

  const cardTypeFilterOptions = useMemo(() => (
    CARD_TYPE_OPTIONS.map(option => ({
      label: t(option.label, { defaultValue: option.label }),
      value: String(option.value)
    }))
  ), [t]);

  const applyDraftFilter = () => {
    setFilter({
      formatName: draftFilter.formatName,
      searchValue: draftFilter.searchValue.trim(),
      superTypes: draftFilter.superTypes,
      cardTypes: draftFilter.cardTypes
    });
  };

  const saveDeck = async () => {
    if (!deckName.trim()) {
      setError('Deck name is required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const cards = deckEntries.flatMap(entry => Array.from({ length: entry.count }, () => entry.card.fullName));
      const response = await apiClient.post<DeckResponse>('/v1/decks/save', {
        id: deckId,
        name: deckName.trim(),
        cards
      });
      setFormatNames(response.deck.formatNames || []);
      setIsValid(response.deck.isValid);
      showToast('success', t('DECK_EDIT_SAVED', { defaultValue: 'Deck saved.' }));
    } catch (e) {
      setError((e as Error).message || 'Unable to save deck.');
    } finally {
      setSaving(false);
    }
  };

  const importFile = async (file: File) => {
    const content = (await file.text()).replace(/\r\n/g, '\n').trim();
    const counts = new Map<string, number>();
    content.split('\n').map(line => line.trim()).filter(Boolean).forEach(name => {
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    const entries = await Promise.all(Array.from(counts.entries()).map(async ([name, count]) => {
      const card = await getCardByName(name);
      return card ? toDeckEntry(card, count) : null;
    }));
    setDeckEntries(entries.filter(Boolean) as DeckEntry[]);
  };

  const exportDeck = () => {
    downloadText(`${buildCardsText(deckEntries)}\n`, `${deckName || `deck-${deckId}`}.txt`);
    showToast('success', t('DECK_EXPORTED', { defaultValue: 'Deck exported.' }));
  };

  const [{ isDeckPaneOver }, deckPaneDropRef] = useDrop<LibraryDragItem, void, { isDeckPaneOver: boolean }>(() => ({
    accept: DECK_DND_ITEM.LIBRARY_CARD,
    drop: item => {
      void addCardToDeck(item.card);
    },
    collect: monitor => ({ isDeckPaneOver: monitor.isOver({ shallow: true }) })
  }), [addCardToDeck]);

  const [{ isLibraryPaneOver }, libraryPaneDropRef] = useDrop<DeckDragItem, void, { isLibraryPaneOver: boolean }>(() => ({
    accept: DECK_DND_ITEM.DECK_CARD,
    drop: item => {
      removeCardFromDeck(item.fullName);
    },
    collect: monitor => ({ isLibraryPaneOver: monitor.isOver({ shallow: true }) })
  }), []);

  const visibleLibraryCards = filteredCards.slice(libraryGrid.startIndex, libraryGrid.endIndex);
  const visibleDeckEntries = deckEntries.slice(deckGrid.startIndex, deckGrid.endIndex);
  const showLibraryPane = isDesktop || mobilePane !== 'deck';
  const showDeckPane = isDesktop || mobilePane !== 'library';

  return (
    <div className="grid gap-4">
        <UiCard>
          <CardHeader className="grid gap-3">
            <div className="app-toolbar">
              <h1>{t('DECK_EDIT_TITLE', { defaultValue: 'Editing deck: {{name}}', name: deckName || `#${deckId}` })}</h1>
              <span className="app-toolbar-spacer" />
              <Button asChild variant="outline" size="sm">
                <Link to="/deck">{t('DECK_EDIT_BACK', { defaultValue: 'Back' })}</Link>
              </Button>
              <Button size="sm" variant="outline" onClick={exportDeck} disabled={loading}>
                {t('BUTTON_EXPORT', { defaultValue: 'Export' })}
              </Button>
              <FileInputButton
                accept=".txt,text/plain"
                disabled={loading}
                label={t('BUTTON_IMPORT_FROM_FILE', { defaultValue: 'Import from file' })}
                onSelect={importFile}
                variant="outline"
              />
              <Button size="sm" onClick={() => void saveDeck()} disabled={saving || loading}>
                {t('BUTTON_SAVE', { defaultValue: 'Save' })}
              </Button>
            </div>

            <form
              className="grid gap-2 lg:grid-cols-[220px_260px_320px_minmax(0,1fr)_auto]"
              onSubmit={event => {
                event.preventDefault();
                applyDraftFilter();
              }}
            >
              <FilterCombobox
                options={formatFilterOptions}
                value={draftFilter.formatName}
                onChange={value => setDraftFilter(current => ({ ...current, formatName: String(value) }))}
                placeholder={t('DECK_EDIT_ALL_FORMATS', { defaultValue: 'All formats' })}
                searchPlaceholder={t('BUTTON_SEARCH', { defaultValue: 'Search' })}
              />

              <FilterCombobox
                multiple
                options={superTypeFilterOptions}
                value={draftFilter.superTypes.map(String)}
                onChange={value => setDraftFilter(current => ({
                  ...current,
                  superTypes: (value as string[]).map(Number)
                }))}
                placeholder={t('DECK_EDIT_ALL_CARDS', { defaultValue: 'All cards' })}
                searchPlaceholder={t('BUTTON_SEARCH', { defaultValue: 'Search' })}
              />

              <FilterCombobox
                multiple
                options={cardTypeFilterOptions}
                value={draftFilter.cardTypes.map(String)}
                onChange={value => setDraftFilter(current => ({
                  ...current,
                  cardTypes: (value as string[]).map(Number)
                }))}
                placeholder={t('DECK_EDIT_ALL_TYPES', { defaultValue: 'All types' })}
                searchPlaceholder={t('BUTTON_SEARCH', { defaultValue: 'Search' })}
              />

              <Input
                value={draftFilter.searchValue}
                onChange={event => setDraftFilter(current => ({ ...current, searchValue: event.target.value }))}
                placeholder={t('BUTTON_SEARCH', { defaultValue: 'Search' })}
              />

              <Button type="submit">
                {t('BUTTON_SEARCH', { defaultValue: 'Search' })}
              </Button>
            </form>
          </CardHeader>

          <CardContent className="grid gap-4">
            {loading && <p className="text-sm text-muted-foreground">Loading deck...</p>}
            {catalogLoading && <p className="text-sm text-muted-foreground">Loading card catalog...</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="grid gap-3 md:grid-cols-2">
              <Input value={deckName} onChange={event => setDeckName(event.target.value)} placeholder={t('DECK_NAME', { defaultValue: 'Name' })} />
              <Input readOnly value={`${isValid ? 'Valid' : 'Invalid'} | ${formatNames.join(', ') || '-'}`} />
            </div>

            <div className="flex flex-wrap gap-2 xl:hidden">
              <Button variant={mobilePane === 'library' ? 'default' : 'outline'} size="sm" onClick={() => setMobilePane('library')}>
                Card Pool
              </Button>
              <Button variant={mobilePane === 'deck' ? 'default' : 'outline'} size="sm" onClick={() => setMobilePane('deck')}>
                Deck
              </Button>
              <Button variant={mobilePane === 'split' ? 'default' : 'outline'} size="sm" onClick={() => setMobilePane('split')}>
                Split
              </Button>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              {showLibraryPane && (
              <UiCard>
                <CardHeader>
                  <CardTitle>{t('DECK_EDIT_ALL_CARDS', { defaultValue: 'All cards' })}</CardTitle>
                </CardHeader>
                <CardContent
                  ref={node => {
                    libraryPaneDropRef(node);
                    libraryGrid.containerRef.current = node;
                  }}
                  className="max-h-[720px] overflow-auto"
                  style={{ outline: isLibraryPaneOver ? '2px solid hsl(var(--ring))' : undefined }}
                >
                  <div style={{ height: libraryGrid.topSpacerHeight }} />
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
                    {visibleLibraryCards.map(card => (
                      <LibraryCardTile
                        key={card.fullName}
                        card={card}
                        imageUrl={getCardScanUrl(card, auth.apiUrl, scansUrl)}
                        onAdd={candidate => { void addCardToDeck(candidate); }}
                        onShowInfo={showCardInfo}
                      />
                    ))}
                  </div>
                  <div style={{ height: libraryGrid.bottomSpacerHeight }} />
                </CardContent>
              </UiCard>
              )}

              {showDeckPane && (
              <UiCard>
                <CardHeader>
                  <CardTitle>{t('GAMES_YOUR_DECK', { defaultValue: 'Your deck' })}</CardTitle>
                </CardHeader>
                <CardContent
                  ref={node => {
                    deckPaneDropRef(node);
                    deckGrid.containerRef.current = node;
                  }}
                  className="max-h-[720px] overflow-auto"
                  style={{ outline: isDeckPaneOver ? '2px solid hsl(var(--ring))' : undefined }}
                >
                  <div style={{ height: deckGrid.topSpacerHeight }} />
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
                    {visibleDeckEntries.map((entry, index) => (
                      <DeckCardTile
                        key={entry.card.fullName}
                        entry={entry}
                        orderIndex={deckGrid.startIndex + index}
                        onMove={moveDeckEntry}
                        onDropLibraryCard={(card, targetIndex) => { void addCardToDeck(card, targetIndex); }}
                        onRemove={removeCardFromDeck}
                        onAdd={candidate => { void addCardToDeck(candidate); }}
                        onShowInfo={showCardInfo}
                      />
                    ))}
                  </div>
                  <div style={{ height: deckGrid.bottomSpacerHeight }} />
                </CardContent>
              </UiCard>
              )}
            </div>
          </CardContent>
        </UiCard>

        {totalCards > 0 && (
          <div className="app-panel p-3 text-sm text-muted-foreground">
            {t('DECK_EDIT_CARDS_COUNT', { defaultValue: 'Your deck contains {{count}} cards.', count: totalCards })}
          </div>
        )}

        <Dialog open={cardDialog.open} onOpenChange={open => setCardDialog(current => ({ ...current, open }))}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{cardDialog.card?.name || 'Card details'}</DialogTitle>
              <DialogDescription>{cardDialog.card?.fullName || ''}</DialogDescription>
            </DialogHeader>
            {cardDialog.card && (
              <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <img src={cardDialog.scanUrl} alt={cardDialog.card.fullName} className="w-full rounded-xl border border-border object-cover" />
                <div className="grid gap-3">
                  <div className="grid gap-3 rounded-xl border border-border p-4">
                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Rarity</p>
                        <p className="text-sm">{getRarityLabel(cardDialog.card) || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">No.</p>
                        <p className="text-sm">{getCollectionNumber(cardDialog.card) || '-'}</p>
                      </div>
                      {Boolean((cardDialog.card as Card & { evolvesFrom?: string }).evolvesFrom) && (
                        <div>
                          <p className="text-xs text-muted-foreground">Evolves from</p>
                          <p className="text-sm">{String((cardDialog.card as Card & { evolvesFrom?: string }).evolvesFrom)}</p>
                        </div>
                      )}
                      {Boolean((cardDialog.card as Card & { hp?: number }).hp) && (
                        <div>
                          <p className="text-xs text-muted-foreground">HP</p>
                          <p className="text-sm">{String((cardDialog.card as Card & { hp?: number }).hp)}</p>
                        </div>
                      )}
                      {cardDialog.card.superType === SuperType.POKEMON && (
                        <>
                          <div>
                            <p className="text-xs text-muted-foreground">Stage</p>
                            <p className="text-sm">{getStageLabel(cardDialog.card) || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Types</p>
                            <p className="text-sm">{getCardTypesLabel(cardDialog.card) || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Weakness</p>
                            <p className="text-sm">{formatStatList((cardDialog.card as Card & { weakness?: Array<{ type?: number; value?: string | number }> }).weakness)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Resistance</p>
                            <p className="text-sm">{formatStatList((cardDialog.card as Card & { resistance?: Array<{ type?: number; value?: string | number }> }).resistance)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Retreat</p>
                            <p className="text-sm">{String(((cardDialog.card as Card & { retreat?: unknown[] }).retreat || []).length || '-')}</p>
                          </div>
                        </>
                      )}
                      {cardDialog.card.superType === SuperType.TRAINER && (
                        <div>
                          <p className="text-xs text-muted-foreground">Trainer</p>
                          <p className="text-sm">{getTrainerTypeLabel(cardDialog.card)}</p>
                        </div>
                      )}
                    </div>

                    {Array.isArray((cardDialog.card as Card & { powers?: Array<{ name: string; text?: string; powerType?: string | number }> }).powers)
                      && (cardDialog.card as Card & { powers?: Array<{ name: string; text?: string; powerType?: string | number }> }).powers!.length > 0 && (
                      <div className="grid gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Abilities</p>
                        {(cardDialog.card as Card & { powers?: Array<{ name: string; text?: string; powerType?: string | number }> }).powers!.map(power => (
                          <div key={power.name} className="rounded-lg border border-border p-3">
                            <p className="text-sm font-medium">{power.name}</p>
                            <p className="text-xs text-muted-foreground">{String(power.powerType || '')}</p>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{power.text || '-'}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {Array.isArray((cardDialog.card as Card & { attacks?: Array<{ name: string; text?: string; damage?: string; cost?: unknown[] }> }).attacks)
                      && (cardDialog.card as Card & { attacks?: Array<{ name: string; text?: string; damage?: string; cost?: unknown[] }> }).attacks!.length > 0 && (
                      <div className="grid gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attacks</p>
                        {(cardDialog.card as Card & { attacks?: Array<{ name: string; text?: string; damage?: string; cost?: unknown[] }> }).attacks!.map(attack => (
                          <div key={attack.name} className="rounded-lg border border-border p-3">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{attack.name}</p>
                              {attack.damage && <span className="text-xs text-muted-foreground">{attack.damage}</span>}
                            </div>
                            <p className="text-xs text-muted-foreground">Cost: {String((attack.cost || []).length)}</p>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{attack.text || '-'}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {Boolean(cardDialog.card.text) && (
                      <div className="grid gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Text</p>
                        <div className="rounded-lg border border-border p-3">
                          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{cardDialog.card.text}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCardDialog({ open: false, card: null, scanUrl: '' })}>Close</Button>
              {cardDialog.card && (
                <Button onClick={() => void addCardToDeck(cardDialog.card)}>
                  Add to deck
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={variantDialog.open} onOpenChange={open => !open && setVariantDialog({ open: false, cards: [], selected: null })}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{variantDialog.selected?.name || 'Choose card face'}</DialogTitle>
              <DialogDescription>Pick the exact printing to add to this deck.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_320px]">
              <div className="grid max-h-[70vh] grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 overflow-auto">
                {variantDialog.cards.map(card => {
                  const imageUrl = getCardScanUrl(card, auth.apiUrl, scansUrl);
                  const selected = variantDialog.selected?.fullName === card.fullName;
                  return (
                    <button
                      key={card.fullName}
                      type="button"
                      className={`rounded-xl border p-3 text-left ${selected ? 'border-primary ring-2 ring-ring' : 'border-border'}`}
                      onClick={() => setVariantDialog(current => ({ ...current, selected: card }))}
                    >
                      <img src={imageUrl} alt={card.fullName} className="h-[214px] w-[160px] rounded-lg object-cover" />
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">{getRarityLabel(card) || '-'}</p>
                        <p className="text-sm font-medium">{getCollectionNumber(card) || card.fullName}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {variantDialog.selected && (
                <div className="grid gap-3">
                  <img
                    src={getCardScanUrl(variantDialog.selected, auth.apiUrl, scansUrl)}
                    alt={variantDialog.selected.fullName}
                    className="w-full rounded-xl border border-border object-cover"
                  />
                  <div className="rounded-xl border border-border p-4">
                    <p className="font-semibold">{variantDialog.selected.name}</p>
                    <p className="text-sm text-muted-foreground">{variantDialog.selected.fullName}</p>
                    <p className="mt-2 text-sm">Rarity: {getRarityLabel(variantDialog.selected) || '-'}</p>
                    <p className="text-sm">No.: {getCollectionNumber(variantDialog.selected) || '-'}</p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVariantDialog({ open: false, cards: [], selected: null })}>Close</Button>
              <Button onClick={() => void confirmVariantSelection()} disabled={!variantDialog.selected}>Add to deck</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}

export function DeckEditPage(): JSX.Element {
  const auth = useAuth();
  const params = useParams();
  const deckId = Number(params.deckId || 0);
  const scansUrl = auth.config?.scansUrl || '';

  return (
    <TableDndProvider>
      <DeckEditPageContent deckId={deckId} scansUrl={scansUrl} />
    </TableDndProvider>
  );
}
