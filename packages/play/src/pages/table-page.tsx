import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { BoardDndPanel } from '@/components/table/board-dnd-panel';
import { HandDndPanel } from '@/components/table/hand-dnd-panel';
import { TableSidebar } from '@/components/table/table-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PromptHost } from '@/components/table/prompt-host';
import { TableDndProvider } from '@/components/table/table-dnd-provider';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { decodeStateData } from '@/lib/ptcg-runtime';
import { forgetRecentGame, rememberRecentGame } from '@/lib/recent-games';
import { SocketClient } from '@/lib/socket-client';
import { showToast } from '@/lib/toast';

import { Replay } from '../../../common/src/game/replay';
import { Base64 } from '../../../common/src/utils/base64';
import type { State } from '../../../common/src/store/state/state';
import type { CardTarget } from '@/components/table/table-dnd-types';
import type { StateLog } from '../../../common/src/store/state/state-log';
import type { PlayerStats } from '../../../common/src/game/player-stats';

type GameStateResponse = {
  gameId: number;
  stateData: string;
  clientIds: number[];
  recordingEnabled: boolean;
  timeLimit: number;
  playerStats: unknown[];
};

type GameStateChangeEvent = {
  stateData: string;
  playerStats: unknown[];
};

type CoreInfoResponse = {
  clientId: number;
};

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
    cards: string[];
  };
};

