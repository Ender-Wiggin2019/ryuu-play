const RECENT_GAMES_KEY = 'ptcg.recent-games';

type RecentGameEntry = {
  gameId: number;
  updatedAt: number;
};

function readEntries(): RecentGameEntry[] {
  try {
    const raw = window.localStorage.getItem(RECENT_GAMES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as RecentGameEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(entry => Number.isFinite(entry.gameId) && Number.isFinite(entry.updatedAt))
      .sort((left, right) => right.updatedAt - left.updatedAt);
  } catch {
    return [];
  }
}

function writeEntries(entries: RecentGameEntry[]): void {
  window.localStorage.setItem(RECENT_GAMES_KEY, JSON.stringify(entries.slice(0, 12)));
}

export function rememberRecentGame(gameId: number): void {
  const next = readEntries().filter(entry => entry.gameId !== gameId);
  next.unshift({ gameId, updatedAt: Date.now() });
  writeEntries(next);
}

export function forgetRecentGame(gameId: number): void {
  writeEntries(readEntries().filter(entry => entry.gameId !== gameId));
}

export function getRecentGameIds(): number[] {
  return readEntries().map(entry => entry.gameId);
}
