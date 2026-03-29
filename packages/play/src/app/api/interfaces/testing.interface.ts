import { Response } from './response.interface';

export interface TestingCreateResponse extends Response {
  gameId: number;
  formatName: string;
  botUserId: number;
}

export type ScenarioActor = 'PLAYER_1' | 'PLAYER_2';
export type ScenarioScope = 'bench' | 'active' | 'player' | 'board' | 'full';
export type ScenarioSpecialCondition = 'PARALYZED' | 'CONFUSED' | 'ASLEEP' | 'POISONED' | 'BURNED';
export type ScenarioSandboxViewMode = 'board' | 'editor' | 'result' | 'help';
export type ScenarioSandboxEditorKind = 'zone' | 'pokemon-slot' | 'turn' | 'prompt' | 'result';
export type ScenarioZoneName =
  | 'deck'
  | 'hand'
  | 'discard'
  | 'lostzone'
  | 'stadium'
  | 'supporter'
  | 'prize'
  | 'active.pokemons'
  | 'active.energies'
  | 'active.trainers'
  | 'bench.pokemons'
  | 'bench.energies'
  | 'bench.trainers';
export type ScenarioCardInZoneName = ScenarioZoneName;
export type ScenarioTurnMarker = 'energyPlayedTurn' | 'retreatedTurn' | 'stadiumPlayedTurn' | 'stadiumUsedTurn';
export type ScenarioPokemonSlot = 'ACTIVE' | 'BENCH';
export type ScenarioPhase = 0 | 1 | 2 | 3 | 4 | 5;
export type ScenarioWinner = -1 | 0 | 1 | 3;

export type ScenarioJsonValue =
  | string
  | number
  | boolean
  | null
  | ScenarioJsonValue[]
  | { [key: string]: ScenarioJsonValue };

export interface ScenarioCardSummary {
  cardInstanceId: number;
  cardIndex: number;
  name: string;
  fullName: string;
  superType: number;
}

export interface ScenarioSlotState {
  damage: number;
  specialConditions: ScenarioSpecialCondition[];
  pokemons: ScenarioCardSummary[];
  energies: ScenarioCardSummary[];
  trainers: ScenarioCardSummary[];
}

export interface ScenarioPlayerZones {
  deck: ScenarioCardSummary[];
  hand: ScenarioCardSummary[];
  discard: ScenarioCardSummary[];
  lostzone: ScenarioCardSummary[];
  stadium: ScenarioCardSummary[];
  supporter: ScenarioCardSummary[];
  prizes: ScenarioCardSummary[][];
}

export interface ScenarioPlayerMarkers {
  retreatedTurn: number;
  energyPlayedTurn: number;
  stadiumPlayedTurn: number;
  stadiumUsedTurn: number;
}

export interface ScenarioPlayerState {
  side: ScenarioActor;
  id: number;
  name: string;
  markers: ScenarioPlayerMarkers;
  prizeLeft: number;
  zones: ScenarioPlayerZones;
  active: ScenarioSlotState;
  bench: ScenarioSlotState[];
}

export interface ScenarioPromptSummary {
  id: number;
  playerId: number;
  type: string;
}

export interface ScenarioFullState {
  turn: number;
  phase: ScenarioPhase | number;
  activePlayer: number;
  winner: ScenarioWinner | number;
  prompts: ScenarioPromptSummary[];
  players: ScenarioPlayerState[];
}

export interface ScenarioBoardState {
  turn: number;
  phase: ScenarioPhase | number;
  players: Array<{
    side: ScenarioActor;
    active: ScenarioSlotState;
    bench: ScenarioSlotState[];
    zones: {
      discard: ScenarioCardSummary[];
      lostzone: ScenarioCardSummary[];
      prizes: ScenarioCardSummary[][];
    };
  }>;
}

export interface ScenarioPlayerExportState {
  turn: number;
  phase: ScenarioPhase | number;
  player: ScenarioPlayerState;
}

