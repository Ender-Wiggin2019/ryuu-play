import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { showToast } from '@/lib/toast';

import type { PlayerStats } from '../../../../common/src/game/player-stats';
import type { Replay } from '../../../../common/src/game/replay';
import type { Player } from '../../../../common/src/store/state/player';
import type { StateLog } from '../../../../common/src/store/state/state-log';

type TableSidebarProps = {
  gameId: number;
  turn: number;
  timeLimit: number;
  topPlayer?: Player;
  bottomPlayer?: Player;
  activePlayerId?: number;
  clientId: number;
  playerStats: PlayerStats[];
  logs: StateLog[];
  isReplay: boolean;
  replay?: Replay;
  replayPosition: number;
  isPlaying: boolean;
  isObserver: boolean;
  isYourTurn: boolean;
  waitingForPlayers: boolean;
  joinDeckId: number | null;
  joinDeckOptions: Array<{ id: number; name: string }>;
  joiningGame?: boolean;
  deleted?: boolean;
  onSelectJoinDeck: (deckId: number) => void;
  onJoinGame: () => Promise<void>;
  onPassTurn: () => Promise<void>;
  onLeave: () => Promise<void>;
  onSendLog: (message: string) => Promise<void>;
  onSwitchSides: () => void;
  onReplayPositionChange: (position: number) => void;
};

