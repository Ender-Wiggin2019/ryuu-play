import {
  ScenarioActor,
  ScenarioPatchOperation,
  ScenarioPokemonSlotRef,
  ScenarioSpecialCondition,
  ScenarioTurnMarker,
  ScenarioZoneName,
  ScenarioZoneRef
} from '../api/interfaces/testing.interface';

export interface ScenarioZoneEditorDialogData {
  title: string;
  target: ScenarioZoneRef;
  cards: string[];
}

export interface ScenarioZoneEditorDialogResult {
  cards: string[];
  moveCard?: {
    index: number;
    to: ScenarioZoneRef;
  };
}

export interface ScenarioPokemonSlotEditorDialogData {
  title: string;
  target: ScenarioPokemonSlotRef;
  damage: number;
  conditions: ScenarioSpecialCondition[];
  pokemons: string[];
  energies: string[];
  trainers: string[];
}

export interface ScenarioPokemonSlotEditorDialogResult {
  damage: number;
  conditions: ScenarioSpecialCondition[];
  pokemons: string[];
  energies: string[];
  trainers: string[];
}

export interface ScenarioBoardStateEditorDialogData {
  title: string;
  phase: number;
  turn: number;
  activePlayer: number;
  winner: number;
  clearPrompts: boolean;
  markers: Record<ScenarioActor, Partial<Record<ScenarioTurnMarker, number>>>;
}

export interface ScenarioBoardStateEditorDialogResult {
  phase: number;
  turn: number;
  activePlayer: number;
  winner: number;
  clearPrompts: boolean;
  markers: Record<ScenarioActor, Partial<Record<ScenarioTurnMarker, number>>>;
}

export const SCENARIO_ZONE_OPTIONS: ScenarioZoneName[] = [
  'deck',
  'hand',
  'discard',
  'lostzone',
  'stadium',
  'supporter',
  'prize',
  'active.pokemons',
  'active.energies',
  'active.trainers',
  'bench.pokemons',
  'bench.energies',
  'bench.trainers'
];

export const SCENARIO_SPECIAL_CONDITION_OPTIONS: ScenarioSpecialCondition[] = [
  'PARALYZED',
  'CONFUSED',
  'ASLEEP',
  'POISONED',
  'BURNED'
];

export const SCENARIO_TURN_MARKER_OPTIONS: ScenarioTurnMarker[] = [
  'energyPlayedTurn',
  'retreatedTurn',
  'stadiumPlayedTurn',
  'stadiumUsedTurn'
];

export type ScenarioPatchBuilder<T> = (result: T) => ScenarioPatchOperation[];