export interface ScenarioActiveExportState {
  turn: number;
  phase: ScenarioPhase | number;
  player: ScenarioActor;
  active: ScenarioSlotState;
}

export interface ScenarioBenchExportState {
  turn: number;
  phase: ScenarioPhase | number;
  player: ScenarioActor;
  bench: ScenarioSlotState[];
}

export type ScenarioExportState =
  | ScenarioFullState
  | ScenarioBoardState
  | ScenarioPlayerExportState
  | ScenarioActiveExportState
  | ScenarioBenchExportState;

export interface ScenarioStateResponse extends Response {
  scenarioId: number;
  state: ScenarioFullState;
}

export interface ScenarioCreateResponse extends Response {
  scenarioId: number;
  player1Id: number;
  player2Id: number;
  state: ScenarioFullState;
}

export interface ScenarioDeleteResponse extends Response {
  scenarioId: number;
}

export interface ScenarioExportResponse extends Response {
  scope: ScenarioScope;
  state: ScenarioExportState;
}

export interface ScenarioAssertResponse extends Response {
  result: {
    passed: boolean;
    summary: string;
    checks: Array<{
      type: string;
      passed: boolean;
      message: string;
    }>;
  };
}

export interface ScenarioActionRequest<TPayload = ScenarioActionPayload> {
  actor: ScenarioActor;
  actionType: string;
  payload: TPayload;
}

export type ScenarioActionResponse = Response;

export type ScenarioActionPayload = Record<string, ScenarioJsonValue>;

export interface ScenarioActionOption {
  value: string;
  label: string;
  description: string;
}

export interface ScenarioResolvePromptRequest<TResult = ScenarioJsonValue> {
  actor: ScenarioActor;
  promptId: number;
  result: TResult;
}

export type ScenarioResolvePromptResponse = Response;

export interface ScenarioPokemonSlotRef {
  player: ScenarioActor;
  slot: ScenarioPokemonSlot;
  index?: number;
}

export interface ScenarioZoneRef {
  player: ScenarioActor;
  zone: ScenarioZoneName;
  slotIndex?: number;
}

export interface ScenarioPatchSetDamageOperation {
  op: 'setDamage';
  target: ScenarioPokemonSlotRef;
  damage: number;
}

export interface ScenarioPatchSetSpecialConditionOperation {
  op: 'setSpecialCondition';
  target: ScenarioPokemonSlotRef;
  conditions: ScenarioSpecialCondition[];
}

export interface ScenarioPatchSetTurnMarkerOperation {
  op: 'setTurnMarker';
  player: ScenarioActor;
  marker: ScenarioTurnMarker;
  value: number;
}

export interface ScenarioPatchSetZoneCardsOperation {
  op: 'setZoneCards';
  target: ScenarioZoneRef;
  cards: string[];
}

export interface ScenarioPatchMoveCardOperation {
  op: 'moveCard';
  from: ScenarioZoneRef;
  to: ScenarioZoneRef;
  index: number;
}

export interface ScenarioPatchClearPromptsOperation {
  op: 'clearPrompts';
}

export interface ScenarioPatchSetStateOperation {
  op: 'setState';
  phase?: number;
  turn?: number;
  activePlayer?: number;
  winner?: number;
}

export type ScenarioPatchOperation =
  | ScenarioPatchSetDamageOperation
  | ScenarioPatchSetSpecialConditionOperation
  | ScenarioPatchSetTurnMarkerOperation
  | ScenarioPatchSetZoneCardsOperation
  | ScenarioPatchMoveCardOperation
  | ScenarioPatchClearPromptsOperation
  | ScenarioPatchSetStateOperation;

export interface ScenarioPatchRequest {
  operations: ScenarioPatchOperation[];
}

export interface ScenarioPatchResponse extends Response {
  state: ScenarioFullState;
}

export interface ScenarioZoneEditorValue {
  player: ScenarioActor;
  zone: ScenarioZoneName;
  slotIndex?: number;
  cards: string[];
}

