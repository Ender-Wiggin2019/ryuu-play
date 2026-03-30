import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFeedback } from '@/components/feedback-provider';
import { apiClient } from '@/lib/api-client';
import { showToast } from '@/lib/toast';

type DeckListEntry = {
  id: number;
  name: string;
  formatNames: string[];
  cardType: number[];
  isValid: boolean;
};

type DeckListResponse = {
  decks: DeckListEntry[];
};

export function DeckPage(): JSX.Element {
  const { t } = useTranslation();
  const feedback = useFeedback();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [decks, setDecks] = useState<DeckListEntry[]>([]);

  const refreshList = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get<DeckListResponse>('/v1/decks/list');
      setDecks(response.decks);
    } catch (e) {
      setError((e as Error).message || 'Unable to load deck list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  const askDeckName = (title: string, value = '') => feedback.prompt(title, { title, defaultValue: value });

  const createDeck = async () => {
    const name = await askDeckName(t('DECK_ENTER_NAME_TITLE', { defaultValue: 'Enter deck name' }));
    if (!name) {
      return;
    }
    await apiClient.post('/v1/decks/save', { name, cards: [] });
    showToast('success', 'Deck created');
    await refreshList();
  };

  const renameDeck = async (deck: DeckListEntry) => {
    const name = await askDeckName(t('BUTTON_RENAME', { defaultValue: 'Rename deck' }), deck.name);
    if (!name) {
      return;
    }
    await apiClient.post('/v1/decks/rename', { id: deck.id, name });
    showToast('success', 'Deck renamed');
    await refreshList();
  };

  const duplicateDeck = async (deck: DeckListEntry) => {
    const name = await askDeckName(t('DECK_DUPLICATE', { defaultValue: 'Duplicate deck' }), `${deck.name} Copy`);
    if (!name) {
      return;
    }
    await apiClient.post('/v1/decks/duplicate', { id: deck.id, name });
    showToast('success', 'Deck duplicated');
    await refreshList();
  };

  const deleteDeck = async (deck: DeckListEntry) => {
    const confirmed = await feedback.confirm(t('DECK_DELETE_SELECTED', { defaultValue: 'Delete selected deck?' }), {
      title: t('BUTTON_DELETE', { defaultValue: 'Delete' })
    });
    if (!confirmed) {
      return;
    }
    await apiClient.post('/v1/decks/delete', { id: deck.id });
    showToast('success', 'Deck deleted');
    await refreshList();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('DECK_TITLE', { defaultValue: 'Decks' })}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="app-toolbar">
          <h1>{t('DECK_TITLE', { defaultValue: 'Decks' })}</h1>
          <span className="app-toolbar-spacer" />
          <Button onClick={() => void createDeck()}>
            {t('DECK_CREATE', { defaultValue: 'Create deck' })}
          </Button>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading decks...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="app-table-wrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('DECK_NAME', { defaultValue: 'Name' })}</TableHead>
                <TableHead>{t('DECK_TYPE', { defaultValue: 'Type' })}</TableHead>
                <TableHead>{t('LABEL_FORMAT', { defaultValue: 'Format' })}</TableHead>
                <TableHead>{t('DECK_VALID', { defaultValue: 'Valid' })}</TableHead>
                <TableHead>{t('LABEL_ACTIONS', { defaultValue: 'Actions' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {decks.map(deck => (
                <TableRow key={deck.id}>
                  <TableCell>{deck.name}</TableCell>
                  <TableCell>{Array.isArray(deck.cardType) && deck.cardType.length > 0 ? deck.cardType.join(', ') : '-'}</TableCell>
                  <TableCell>
                    <div className="app-inline-actions">
                      {(Array.isArray(deck.formatNames) ? deck.formatNames : []).map(name => (
                        <Badge key={name} variant="secondary">{name}</Badge>
                      ))}
                      {(!Array.isArray(deck.formatNames) || deck.formatNames.length === 0) && <span>-</span>}
                    </div>
                  </TableCell>
                  <TableCell>{deck.isValid ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <div className="app-inline-actions">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/deck/${deck.id}`}>{t('BUTTON_EDIT', { defaultValue: 'Edit' })}</Link>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void renameDeck(deck)}>
                        {t('BUTTON_RENAME', { defaultValue: 'Rename' })}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void duplicateDeck(deck)}>
                        {t('DECK_DUPLICATE', { defaultValue: 'Duplicate' })}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => void deleteDeck(deck)}>
                        {t('BUTTON_DELETE', { defaultValue: 'Delete' })}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