export function TablePage(): JSX.Element {
  const auth = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const gameId = Number(params.gameId || 0);
  const isReplayMode = searchParams.get('mode') === 'replay';
  const socketRef = useRef<SocketClient | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [state, setState] = useState<State | null>(null);
  const [clientId, setClientId] = useState<number>(0);
  const [resolvingPrompt, setResolvingPrompt] = useState(false);
  const [logs, setLogs] = useState<StateLog[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [replay, setReplay] = useState<Replay | undefined>();
  const [replayPosition, setReplayPosition] = useState(1);
  const [timeLimit, setTimeLimit] = useState(0);
  const [switchSides, setSwitchSides] = useState(false);
  const [joinDecks, setJoinDecks] = useState<DeckListEntry[]>([]);
  const [joinDeckId, setJoinDeckId] = useState<number | null>(null);
  const [joiningGame, setJoiningGame] = useState(false);

  useEffect(() => {
    if (!auth.token || !gameId || !isReplayMode) {
      return;
    }

    const encodedReplay = sessionStorage.getItem(`replay:${gameId}`);
    if (!encodedReplay) {
      setError('Replay data is missing from session storage.');
      setLoading(false);
      return;
    }

    let alive = true;

    const initializeReplay = async () => {
      setLoading(true);
      setError('');
      try {
        const replayInstance = new Replay();
        replayInstance.deserialize(new Base64().decode(encodedReplay));
        const initialState = replayInstance.getState(0);
        if (!alive) {
          return;
        }
        setReplay(replayInstance);
        setReplayPosition(1);
        setState(initialState);
        setLogs(initialState.logs || []);
        setPlayerStats([]);
        setTimeLimit(0);
        setClientId(initialState.players[0]?.id || 0);
      } catch (e) {
        if (!alive) {
          return;
        }
        setError((e as Error).message || 'Unable to load replay.');
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    void initializeReplay();

    return () => {
      alive = false;
    };
  }, [auth.token, gameId, isReplayMode]);

  useEffect(() => {
    if (!auth.token || !gameId || isReplayMode) {
      return;
    }

    if (!auth.token || !gameId) {
      return;
    }

    const socketClient = new SocketClient();
    socketRef.current = socketClient;
    let alive = true;

    const initialize = async () => {
      setLoading(true);
      setError('');
      try {
        socketClient.connect(auth.apiUrl, auth.token);
        const coreInfo = await socketClient.emit<void, CoreInfoResponse>('core:getInfo');
        const joined = await socketClient.emit<number, GameStateResponse>('game:join', gameId);
        const decodedState = await decodeStateData(joined.stateData);

        if (!alive) {
          return;
        }

        setClientId(coreInfo.clientId);
        setState(decodedState);
        setLogs(decodedState.logs || []);
        setPlayerStats(joined.playerStats || []);
        setTimeLimit(joined.timeLimit || 0);
        rememberRecentGame(gameId);

        socketClient.on<GameStateChangeEvent>(`game[${gameId}]:stateChange`, event => {
          void (async () => {
            const nextState = await decodeStateData(event.stateData);
            if (!alive) {
              return;
            }
            setState(nextState);
            setLogs(previousLogs => {
              const nextLogs = [...previousLogs];
              nextState.logs.forEach(log => {
                if (!nextLogs.some(entry => entry.id === log.id)) {
                  nextLogs.push(log);
                }
              });
              nextLogs.sort((a, b) => a.id - b.id);
              return nextLogs.slice(-200);
            });
            setPlayerStats(event.playerStats || []);
          })();
        });
      } catch (e) {
        if (!alive) {
          return;
        }
        setError((e as Error).message || 'Unable to join table.');
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      alive = false;
      socketClient.off(`game[${gameId}]:stateChange`);
      void socketClient.emit<number, unknown>('game:leave', gameId).catch(() => undefined);
      socketClient.disconnect();
      socketRef.current = null;
    };
  }, [auth.apiUrl, auth.token, gameId, isReplayMode]);

  useEffect(() => {
    if (isReplayMode || !auth.token || !state) {
      return;
    }

    const waitingForPlayers = state.players.length < 2;
    const isPlaying = state.players.some(player => player.id === clientId);
    if (!waitingForPlayers || isPlaying) {
      return;
    }

    let alive = true;
    const loadDecks = async () => {
      try {
        const response = await apiClient.get<DeckListResponse>('/v1/decks/list');
        if (!alive) {
          return;
        }
        const formatName = state.rules.formatName || '';
        const validDecks = response.decks
          .filter(deck => deck.isValid)
          .filter(deck => !formatName || deck.formatNames.includes(formatName));
        setJoinDecks(validDecks);
        setJoinDeckId(current => current ?? validDecks[0]?.id ?? null);
      } catch (e) {
        if (!alive) {
          return;
        }
        setError((e as Error).message || 'Unable to load available decks.');
      }
    };

    void loadDecks();

    return () => {
      alive = false;
    };
  }, [auth.token, clientId, isReplayMode, state]);

  const currentPrompt = useMemo(() => {
    if (!state || !clientId || isReplayMode) {
      return undefined;
    }
    return state.prompts.find(prompt => prompt.playerId === clientId && prompt.result === undefined);
  }, [clientId, isReplayMode, state]);

  const { bottomPlayer, topPlayer } = useMemo(() => {
    if (!state) {
      return { bottomPlayer: undefined, topPlayer: undefined };
    }
    const firstPlayer = state.players[0];
    const secondPlayer = state.players[1];
    if (!firstPlayer) {
      return { bottomPlayer: undefined, topPlayer: undefined };
    }
    if (!secondPlayer) {
      if (firstPlayer.id === clientId) {
        return { bottomPlayer: firstPlayer, topPlayer: undefined };
      }
      return { bottomPlayer: undefined, topPlayer: firstPlayer };
    }
    if (firstPlayer.id === clientId) {
      return { bottomPlayer: firstPlayer, topPlayer: secondPlayer };
    }
    if (secondPlayer.id === clientId) {
      return { bottomPlayer: secondPlayer, topPlayer: firstPlayer };
    }
    return { bottomPlayer: secondPlayer, topPlayer: firstPlayer };
  }, [clientId, state]);

  const orientedPlayers = useMemo(() => {
    if (!switchSides) {
      return { bottomPlayer, topPlayer };
    }
    return { bottomPlayer: topPlayer, topPlayer: bottomPlayer };
  }, [bottomPlayer, switchSides, topPlayer]);

  const resolvePrompt = async (result: unknown) => {
    if (!currentPrompt || !socketRef.current) {
      return;
    }
    setResolvingPrompt(true);
    try {
      await socketRef.current.emit('game:action:resolvePrompt', {
        gameId,
        id: currentPrompt.id,
        result
      });
    } catch (e) {
      setError((e as Error).message || 'Unable to resolve prompt.');
    } finally {
      setResolvingPrompt(false);
    }
  };

  const activePlayer = state?.players?.[state.activePlayer];
  const interactionDisabled = resolvingPrompt || Boolean(currentPrompt) || isReplayMode;
  const waitingForPlayers = (state?.players.length || 0) < 2;
  const isPlaying = Boolean(state?.players.some(player => player.id === clientId));
  const isObserver = isReplayMode || (!isPlaying && !waitingForPlayers);
  const isYourTurn = Boolean(activePlayer && activePlayer.id === clientId && !isReplayMode);

  const reorderHand = async (order: number[]) => {
    if (!socketRef.current) {
      return;
    }
    try {
      await socketRef.current.emit('game:action:reorderHand', { gameId, order });
    } catch (e) {
      setError((e as Error).message || 'Unable to reorder hand.');
    }
  };

  const playCardFromHand = async (handIndex: number, target: CardTarget) => {
    if (!socketRef.current) {
      return;
    }
    try {
      await socketRef.current.emit('game:action:playCard', { gameId, handIndex, target });
    } catch (e) {
      setError((e as Error).message || 'Unable to play card.');
    }
  };

  const reorderBench = async (from: number, to: number) => {
    if (!socketRef.current) {
      return;
    }
    try {
      await socketRef.current.emit('game:action:reorderBench', { gameId, from, to });
    } catch (e) {
      setError((e as Error).message || 'Unable to reorder bench.');
    }
  };

  const retreat = async (to: number) => {
    if (!socketRef.current) {
      return;
    }
    try {
      await socketRef.current.emit('game:action:retreat', { gameId, to });
    } catch (e) {
      setError((e as Error).message || 'Unable to retreat.');
    }
  };

  const passTurn = async () => {
    if (!socketRef.current) {
      return;
    }
    try {
      await socketRef.current.emit('game:action:passTurn', { gameId });
    } catch (e) {
      setError((e as Error).message || 'Unable to pass turn.');
    }
  };

  const leaveTable = async () => {
    if (isReplayMode) {
      navigate('/replays');
      return;
    }
    if (!socketRef.current) {
      navigate('/games');
      return;
    }
    try {
      await socketRef.current.emit<number, unknown>('game:leave', gameId);
    } catch {
      // Ignore leave failures and still navigate away.
    } finally {
      forgetRecentGame(gameId);
      socketRef.current.disconnect();
      socketRef.current = null;
      navigate('/games');
    }
  };

  const appendLog = async (message: string) => {
    if (!socketRef.current) {
      return;
    }
    try {
      await socketRef.current.emit('game:action:appendLog', { gameId, message });
    } catch (e) {
      setError((e as Error).message || 'Unable to append log.');
    }
  };

  const joinGame = async () => {
    if (!socketRef.current || !joinDeckId) {
      return;
    }
    setJoiningGame(true);
    setError('');
    try {
      const deckResponse = await apiClient.get<DeckResponse>(`/v1/decks/get/${joinDeckId}`);
      await socketRef.current.emit('game:action:play', { gameId, deck: deckResponse.deck.cards });
      showToast('success', 'Joined table');
    } catch (e) {
      setError((e as Error).message || 'Unable to join the table.');
    } finally {
      setJoiningGame(false);
    }
  };

  const updateReplayPosition = (position: number) => {
    if (!replay) {
      return;
    }
    const nextState = replay.getState(position - 1);
    setReplayPosition(position);
    setState(nextState);
    setLogs(nextState.logs || []);
  };

  return (
    <TableDndProvider>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Table #{gameId}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {loading && <p className="text-sm text-muted-foreground">Loading game state...</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}

            {!loading && state && (
              <>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="app-panel p-3">
                    <strong>Phase</strong>
                    <p className="text-sm text-muted-foreground">{String(state.phase)}</p>
                  </div>
                  <div className="app-panel p-3">
                    <strong>Turn</strong>
                    <p className="text-sm text-muted-foreground">{state.turn}</p>
                  </div>
                  <div className="app-panel p-3">
                    <strong>Format</strong>
                    <p className="text-sm text-muted-foreground">{state.rules.formatName || 'Unlimited'}</p>
                  </div>
                  <div className="app-panel p-3">
                    <strong>Active Player</strong>
                    <p className="text-sm text-muted-foreground">{activePlayer?.name || '-'}</p>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="grid gap-3">
                    <div className="grid gap-3 lg:grid-cols-2">
                      <BoardDndPanel
                        player={orientedPlayers.bottomPlayer}
                        clientId={clientId}
                        disabled={interactionDisabled}
                        onPlayFromHand={playCardFromHand}
                        onReorderBench={reorderBench}
                        onRetreat={retreat}
                      />
                      <HandDndPanel
                        player={orientedPlayers.bottomPlayer}
                        clientId={clientId}
                        disabled={interactionDisabled}
                        onReorder={reorderHand}
                      />
                    </div>

                    <div className="app-panel p-3">
                      <strong>Players</strong>
                      <div className="mt-2 grid gap-2 md:grid-cols-2">
                        {[orientedPlayers.topPlayer, orientedPlayers.bottomPlayer].filter(Boolean).map(player => (
                          <div key={player!.id} className="rounded-md border border-border p-3">
                            <p className="font-semibold">{player!.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {player!.id}</p>
                            <p className="text-xs text-muted-foreground">Hand: {player!.hand.cards.length}</p>
                            <p className="text-xs text-muted-foreground">Deck: {player!.deck.cards.length}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <TableSidebar
                    gameId={gameId}
                    turn={state.turn}
                    timeLimit={timeLimit}
                    topPlayer={orientedPlayers.topPlayer}
                    bottomPlayer={orientedPlayers.bottomPlayer}
                    activePlayerId={activePlayer?.id}
                    clientId={clientId}
                    playerStats={playerStats}
                    logs={logs}
                    isReplay={isReplayMode}
                    replay={replay}
                    replayPosition={replayPosition}
                    isPlaying={isPlaying}
                    isObserver={isObserver}
                    isYourTurn={isYourTurn}
                    waitingForPlayers={waitingForPlayers}
                    joinDeckId={joinDeckId}
                    joinDeckOptions={joinDecks.map(deck => ({ id: deck.id, name: deck.name }))}
                    joiningGame={joiningGame}
                    onSelectJoinDeck={setJoinDeckId}
                    onJoinGame={joinGame}
                    onPassTurn={passTurn}
                    onLeave={leaveTable}
                    onSendLog={appendLog}
                    onSwitchSides={() => setSwitchSides(value => !value)}
                    onReplayPositionChange={updateReplayPosition}
                  />
                </div>
              </>
            )}

            <div className="app-inline-actions">
              <Button asChild variant="outline">
                <Link to="/games">Back to Games</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <PromptHost prompt={currentPrompt} state={state} loading={resolvingPrompt} onResolve={resolvePrompt} />
      </div>
    </TableDndProvider>
  );
}