export interface ScenarioPokemonSlotEditorValue {
  player: ScenarioActor;
  slot: ScenarioPokemonSlot;
  index?: number;
  pokemon: string[];
  energies: string[];
  trainers: string[];
  damage: number;
  conditions: ScenarioSpecialCondition[];
}

export interface ScenarioBoardStateEditorValue {
  phase: ScenarioPhase | number;
  turn: number;
  activePlayer: ScenarioActor;
  winner: ScenarioWinner | number;
  markers: Array<{
    player: ScenarioActor;
    marker: ScenarioTurnMarker;
    value: number;
  }>;
}

export interface ScenarioZoneEditIntent {
  side: ScenarioActor;
  zone: 'deck' | 'discard' | 'lostzone' | 'stadium' | 'supporter' | 'prize' | 'hand';
  index?: number;
}

export interface ScenarioPokemonSlotEditIntent {
  side: ScenarioActor;
  slot: ScenarioPokemonSlot;
  index: number;
}

export interface ScenarioAssertPromptPendingCheck {
  type: 'promptPending';
  expected: number;
}

export interface ScenarioAssertDamageCheck {
  type: 'damage';
  player: ScenarioActor;
  slot: ScenarioPokemonSlot;
  slotIndex?: number;
  expected: number;
}

export interface ScenarioAssertCardInZoneCheck {
  type: 'cardInZone';
  player: ScenarioActor;
  zone: ScenarioZoneName;
  slotIndex?: number;
  cardName: string;
}

export type ScenarioAssertCheck =
  | ScenarioAssertPromptPendingCheck
  | ScenarioAssertDamageCheck
  | ScenarioAssertCardInZoneCheck;

export interface ScenarioSandboxTurnState {
  phase: number;
  turn: number;
  activePlayer: number;
  winner: number;
}

export interface ScenarioSandboxZoneDraft {
  target: ScenarioZoneRef;
  cards: string[];
}

export interface ScenarioSandboxPokemonSlotDraft {
  target: ScenarioPokemonSlotRef;
  damage: number;
  specialConditions: ScenarioSpecialCondition[];
  energyCards: string[];
  trainerCards: string[];
}

export interface ScenarioSandboxTurnDraft {
  phase: number;
  turn: number;
  activePlayer: number;
  winner: number;
}

export interface ScenarioSandboxPromptDraft {
  promptId: number;
  actor: ScenarioActor;
  result: ScenarioJsonValue | null;
}

export interface ScenarioSandboxExportDraft {
  scope: ScenarioScope;
  player?: ScenarioActor;
}

export interface ScenarioSandboxAssertDraft {
  checks: unknown[];
}

export interface ScenarioSandboxResultSummary {
  passed: boolean;
  summary: string;
  rawJsonExpanded: boolean;
}

export interface ScenarioSandboxEditorState {
  scenarioId?: number;
  viewMode: ScenarioSandboxViewMode;
  selectedKind: ScenarioSandboxEditorKind | null;
  selectedZone?: ScenarioZoneRef;
  selectedSlot?: ScenarioPokemonSlotRef;
  selectedPromptId?: number;
  turnDraft: ScenarioSandboxTurnDraft;
  exportDraft: ScenarioSandboxExportDraft;
  assertDraft: ScenarioSandboxAssertDraft;
  resultSummary?: ScenarioSandboxResultSummary;
}

export type ScenarioSandboxEditorSelection =
  | { kind: 'zone'; target: ScenarioZoneRef }
  | { kind: 'pokemon-slot'; target: ScenarioPokemonSlotRef }
  | { kind: 'turn'; target: ScenarioSandboxTurnState }
  | { kind: 'prompt'; promptId: number; actor: ScenarioActor }
  | { kind: 'result'; scope: ScenarioScope; player?: ScenarioActor };

export interface ScenarioSandboxCardZoneSummary {
  label: string;
  zone: ScenarioZoneName;
  player: ScenarioActor;
  slotIndex?: number;
  count: number;
}
