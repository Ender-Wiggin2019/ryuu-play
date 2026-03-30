import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { showToast } from '@/lib/toast';

type DeckListEntry = {
  id: number;
  name: string;
  formatNames: string[];
  isValid: boolean;
};

type DeckListResponse = {
  decks: DeckListEntry[];
};

type TestingCreateResponse = {
  gameId: number;
  formatName: string;
  botUserId: number;
};

type ScenarioCreateResponse = {
  scenarioId: number;
  player1Id: number;
  player2Id: number;
  state: unknown;
};

export function TestingPage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [creatingScenario, setCreatingScenario] = useState(false);
  const [error, setError] = useState('');
  const [decks, setDecks] = useState<DeckListEntry[]>([]);
  const [format, setFormat] = useState('');
  const [playerDeckId, setPlayerDeckId] = useState<number | null>(null);
  const [botDeckId, setBotDeckId] = useState<number | null>(null);
  const [lastGameId, setLastGameId] = useState<number | null>(null);
  const [lastScenarioId, setLastScenarioId] = useState<number | null>(null);

  useEffect(() => {
    const loadDecks = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get<DeckListResponse>('/v1/decks/list');
        const validDecks = response.decks.filter(deck => deck.isValid);
        setDecks(validDecks);
        const firstFormat = validDecks[0]?.formatNames[0] || '';
        setFormat(firstFormat);
      } catch (e) {
        setError((e as Error).message || 'Unable to load deck list.');
      } finally {
        setLoading(false);
      }
    };

    void loadDecks();
  }, []);

  const formatOptions = useMemo(() => {
    const values = new Set<string>();
    decks.forEach(deck => deck.formatNames.forEach(name => values.add(name)));
    return [''].concat(Array.from(values.values()));
  }, [decks]);

  const filteredDecks = useMemo(() => {
    if (!format) {
      return decks;
    }
    return decks.filter(deck => deck.formatNames.includes(format));
  }, [decks, format]);

  useEffect(() => {
    if (filteredDecks.length === 0) {
      setPlayerDeckId(null);
      setBotDeckId(null);
      return;
    }

    if (playerDeckId === null || !filteredDecks.some(deck => deck.id === playerDeckId)) {
      setPlayerDeckId(filteredDecks[0].id);
    }

    if (botDeckId === null || !filteredDecks.some(deck => deck.id === botDeckId) || botDeckId === playerDeckId) {
      const candidate = filteredDecks.find(deck => deck.id !== playerDeckId) || filteredDecks[0];
      setBotDeckId(candidate.id);
    }
  }, [botDeckId, filteredDecks, playerDeckId]);

  const createTestGame = async (event: FormEvent) => {
    event.preventDefault();
    if (!playerDeckId || !botDeckId) {
      return;
    }

    setCreating(true);
    setError('');
    try {
      const response = await apiClient.post<TestingCreateResponse>('/v1/testing/create', {
        playerDeckId,
        botDeckId,
        formatName: format
      });
      setLastGameId(response.gameId);
      navigate(`/table/${response.gameId}`);
    } catch (e) {
      setError((e as Error).message || 'Unable to create test game.');
    } finally {
      setCreating(false);
    }
  };

  const createScenario = async () => {
    setCreatingScenario(true);
    setError('');
    try {
      const response = await apiClient.post<ScenarioCreateResponse>('/v1/testing/scenario/create', {
        formatName: format
      });
      setLastScenarioId(response.scenarioId);
      showToast('success', `Scenario #${response.scenarioId} ready`);
      navigate(`/scenario?scenarioId=${response.scenarioId}`);
    } catch (e) {
      setError((e as Error).message || 'Unable to create scenario.');
    } finally {
      setCreatingScenario(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader>
          <CardTitle>{t('TESTING_TITLE', { defaultValue: 'Testing Lab' })}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {loading && <p className="text-sm text-muted-foreground">Loading deck data...</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <form className="app-form" onSubmit={event => void createTestGame(event)}>
            <div className="app-form-field">
              <Label htmlFor="testing-format">{t('LABEL_FORMAT', { defaultValue: 'Format' })}</Label>
              <select
                id="testing-format"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={format}
                onChange={event => setFormat(event.target.value)}
              >
                {formatOptions.map(value => (
                  <option key={value || 'all'} value={value}>
                    {value || t('GAMES_ALL_CARDS_ALLOWED', { defaultValue: 'All cards allowed' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="app-form-field">
              <Label htmlFor="testing-player-deck">{t('TESTING_PLAYER_DECK', { defaultValue: 'Player deck' })}</Label>
              <select
                id="testing-player-deck"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={playerDeckId ?? ''}
                onChange={event => setPlayerDeckId(Number(event.target.value))}
              >
                {filteredDecks.map(deck => (
                  <option key={deck.id} value={deck.id}>{deck.name}</option>
                ))}
              </select>
            </div>

            <div className="app-form-field">
              <Label htmlFor="testing-bot-deck">{t('TESTING_BOT_DECK', { defaultValue: 'Bot deck' })}</Label>
              <select
                id="testing-bot-deck"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={botDeckId ?? ''}
                onChange={event => setBotDeckId(Number(event.target.value))}
              >
                {filteredDecks.map(deck => (
                  <option key={deck.id} value={deck.id}>{deck.name}</option>
                ))}
              </select>
            </div>

            <div className="app-inline-actions">
              <Button disabled={creating || !playerDeckId || !botDeckId || loading} type="submit">
                {creating ? t('TESTING_CREATING', { defaultValue: 'Creating...' }) : t('TESTING_CREATE_GAME', { defaultValue: 'Create test game' })}
              </Button>
              <Button
                disabled={creatingScenario || loading}
                type="button"
                variant="outline"
                onClick={() => void createScenario()}
              >
                {creatingScenario ? 'Creating Scenario...' : 'Create Scenario Sandbox'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debug Links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="app-panel p-3">
            <p className="font-semibold">Current Format</p>
            <p className="text-sm text-muted-foreground">{format || 'All cards allowed'}</p>
          </div>

          <div className="grid gap-2">
            <Button asChild variant="outline">
              <Link to="/scenario">Open Scenario Lab</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/replays">Open Replays</Link>
            </Button>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-semibold">Last Created</p>
            <p className="text-xs text-muted-foreground">Game: {lastGameId ?? '-'}</p>
            {lastGameId && (
              <Button asChild size="sm" variant="outline">
                <Link to={`/table/${lastGameId}`}>Resume Table</Link>
              </Button>
            )}
            <p className="text-xs text-muted-foreground">Scenario: {lastScenarioId ?? '-'}</p>
            {lastScenarioId && (
              <Button asChild size="sm" variant="outline">
                <Link to={`/scenario?scenarioId=${lastScenarioId}`}>Resume Scenario</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
