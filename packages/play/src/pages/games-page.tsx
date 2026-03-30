import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/lib/auth-context';
import type { CoreInfo } from '@/lib/api-types';
import { apiClient } from '@/lib/api-client';
import { getRecentGameIds, rememberRecentGame } from '@/lib/recent-games';
import { SocketClient } from '@/lib/socket-client';

type DeckListEntry = {
  id: number;
  name: string;
  formatNames: string[];
  isValid: boolean;
};

type DeckListResponse = {
  decks: DeckListEntry[];
};

type DeckResponse = {
  deck: {
    id: number;
    cards: string[];
  };
};

type GameState = {
  gameId: number;
};

type MatchInfo = {
  matchId: number;
  player1Id: number;
  player2Id: number;
  winner: number;
  created: number;
  formatName: string;
};

type MatchHistoryResponse = {
  matches: MatchInfo[];
  users: Array<{ userId: number; name: string }>;
};

export function GamesPage(): JSX.Element {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coreInfo, setCoreInfo] = useState<CoreInfo | null>(null);
  const [decks, setDecks] = useState<DeckListEntry[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [timeLimit, setTimeLimit] = useState(1800);
  const [recordingEnabled, setRecordingEnabled] = useState(true);
  const [firstTurnDrawCard, setFirstTurnDrawCard] = useState(true);
  const [firstTurnUseSupporter, setFirstTurnUseSupporter] = useState(true);
  const [noPrizeForFossil, setNoPrizeForFossil] = useState(true);
  const [creatingGame, setCreatingGame] = useState(false);
  const [recentMatches, setRecentMatches] = useState<MatchInfo[]>([]);
  const [recentUsersById, setRecentUsersById] = useState<Record<number, string>>({});

  const fetchCoreInfo = useCallback(async () => {
    if (!auth.token) {
      return;
    }
    setLoading(true);
    setError('');

    const socketClient = new SocketClient();
    try {
      socketClient.connect(auth.apiUrl, auth.token);
      const info = await socketClient.emit<void, CoreInfo>('core:getInfo');
      setCoreInfo(info);
    } catch (e) {
      setError((e as Error).message || 'Unable to load lobby.');
    } finally {
      socketClient.disconnect();
      setLoading(false);
    }
  }, [auth.apiUrl, auth.token]);

  useEffect(() => {
    void fetchCoreInfo();
  }, [fetchCoreInfo]);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await apiClient.get<DeckListResponse>('/v1/decks/list');
        const validDecks = response.decks.filter(deck => deck.isValid);
        setDecks(validDecks);
        if (validDecks.length > 0) {
          setSelectedDeckId(validDecks[0].id);
          setSelectedFormat(validDecks[0].formatNames[0] || '');
        }
      } catch {
        // Keep lobby usable even if deck list fails.
      }
    };

    const fetchRecentMatches = async () => {
      try {
        const response = await apiClient.get<MatchHistoryResponse>('/v1/profile/matchHistory/0/0/10');
        setRecentMatches(response.matches);
        setRecentUsersById(Object.fromEntries(response.users.map(user => [user.userId, user.name])));
      } catch {
        // Matches panel is secondary for lobby use.
      }
    };

    void fetchDecks();
    void fetchRecentMatches();
  }, []);

  const onlineClients = useMemo(() => {
    if (!coreInfo) {
      return [];
    }

    return coreInfo.clients
      .map(client => ({
        clientId: client.clientId,
        user: coreInfo.users.find(user => user.userId === client.userId)
      }))
      .filter(entry => Boolean(entry.user))
      .sort((left, right) => (right.user?.ranking || 0) - (left.user?.ranking || 0));
  }, [coreInfo]);

  const onlineUsers = useMemo(() => onlineClients.map(entry => entry.user!).filter(Boolean), [onlineClients]);

  const formatOptions = useMemo(() => {
    const allFormats = new Set<string>();
    decks.forEach(deck => deck.formatNames.forEach(format => allFormats.add(format)));
    return Array.from(allFormats.values());
  }, [decks]);

  const filteredDecks = useMemo(() => {
    if (!selectedFormat) {
      return decks;
    }
    return decks.filter(deck => deck.formatNames.includes(selectedFormat));
  }, [decks, selectedFormat]);

  useEffect(() => {
    if (!selectedDeckId && filteredDecks.length > 0) {
      setSelectedDeckId(filteredDecks[0].id);
      return;
    }
    if (selectedDeckId && !filteredDecks.some(deck => deck.id === selectedDeckId)) {
      setSelectedDeckId(filteredDecks[0]?.id ?? null);
    }
  }, [filteredDecks, selectedDeckId]);

  const continueGames = useMemo(() => {
    const recentIds = new Set(getRecentGameIds());
    return (coreInfo?.games || []).filter(game => recentIds.has(game.gameId));
  }, [coreInfo]);

  const createGame = async (event: FormEvent, invitedClientId?: number) => {
    event.preventDefault();
    if (!selectedDeckId || !auth.token) {
      return;
    }

    setCreatingGame(true);
    setError('');

    const socketClient = new SocketClient();
    try {
      const deckResult = await apiClient.get<DeckResponse>(`/v1/decks/get/${selectedDeckId}`);
      socketClient.connect(auth.apiUrl, auth.token);
      const created = await socketClient.emit<{ deck: string[]; gameSettings: unknown; clientId?: number }, GameState>(
        'core:createGame',
        {
          deck: deckResult.deck.cards,
          clientId: invitedClientId,
          gameSettings: {
            timeLimit,
            recordingEnabled,
            rules: {
              formatName: selectedFormat,
              firstTurnDrawCard,
              firstTurnUseSupporter,
              firstTurnUseAttack: true,
              noPrizeForFossil
            }
          }
        }
      );
      rememberRecentGame(created.gameId);
      navigate(`/table/${created.gameId}`);
    } catch (e) {
      setError((e as Error).message || 'Unable to create game.');
    } finally {
      socketClient.disconnect();
      setCreatingGame(false);
    }
  };

  return (
    <div className="grid gap-4">
      <section className="app-panel">
        <div className="app-toolbar">
          <h1>{t('GAMES_TITLE', { defaultValue: 'Games' })}</h1>
          <span className="app-toolbar-spacer" />
          <Button asChild variant="outline">
            <Link to="/deck">{t('MAIN_DECKS', { defaultValue: 'Decks' })}</Link>
          </Button>
          <Button onClick={() => void fetchCoreInfo()} variant="outline">
            {t('BUTTON_REFRESH', { defaultValue: 'Refresh' })}
          </Button>
        </div>
        <div className="ptcg-u-padding grid gap-3 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Live Tables</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{coreInfo?.games.length || 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Pilots Online</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{onlineUsers.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Quick Flow</CardTitle></CardHeader>
            <CardContent><p className="text-sm">3 steps</p></CardContent>
          </Card>
        </div>
      </section>

      {continueGames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {continueGames.map(game => (
              <Link key={game.gameId} to={`/table/${game.gameId}`} className="app-panel p-3">
                <p className="text-xs text-muted-foreground">{game.formatName || t('GAMES_FORMAT_UNLIMITED', { defaultValue: 'Unlimited' })}</p>
                <p className="font-semibold">#{game.gameId}</p>
                <p className="text-sm text-muted-foreground">{t('GAMES_TURN', { defaultValue: 'Turn' })} {game.turn}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>{t('GAMES_CREATE_GAME_TITLE', { defaultValue: 'Create game' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="app-form" onSubmit={event => void createGame(event)}>
            <div className="app-form-field">
              <Label htmlFor="create-format">{t('LABEL_FORMAT', { defaultValue: 'Format' })}</Label>
              <select
                id="create-format"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={selectedFormat}
                onChange={e => setSelectedFormat(e.target.value)}
              >
                <option value="">{t('GAMES_ALL_CARDS_ALLOWED', { defaultValue: 'All cards allowed' })}</option>
                {formatOptions.map(format => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            </div>

            <div className="app-form-field">
              <Label htmlFor="create-deck">{t('GAMES_YOUR_DECK', { defaultValue: 'Deck' })}</Label>
              <select
                id="create-deck"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={selectedDeckId ?? ''}
                onChange={e => setSelectedDeckId(Number(e.target.value))}
              >
                {filteredDecks.map(deck => (
                  <option key={deck.id} value={deck.id}>{deck.name}</option>
                ))}
              </select>
            </div>

            <div className="app-form-field">
              <Label htmlFor="create-time-limit">{t('GAMES_TIME_LIMIT', { defaultValue: 'Time limit' })}</Label>
              <select
                id="create-time-limit"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={timeLimit}
                onChange={e => setTimeLimit(Number(e.target.value))}
              >
                <option value={0}>{t('GAMES_LIMIT_NO_LIMIT', { defaultValue: 'No limit' })}</option>
                <option value={600}>{t('GAMES_LIMIT_10_MIN', { defaultValue: '10 min' })}</option>
                <option value={1200}>{t('GAMES_LIMIT_20_MIN', { defaultValue: '20 min' })}</option>
                <option value={1800}>{t('GAMES_LIMIT_30_MIN', { defaultValue: '30 min' })}</option>
              </select>
            </div>

            <label className="text-sm">
              <input checked={recordingEnabled} onChange={e => setRecordingEnabled(e.target.checked)} type="checkbox" />
              {' '}
              {t('GAMES_RECORD_GAME', { defaultValue: 'Record game' })}
            </label>
            <label className="text-sm">
              <input checked={firstTurnDrawCard} onChange={e => setFirstTurnDrawCard(e.target.checked)} type="checkbox" />
              {' '}
              {t('GAMES_DRAW_CARD_FIRST_TURN', { defaultValue: 'Draw card on first turn' })}
            </label>
            <label className="text-sm">
              <input checked={firstTurnUseSupporter} onChange={e => setFirstTurnUseSupporter(e.target.checked)} type="checkbox" />
              {' '}
              {t('GAMES_PLAY_SUPPORTER_FIRST_TURN', { defaultValue: 'Supporter on first turn' })}
            </label>
            <label className="text-sm">
              <input checked={noPrizeForFossil} onChange={e => setNoPrizeForFossil(e.target.checked)} type="checkbox" />
              {' '}
              {t('GAMES_NO_PRIZE_FOR_FOSSIL', { defaultValue: 'No prize for fossil' })}
            </label>

            <div className="app-inline-actions">
              <Button disabled={!selectedDeckId || creatingGame} type="submit">
                {creatingGame ? 'Creating...' : t('GAMES_CREATE_GAME_BUTTON', { defaultValue: 'Create game' })}
              </Button>
              <Input disabled value={selectedDeckId ? `Deck #${selectedDeckId}` : 'No valid deck'} readOnly />
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('GAMES_ACTIVE_GAMES_TITLE', { defaultValue: 'Active games' })}</CardTitle>
            </CardHeader>
            <CardContent className="app-table-wrap">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{t('LABEL_FORMAT', { defaultValue: 'Format' })}</TableHead>
                    <TableHead>{t('GAMES_TURN', { defaultValue: 'Turn' })}</TableHead>
                    <TableHead>{t('LABEL_PLAYER_1', { defaultValue: 'Player 1' })}</TableHead>
                    <TableHead>{t('LABEL_PLAYER_2', { defaultValue: 'Player 2' })}</TableHead>
                    <TableHead>{t('LABEL_ACTIONS', { defaultValue: 'Actions' })}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(coreInfo?.games || []).map(game => (
                    <TableRow key={game.gameId}>
                      <TableCell>{game.gameId}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{game.formatName || t('GAMES_FORMAT_UNLIMITED', { defaultValue: 'Unlimited' })}</Badge>
                      </TableCell>
                      <TableCell>{game.turn}</TableCell>
                      <TableCell>{game.players[0]?.name || '-'}</TableCell>
                      <TableCell>{game.players[1]?.name || '-'}</TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/table/${game.gameId}`}>{t('BUTTON_SHOW', { defaultValue: 'Show' })}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('GAMES_RECENT_GAMES_TITLE', { defaultValue: 'Recent matches' })}</CardTitle>
            </CardHeader>
            <CardContent className="app-table-wrap">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{t('LABEL_PLAYER_1', { defaultValue: 'Player 1' })}</TableHead>
                    <TableHead>{t('LABEL_PLAYER_2', { defaultValue: 'Player 2' })}</TableHead>
                    <TableHead>{t('LABEL_WINNER', { defaultValue: 'Winner' })}</TableHead>
                    <TableHead>{t('LABEL_FORMAT', { defaultValue: 'Format' })}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMatches.map(match => {
                    const winnerId = match.winner === 1 ? match.player1Id : match.player2Id;
                    return (
                      <TableRow key={match.matchId}>
                        <TableCell>{match.matchId}</TableCell>
                        <TableCell>{recentUsersById[match.player1Id] || `#${match.player1Id}`}</TableCell>
                        <TableCell>{recentUsersById[match.player2Id] || `#${match.player2Id}`}</TableCell>
                        <TableCell>{recentUsersById[winnerId] || '-'}</TableCell>
                        <TableCell>{match.formatName || t('GAMES_FORMAT_UNLIMITED', { defaultValue: 'Unlimited' })}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Online Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {onlineClients.map(entry => {
                const user = entry.user!;
                return (
                  <div key={entry.clientId} className="app-panel flex items-center justify-between p-3">
                    <div>
                      <strong>{user.name}</strong>
                      <p className="text-xs text-muted-foreground">Ranking: {user.ranking}</p>
                    </div>
                    <div className="app-inline-actions">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/profile/${user.userId}`}>{t('BUTTON_SHOW_PROFILE', { defaultValue: 'Profile' })}</Link>
                      </Button>
                      {auth.user?.userId !== user.userId && (
                        <>
                          <Button size="sm" onClick={event => void createGame(event, entry.clientId)} disabled={!selectedDeckId || creatingGame}>
                            {t('BUTTON_INVITE', { defaultValue: 'Invite' })}
                          </Button>
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/message/${user.userId}`}>{t('BUTTON_SEND_MESSAGE', { defaultValue: 'Message' })}</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
