export type ApiConfig = {
  apiVersion: number;
  defaultPageSize: number;
  scansUrl: string;
  avatarsUrl: string;
  avatarFileSize: number;
  avatarMinSize: number;
  avatarMaxSize: number;
  replayFileSize: number;
};

export type ApiEnvelope = {
  ok?: boolean;
  error?: string | number;
  message?: string;
};

export type ApiError = Error & {
  code?: string | number;
  status?: number;
};

export type UserInfo = {
  userId: number;
  name: string;
  email?: string;
  ranking: number;
  rank?: string;
  connected?: boolean;
  registered?: number;
  lastSeen?: number;
  avatarFile?: string;
};

export type PlayerInfo = {
  clientId: number;
  name: string;
  prizes: number;
  deck: number;
};

export type GameInfo = {
  gameId: number;
  phase: string;
  turn: number;
  activePlayer: number;
  formatName?: string;
  players: PlayerInfo[];
};

export type ClientInfo = {
  clientId: number;
  userId: number;
};

export type CoreInfo = {
  clientId: number;
  clients: ClientInfo[];
  users: UserInfo[];
  games: GameInfo[];
};

export type RankingRow = {
  position: number;
  user: UserInfo;
};

export type ReplayPlayer = {
  userId: number;
  name: string;
  ranking: number;
};

export type ReplayInfo = {
  replayId: number;
  name: string;
  player1: ReplayPlayer;
  player2: ReplayPlayer;
  winner: number;
  created: number;
};