function formatTimer(seconds: number | undefined): string {
  if (seconds === undefined || Number.isNaN(seconds)) {
    return '--:--';
  }
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function useLiveTimers(playerStats: PlayerStats[], enabled: boolean): Map<number, number> {
  const [timers, setTimers] = useState(() => new Map<number, number>());

  useEffect(() => {
    const next = new Map<number, number>();
    playerStats.forEach(stats => {
      next.set(stats.clientId, stats.timeLeft);
    });
    setTimers(next);
  }, [playerStats]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const id = window.setInterval(() => {
      setTimers(previous => {
        const next = new Map(previous);
        playerStats.forEach(stats => {
          const current = next.get(stats.clientId) ?? stats.timeLeft;
          next.set(stats.clientId, stats.isTimeRunning && current > 0 ? current - 1 : current);
        });
        return next;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [enabled, playerStats]);

  return timers;
}

function TablePlayerCard({
  player,
  active,
  stats,
  timeLeft
}: {
  player?: Player;
  active: boolean;
  stats?: PlayerStats;
  timeLeft?: number;
}): JSX.Element {
  if (!player) {
    return (
      <div className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
        Waiting for player
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-3 ${active ? 'border-primary bg-primary/5' : 'border-border bg-card/60'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{player.name}</p>
          <p className="text-xs text-muted-foreground">Client #{player.id}</p>
        </div>
        {active && (
          <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
            Active
          </span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>Hand {player.hand.cards.length}</div>
        <div>Deck {player.deck.cards.length}</div>
        <div>Prize {player.prizes.length}</div>
        <div>Discard {player.discard.cards.length}</div>
        {stats && <div>Invalid {stats.invalidMoves}</div>}
        {stats && <div>Time {formatTimer(timeLeft)}</div>}
      </div>
    </div>
  );
}

function ReplayControls({
  replay,
  position,
  onPositionChange
}: {
  replay?: Replay;
  position: number;
  onPositionChange: (position: number) => void;
}): JSX.Element | null {
  const [statesPerSecond, setStatesPerSecond] = useState(1000);
  const [isPlaying, setIsPlaying] = useState(false);

  const stateCount = replay?.getStateCount() ?? 0;
  const turnCount = replay?.getTurnCount() ?? 0;

  useEffect(() => {
    setIsPlaying(false);
  }, [replay]);

  useEffect(() => {
    if (!isPlaying || !replay) {
      return undefined;
    }

    const id = window.setInterval(() => {
      const nextPosition = position + 1;
      if (nextPosition > stateCount) {
        setIsPlaying(false);
        return;
      }
      onPositionChange(nextPosition);
      if (nextPosition === stateCount) {
        setIsPlaying(false);
      }
    }, statesPerSecond);

    return () => window.clearInterval(id);
  }, [isPlaying, onPositionChange, position, replay, stateCount, statesPerSecond]);

  if (!replay) {
    return null;
  }

  const jumpPreviousTurn = () => {
    for (let index = turnCount - 1; index >= 0; index -= 1) {
      const nextPosition = replay.getTurnPosition(index) + 1;
      if (position > nextPosition) {
        onPositionChange(nextPosition);
        return;
      }
    }
    onPositionChange(1);
  };

  const jumpNextTurn = () => {
    for (let index = 0; index < turnCount; index += 1) {
      const nextPosition = replay.getTurnPosition(index) + 1;
      if (position < nextPosition) {
        onPositionChange(nextPosition);
        return;
      }
    }
    onPositionChange(stateCount);
  };

  return (
    <section className="rounded-xl border border-border bg-card/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Replay</p>
          <p className="text-xs text-muted-foreground">State {position} / {stateCount}</p>
        </div>
        <select
          className="h-9 rounded-md border border-input bg-background px-2 text-xs"
          value={statesPerSecond}
          onChange={event => setStatesPerSecond(Number(event.target.value))}
        >
          <option value={4000}>0.25x</option>
          <option value={2000}>0.5x</option>
          <option value={1000}>1x</option>
          <option value={500}>2x</option>
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={jumpPreviousTurn}>Prev Turn</Button>
        <Button size="sm" variant="outline" onClick={() => onPositionChange(Math.max(1, position - 1))}>Prev</Button>
        <Button size="sm" onClick={() => setIsPlaying(value => !value)}>{isPlaying ? 'Pause' : 'Play'}</Button>
        <Button size="sm" variant="outline" onClick={() => onPositionChange(Math.min(stateCount, position + 1))}>Next</Button>
        <Button size="sm" variant="outline" onClick={jumpNextTurn}>Next Turn</Button>
      </div>

      <div className="mt-3 grid gap-2">
        <input
          type="range"
          min={1}
          max={Math.max(1, stateCount)}
          value={Math.min(position, Math.max(1, stateCount))}
          onChange={event => onPositionChange(Number(event.target.value))}
        />
        <p className="text-xs text-muted-foreground">Turns indexed: {turnCount}</p>
      </div>
    </section>
  );
}

export function TableSidebar(props: TableSidebarProps): JSX.Element {
  const [message, setMessage] = useState('');
  const [visibleLogCount, setVisibleLogCount] = useState(50);
  const timerMap = useLiveTimers(props.playerStats, props.timeLimit > 0 && !props.isReplay);

  const topStats = useMemo(
    () => props.topPlayer ? props.playerStats.find(entry => entry.clientId === props.topPlayer?.id) : undefined,
    [props.playerStats, props.topPlayer]
  );
  const bottomStats = useMemo(
    () => props.bottomPlayer ? props.playerStats.find(entry => entry.clientId === props.bottomPlayer?.id) : undefined,
    [props.bottomPlayer, props.playerStats]
  );

  const trimmedLogs = useMemo(() => {
    const logs = props.logs.slice(-visibleLogCount);
    return logs.map(log => {
      const owner = [props.topPlayer, props.bottomPlayer].find(player => player?.id === log.client);
      const ownerName = log.client === 0 ? 'System' : owner?.name || `Client #${log.client}`;
      const params = Object.entries(log.params || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join(' · ');
      return {
        id: log.id,
        ownerName,
        text: params ? `${log.message} · ${params}` : String(log.message),
        isSystem: log.client === 0
      };
    });
  }, [props.bottomPlayer, props.logs, props.topPlayer, visibleLogCount]);

  const submitLog = async () => {
    const nextMessage = message.trim();
    if (!nextMessage || props.deleted || props.isReplay) {
      return;
    }
    await props.onSendLog(nextMessage);
    setMessage('');
  };

  const handleReplayPositionChange = (position: number) => {
    try {
      props.onReplayPositionChange(position);
    } catch (error) {
      showToast('error', (error as Error).message || 'Unable to switch replay state');
    }
  };

  return (
    <aside className="grid gap-4">
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Table</p>
            <h2 className="text-lg font-semibold">#{props.gameId}</h2>
          </div>
          <div className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold">
            Turn {props.turn}
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <TablePlayerCard
            player={props.topPlayer}
            active={props.activePlayerId === props.topPlayer?.id}
            stats={topStats}
            timeLeft={props.topPlayer ? timerMap.get(props.topPlayer.id) ?? topStats?.timeLeft : undefined}
          />
          <TablePlayerCard
            player={props.bottomPlayer}
            active={props.activePlayerId === props.bottomPlayer?.id}
            stats={bottomStats}
            timeLeft={props.bottomPlayer ? timerMap.get(props.bottomPlayer.id) ?? bottomStats?.timeLeft : undefined}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card/80 p-4">
        <p className="text-sm font-semibold">Actions</p>
        <div className="mt-3 grid gap-3">
          {!props.isReplay && props.waitingForPlayers && !props.isPlaying && (
            <div className="grid gap-2">
              <Label htmlFor="table-join-deck">Join with deck</Label>
              <select
                id="table-join-deck"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={props.joinDeckId ?? ''}
                onChange={event => props.onSelectJoinDeck(Number(event.target.value))}
              >
                {props.joinDeckOptions.map(deck => (
                  <option key={deck.id} value={deck.id}>{deck.name}</option>
                ))}
              </select>
              <Button disabled={props.joiningGame || !props.joinDeckId} onClick={() => void props.onJoinGame()}>
                {props.joiningGame ? 'Joining...' : 'Join Game'}
              </Button>
            </div>
          )}

          {!props.isReplay && props.isPlaying && (
            <Button
              variant="outline"
              disabled={!props.isYourTurn || props.deleted}
              onClick={() => void props.onPassTurn()}
            >
              End Turn
            </Button>
          )}

          {props.isObserver && (
            <Button variant="outline" onClick={props.onSwitchSides}>
              Switch Sides
            </Button>
          )}

          <Button variant="outline" onClick={() => void props.onLeave()}>
            {props.isReplay ? 'Close Replay' : 'Leave Table'}
          </Button>
        </div>
      </section>

      <ReplayControls
        replay={props.replay}
        position={props.replayPosition}
        onPositionChange={handleReplayPositionChange}
      />

      <section className="rounded-xl border border-border bg-card/80 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Logs</p>
            <p className="text-xs text-muted-foreground">{props.logs.length} entries</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setVisibleLogCount(value => value + 25)}>
            More
          </Button>
        </div>

        <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1">
          {trimmedLogs.length === 0 && (
            <p className="text-sm text-muted-foreground">No logs yet.</p>
          )}
          {trimmedLogs.map(log => (
            <div
              key={log.id}
              className={`rounded-lg border px-3 py-2 text-sm ${log.isSystem ? 'border-accent/40 bg-accent/10' : 'border-border bg-background/80'}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{log.ownerName}</p>
              <p className="mt-1 break-words text-sm">{log.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-2">
          <Input
            placeholder="Append a table note"
            value={message}
            disabled={props.deleted || props.isReplay}
            onChange={event => setMessage(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void submitLog();
              }
            }}
          />
          <div className="flex justify-end">
            <Button size="sm" disabled={props.deleted || props.isReplay || message.trim().length === 0} onClick={() => void submitLog()}>
              Send Log
            </Button>
          </div>
        </div>
      </section>
    </aside>
  );
}
