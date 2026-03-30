import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';

type ScenarioActor = 'PLAYER_1' | 'PLAYER_2';
type ScenarioScope = 'bench' | 'active' | 'player' | 'board' | 'full';
type ScenarioZoneName =
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
type ScenarioSlotKind = 'ACTIVE' | 'BENCH';
type ScenarioSpecialCondition = 'PARALYZED' | 'CONFUSED' | 'ASLEEP' | 'POISONED' | 'BURNED';

type ScenarioCreateResponse = {
  scenarioId: number;
  player1Id: number;
  player2Id: number;
  state: unknown;
};

type ScenarioStateResponse = {
  scenarioId: number;
  state: unknown;
};

type ScenarioExportResponse = {
  scope: ScenarioScope;
  state: unknown;
};

type ScenarioAssertResponse = {
  result: {
    passed: boolean;
    summary: string;
    checks: Array<{ type: string; passed: boolean; message: string }>;
  };
};

type ScenarioCardSummary = {
  fullName: string;
  name: string;
};

type ScenarioSlotState = {
  damage: number;
  specialConditions: string[];
  pokemons: ScenarioCardSummary[];
  energies: ScenarioCardSummary[];
  trainers: ScenarioCardSummary[];
};

type ScenarioPlayerState = {
  side: ScenarioActor;
  name: string;
  id: number;
  zones: {
    deck: ScenarioCardSummary[];
    hand: ScenarioCardSummary[];
    discard: ScenarioCardSummary[];
    lostzone: ScenarioCardSummary[];
    stadium: ScenarioCardSummary[];
    supporter: ScenarioCardSummary[];
    prizes: ScenarioCardSummary[][];
  };
  active: ScenarioSlotState;
  bench: ScenarioSlotState[];
};

type ScenarioStateData = {
  turn: number;
  phase: number;
  activePlayer: number;
  winner: number;
  prompts: Array<{ id: number; type: string; playerId: number }>;
  players: ScenarioPlayerState[];
};

type ScenarioPatchOperation =
  | { op: 'setState'; phase?: number; turn?: number; activePlayer?: number; winner?: number }
  | { op: 'clearPrompts' }
  | { op: 'setDamage'; target: { player: ScenarioActor; slot: ScenarioSlotKind; index?: number }; damage: number }
  | { op: 'setSpecialCondition'; target: { player: ScenarioActor; slot: ScenarioSlotKind; index?: number }; conditions: ScenarioSpecialCondition[] }
  | { op: 'setZoneCards'; target: { player: ScenarioActor; zone: ScenarioZoneName; slotIndex?: number }; cards: string[] };

function parseJson(text: string, fallback: unknown) {
  const trimmed = text.trim();
  if (!trimmed) {
    return fallback;
  }
  return JSON.parse(trimmed) as unknown;
}

function stringifyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function parseLines(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

function formatLines(values: string[]): string {
  return values.join('\n');
}

function getPlayer(state: ScenarioStateData | null, actor: ScenarioActor): ScenarioPlayerState | undefined {
  return state?.players.find(player => player.side === actor);
}

function getZoneCards(state: ScenarioStateData | null, actor: ScenarioActor, zone: ScenarioZoneName, slotIndex: number): string[] {
  const player = getPlayer(state, actor);
  if (!player) {
    return [];
  }

  switch (zone) {
    case 'deck':
    case 'hand':
    case 'discard':
    case 'lostzone':
    case 'stadium':
    case 'supporter':
      return player.zones[zone].map(card => card.fullName || card.name);
    case 'prize':
      return (player.zones.prizes[slotIndex] || []).map(card => card.fullName || card.name);
    case 'active.pokemons':
      return player.active.pokemons.map(card => card.fullName || card.name);
    case 'active.energies':
      return player.active.energies.map(card => card.fullName || card.name);
    case 'active.trainers':
      return player.active.trainers.map(card => card.fullName || card.name);
    case 'bench.pokemons':
      return (player.bench[slotIndex]?.pokemons || []).map(card => card.fullName || card.name);
    case 'bench.energies':
      return (player.bench[slotIndex]?.energies || []).map(card => card.fullName || card.name);
    case 'bench.trainers':
      return (player.bench[slotIndex]?.trainers || []).map(card => card.fullName || card.name);
    default:
      return [];
  }
}

function getSlotState(state: ScenarioStateData | null, actor: ScenarioActor, slot: ScenarioSlotKind, index: number): ScenarioSlotState | undefined {
  const player = getPlayer(state, actor);
  if (!player) {
    return undefined;
  }
  return slot === 'ACTIVE' ? player.active : player.bench[index];
}

export function ScenarioPage(): JSX.Element {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [scenarioId, setScenarioId] = useState<number | null>(null);
  const [formatName, setFormatName] = useState('');
  const [actor, setActor] = useState<ScenarioActor>('PLAYER_1');
  const [scope, setScope] = useState<ScenarioScope>('board');
  const [actionType, setActionType] = useState('pass');
  const [promptId, setPromptId] = useState(0);
  const [actionPayloadText, setActionPayloadText] = useState('{}');
  const [promptResultText, setPromptResultText] = useState('null');
  const [patchOperationsText, setPatchOperationsText] = useState('[]');
  const [assertChecksText, setAssertChecksText] = useState('[]');
  const [rawResult, setRawResult] = useState('');
  const [scenarioState, setScenarioState] = useState<ScenarioStateData | null>(null);
  const [viewSide, setViewSide] = useState<ScenarioActor>('PLAYER_1');
  const [statePhase, setStatePhase] = useState(0);
  const [stateTurn, setStateTurn] = useState(0);
  const [stateActivePlayer, setStateActivePlayer] = useState(0);
  const [stateWinner, setStateWinner] = useState(0);
  const [clearPrompts, setClearPrompts] = useState(false);
  const [zoneEditorPlayer, setZoneEditorPlayer] = useState<ScenarioActor>('PLAYER_1');
  const [zoneEditorZone, setZoneEditorZone] = useState<ScenarioZoneName>('hand');
  const [zoneEditorSlotIndex, setZoneEditorSlotIndex] = useState(0);
  const [zoneEditorCardsText, setZoneEditorCardsText] = useState('');
  const [slotEditorPlayer, setSlotEditorPlayer] = useState<ScenarioActor>('PLAYER_1');
  const [slotEditorSlot, setSlotEditorSlot] = useState<ScenarioSlotKind>('ACTIVE');
  const [slotEditorIndex, setSlotEditorIndex] = useState(0);
  const [slotPokemonText, setSlotPokemonText] = useState('');
  const [slotEnergyText, setSlotEnergyText] = useState('');
  const [slotTrainerText, setSlotTrainerText] = useState('');
  const [slotDamage, setSlotDamage] = useState(0);
  const [slotConditionsText, setSlotConditionsText] = useState('');

  const hasScenario = useMemo(() => scenarioId !== null && scenarioId > 0, [scenarioId]);
  const viewedPlayer = useMemo(() => getPlayer(scenarioState, viewSide), [scenarioState, viewSide]);
  const opponentPlayer = useMemo(
    () => getPlayer(scenarioState, viewSide === 'PLAYER_1' ? 'PLAYER_2' : 'PLAYER_1'),
    [scenarioState, viewSide]
  );

  useEffect(() => {
    const scenarioIdParam = Number(searchParams.get('scenarioId') || 0);
    if (!scenarioIdParam || scenarioId === scenarioIdParam) {
      return;
    }
    setScenarioId(scenarioIdParam);
  }, [scenarioId, searchParams]);

  useEffect(() => {
    if (!scenarioId || scenarioState) {
      return;
    }
    void loadState();
  }, [scenarioId, scenarioState]);

  const execute = async (run: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await run();
    } catch (e) {
      setError((e as Error).message || 'Scenario request failed.');
    } finally {
      setBusy(false);
    }
  };

  const createScenario = async (event: FormEvent) => {
    event.preventDefault();
    await execute(async () => {
      const response = await apiClient.post<ScenarioCreateResponse>('/v1/testing/scenario/create', {
        playerDeckId: undefined,
        botDeckId: undefined,
        formatName
      });
      setScenarioId(response.scenarioId);
      setScenarioState(response.state as ScenarioStateData);
      setRawResult(stringifyJson(response.state));
      setStatePhase((response.state as ScenarioStateData).phase);
      setStateTurn((response.state as ScenarioStateData).turn);
      setStateActivePlayer((response.state as ScenarioStateData).activePlayer);
      setStateWinner((response.state as ScenarioStateData).winner);
    });
  };

  const loadState = async () => {
    if (!hasScenario) {
      return;
    }
    await execute(async () => {
      const response = await apiClient.get<ScenarioStateResponse>(`/v1/testing/scenario/${scenarioId}/state`);
      setScenarioState(response.state as ScenarioStateData);
      setRawResult(stringifyJson(response.state));
      setStatePhase((response.state as ScenarioStateData).phase);
      setStateTurn((response.state as ScenarioStateData).turn);
      setStateActivePlayer((response.state as ScenarioStateData).activePlayer);
      setStateWinner((response.state as ScenarioStateData).winner);
    });
  };

  const deleteScenario = async () => {
    if (!hasScenario) {
      return;
    }
    await execute(async () => {
      await apiClient.post(`/v1/testing/scenario/${scenarioId}/delete`, {});
      setRawResult('');
      setScenarioState(null);
      setScenarioId(null);
    });
  };

  const runAction = async () => {
    if (!hasScenario) {
      return;
    }
    await execute(async () => {
      const payload = parseJson(actionPayloadText, {});
      const result = await apiClient.post(`/v1/testing/scenario/${scenarioId}/action`, {
        actor,
        actionType,
        payload
      });
      setRawResult(JSON.stringify(result, null, 2));
      await loadState();
    });
  };

  const resolvePrompt = async () => {
    if (!hasScenario) {
      return;
    }
    await execute(async () => {
      const result = parseJson(promptResultText, null);
      const response = await apiClient.post(`/v1/testing/scenario/${scenarioId}/prompt/resolve`, {
        actor,
        promptId,
        result
      });
      setRawResult(JSON.stringify(response, null, 2));
      await loadState();
    });
  };

  const applyPatch = async () => {
    if (!hasScenario) {
      return;
    }
    await execute(async () => {
      const operations = parseJson(patchOperationsText, []);
      const response = await apiClient.post(`/v1/testing/scenario/${scenarioId}/patch`, { operations });
      setRawResult(stringifyJson(response));
      await loadState();
    });
  };

  const exportScenario = async () => {
    if (!hasScenario) {
      return;
    }
    await execute(async () => {
      const response = await apiClient.post<ScenarioExportResponse>(`/v1/testing/scenario/${scenarioId}/export`, {
        scope,
        player: scope === 'active' || scope === 'bench' || scope === 'player' ? actor : undefined
      });
      setRawResult(stringifyJson(response.state));
    });
  };

  const assertScenario = async () => {
    if (!hasScenario) {
      return;
    }
    await execute(async () => {
      const checks = parseJson(assertChecksText, []);
      const response = await apiClient.post<ScenarioAssertResponse>(`/v1/testing/scenario/${scenarioId}/assert`, {
        checks
      });
      setRawResult(stringifyJson(response.result));
    });
  };

  const applyPatchOperations = async (operations: ScenarioPatchOperation[]) => {
    if (!hasScenario) {
      return;
    }
    setPatchOperationsText(stringifyJson(operations));
    await execute(async () => {
      const response = await apiClient.post(`/v1/testing/scenario/${scenarioId}/patch`, { operations });
      setRawResult(stringifyJson(response));
      await loadState();
    });
  };

  const loadCurrentZoneEditor = () => {
    const cards = getZoneCards(scenarioState, zoneEditorPlayer, zoneEditorZone, zoneEditorSlotIndex);
    setZoneEditorCardsText(formatLines(cards));
  };

  const applyZoneEditor = async () => {
    const cards = parseLines(zoneEditorCardsText);
    await applyPatchOperations([
      {
        op: 'setZoneCards',
        target: {
          player: zoneEditorPlayer,
          zone: zoneEditorZone,
          slotIndex: zoneEditorZone === 'prize' || zoneEditorZone.startsWith('bench.') ? zoneEditorSlotIndex : undefined
        },
        cards
      }
    ]);
  };

  const loadCurrentSlotEditor = () => {
    const slot = getSlotState(scenarioState, slotEditorPlayer, slotEditorSlot, slotEditorIndex);
    setSlotPokemonText(formatLines((slot?.pokemons || []).map(card => card.fullName || card.name)));
    setSlotEnergyText(formatLines((slot?.energies || []).map(card => card.fullName || card.name)));
    setSlotTrainerText(formatLines((slot?.trainers || []).map(card => card.fullName || card.name)));
    setSlotDamage(slot?.damage || 0);
    setSlotConditionsText((slot?.specialConditions || []).join(', '));
  };

  const applySlotEditor = async () => {
    const zonePrefix = slotEditorSlot === 'ACTIVE' ? 'active' : 'bench';
    const slotIndex = slotEditorSlot === 'BENCH' ? slotEditorIndex : undefined;
    const conditions = slotConditionsText
      .split(',')
      .map(value => value.trim().toUpperCase())
      .filter(Boolean) as ScenarioSpecialCondition[];

    await applyPatchOperations([
      {
        op: 'setZoneCards',
        target: { player: slotEditorPlayer, zone: `${zonePrefix}.pokemons` as ScenarioZoneName, slotIndex },
        cards: parseLines(slotPokemonText)
      },
      {
        op: 'setZoneCards',
        target: { player: slotEditorPlayer, zone: `${zonePrefix}.energies` as ScenarioZoneName, slotIndex },
        cards: parseLines(slotEnergyText)
      },
      {
        op: 'setZoneCards',
        target: { player: slotEditorPlayer, zone: `${zonePrefix}.trainers` as ScenarioZoneName, slotIndex },
        cards: parseLines(slotTrainerText)
      },
      {
        op: 'setDamage',
        target: { player: slotEditorPlayer, slot: slotEditorSlot, index: slotIndex },
        damage: slotDamage
      },
      {
        op: 'setSpecialCondition',
        target: { player: slotEditorPlayer, slot: slotEditorSlot, index: slotIndex },
        conditions
      }
    ]);
  };

  const applyStateEditor = async () => {
    const operations: ScenarioPatchOperation[] = [{
      op: 'setState',
      phase: statePhase,
      turn: stateTurn,
      activePlayer: stateActivePlayer,
      winner: stateWinner
    }];
    if (clearPrompts) {
      operations.push({ op: 'clearPrompts' });
    }
    await applyPatchOperations(operations);
  };

  const useAssertTemplate = (template: 'promptPending' | 'damage' | 'cardInZone') => {
    if (template === 'promptPending') {
      setAssertChecksText(stringifyJson([{ type: 'promptPending', expected: scenarioState?.prompts.length || 0 }]));
      return;
    }
    if (template === 'damage') {
      setAssertChecksText(stringifyJson([{
        type: 'damage',
        player: slotEditorPlayer,
        slot: slotEditorSlot,
        slotIndex: slotEditorSlot === 'BENCH' ? slotEditorIndex : undefined,
        expected: slotDamage
      }]));
      return;
    }
    setAssertChecksText(stringifyJson([{
      type: 'cardInZone',
      player: zoneEditorPlayer,
      zone: zoneEditorZone,
      slotIndex: zoneEditorZone === 'prize' || zoneEditorZone.startsWith('bench.') ? zoneEditorSlotIndex : undefined,
      cardName: parseLines(zoneEditorCardsText)[0] || ''
    }]));
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('SCENARIO_TITLE', { defaultValue: 'Scenario Lab' })}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <form className="app-inline-actions" onSubmit={event => void createScenario(event)}>
            <Input
              className="w-[220px]"
              placeholder={t('LABEL_FORMAT', { defaultValue: 'Format' })}
              value={formatName}
              onChange={event => setFormatName(event.target.value)}
            />
            <Button type="submit" disabled={busy}>
              {t('SCENARIO_CREATE', { defaultValue: 'Create scenario' })}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy || !hasScenario}
              onClick={() => {
                setViewSide(current => current === 'PLAYER_1' ? 'PLAYER_2' : 'PLAYER_1');
              }}
            >
              View {viewSide}
            </Button>
          </form>

          <div className="app-inline-actions">
            <Input
              className="w-[220px]"
              value={scenarioId ?? ''}
              onChange={event => setScenarioId(event.target.value ? Number(event.target.value) : null)}
              placeholder="Scenario ID"
            />
            <Button variant="outline" disabled={busy || !hasScenario} onClick={() => void loadState()}>
              {t('BUTTON_REFRESH', { defaultValue: 'Refresh state' })}
            </Button>
            <Button variant="outline" disabled={busy || !hasScenario} onClick={() => void deleteScenario()}>
              {t('BUTTON_DELETE', { defaultValue: 'Delete scenario' })}
            </Button>
            {hasScenario && (
              <Button asChild variant="outline">
                <Link to={`/table/${scenarioId}`}>{t('BUTTON_SHOW', { defaultValue: 'Open table' })}</Link>
              </Button>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t('SCENARIO_BOARD_TITLE', { defaultValue: 'Board Snapshot' })}</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              {[opponentPlayer, viewedPlayer].filter(Boolean).map(player => (
                <div key={player!.id} className="app-panel p-3">
                  <p className="font-semibold">{player!.side} · {player!.name}</p>
                  <p className="text-xs text-muted-foreground">Active {player!.active.pokemons[0]?.name || '-'} · Damage {player!.active.damage}</p>
                  <p className="text-xs text-muted-foreground">Bench {player!.bench.map(slot => slot.pokemons[0]?.name || '-').join(', ') || '-'}</p>
                  <p className="text-xs text-muted-foreground">Hand {player!.zones.hand.length} · Deck {player!.zones.deck.length} · Discard {player!.zones.discard.length}</p>
                </div>
              ))}
            </div>
            <div className="app-panel p-3">
              <p className="font-semibold">Pending Prompts</p>
              <p className="text-xs text-muted-foreground">{scenarioState?.prompts.map(prompt => `#${prompt.id} ${prompt.type} (${prompt.playerId})`).join(' | ') || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('SCENARIO_EDITOR_STATE_TITLE', { defaultValue: 'Board State Editor' })}</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="app-form-field">
                <Label htmlFor="scenario-state-phase">Phase</Label>
                <Input id="scenario-state-phase" value={statePhase} onChange={event => setStatePhase(Number(event.target.value) || 0)} />
              </div>
              <div className="app-form-field">
                <Label htmlFor="scenario-state-turn">Turn</Label>
                <Input id="scenario-state-turn" value={stateTurn} onChange={event => setStateTurn(Number(event.target.value) || 0)} />
              </div>
              <div className="app-form-field">
                <Label htmlFor="scenario-state-active-player">Active Player Index</Label>
                <Input id="scenario-state-active-player" value={stateActivePlayer} onChange={event => setStateActivePlayer(Number(event.target.value) || 0)} />
              </div>
              <div className="app-form-field">
                <Label htmlFor="scenario-state-winner">Winner</Label>
                <Input id="scenario-state-winner" value={stateWinner} onChange={event => setStateWinner(Number(event.target.value) || 0)} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input checked={clearPrompts} type="checkbox" onChange={event => setClearPrompts(event.target.checked)} />
              Clear pending prompts
            </label>
            <Button disabled={busy || !hasScenario} onClick={() => void applyStateEditor()}>
              Apply Board State
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('SCENARIO_ZONE_EDITOR', { defaultValue: 'Zone Editor' })}</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-3">
              <div className="app-form-field">
                <Label htmlFor="scenario-zone-player">Player</Label>
                <select id="scenario-zone-player" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={zoneEditorPlayer} onChange={event => setZoneEditorPlayer(event.target.value as ScenarioActor)}>
                  <option value="PLAYER_1">PLAYER_1</option>
                  <option value="PLAYER_2">PLAYER_2</option>
                </select>
              </div>
              <div className="app-form-field">
                <Label htmlFor="scenario-zone-name">Zone</Label>
                <select id="scenario-zone-name" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={zoneEditorZone} onChange={event => setZoneEditorZone(event.target.value as ScenarioZoneName)}>
                  {['deck', 'hand', 'discard', 'lostzone', 'stadium', 'supporter', 'prize', 'active.pokemons', 'active.energies', 'active.trainers', 'bench.pokemons', 'bench.energies', 'bench.trainers'].map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
              <div className="app-form-field">
                <Label htmlFor="scenario-zone-index">Slot Index</Label>
                <Input id="scenario-zone-index" value={zoneEditorSlotIndex} onChange={event => setZoneEditorSlotIndex(Number(event.target.value) || 0)} />
              </div>
            </div>
            <div className="app-inline-actions">
              <Button variant="outline" disabled={!hasScenario} onClick={loadCurrentZoneEditor}>Load Current</Button>
              <Button disabled={busy || !hasScenario} onClick={() => void applyZoneEditor()}>Apply Zone Patch</Button>
            </div>
            <Textarea className="min-h-[220px] font-mono text-xs" value={zoneEditorCardsText} onChange={event => setZoneEditorCardsText(event.target.value)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('SCENARIO_SLOT_EDITOR', { defaultValue: 'Pokemon Slot Editor' })}</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-3">
              <div className="app-form-field">
                <Label htmlFor="scenario-slot-player">Player</Label>
                <select id="scenario-slot-player" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={slotEditorPlayer} onChange={event => setSlotEditorPlayer(event.target.value as ScenarioActor)}>
                  <option value="PLAYER_1">PLAYER_1</option>
                  <option value="PLAYER_2">PLAYER_2</option>
                </select>
              </div>
              <div className="app-form-field">
                <Label htmlFor="scenario-slot-kind">Slot</Label>
                <select id="scenario-slot-kind" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={slotEditorSlot} onChange={event => setSlotEditorSlot(event.target.value as ScenarioSlotKind)}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="BENCH">BENCH</option>
                </select>
              </div>
              <div className="app-form-field">
                <Label htmlFor="scenario-slot-index">Bench Index</Label>
                <Input id="scenario-slot-index" value={slotEditorIndex} onChange={event => setSlotEditorIndex(Number(event.target.value) || 0)} />
              </div>
            </div>
            <div className="app-inline-actions">
              <Button variant="outline" disabled={!hasScenario} onClick={loadCurrentSlotEditor}>Load Current</Button>
              <Button disabled={busy || !hasScenario} onClick={() => void applySlotEditor()}>Apply Slot Patch</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>Pokemon</Label>
                <Textarea className="min-h-[160px] font-mono text-xs" value={slotPokemonText} onChange={event => setSlotPokemonText(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Energy</Label>
                <Textarea className="min-h-[160px] font-mono text-xs" value={slotEnergyText} onChange={event => setSlotEnergyText(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Trainers</Label>
                <Textarea className="min-h-[160px] font-mono text-xs" value={slotTrainerText} onChange={event => setSlotTrainerText(event.target.value)} />
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="app-form-field">
                <Label htmlFor="scenario-slot-damage">Damage</Label>
                <Input id="scenario-slot-damage" value={slotDamage} onChange={event => setSlotDamage(Number(event.target.value) || 0)} />
              </div>
              <div className="app-form-field">
                <Label htmlFor="scenario-slot-conditions">Conditions</Label>
                <Input id="scenario-slot-conditions" placeholder="POISONED, ASLEEP" value={slotConditionsText} onChange={event => setSlotConditionsText(event.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('SCENARIO_ACTION', { defaultValue: 'Action' })}</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="app-form-field">
                <Label htmlFor="scenario-actor">{t('LABEL_PLAYER', { defaultValue: 'Actor' })}</Label>
                <select
                  id="scenario-actor"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={actor}
                  onChange={event => setActor(event.target.value as ScenarioActor)}
                >
                  <option value="PLAYER_1">PLAYER_1</option>
                  <option value="PLAYER_2">PLAYER_2</option>
                </select>
              </div>
              <div className="app-form-field">
                <Label htmlFor="scenario-action-type">{t('LABEL_ACTIONS', { defaultValue: 'Action Type' })}</Label>
                <Input id="scenario-action-type" value={actionType} onChange={event => setActionType(event.target.value)} />
              </div>
            </div>
            <Textarea
              className="min-h-[160px] font-mono text-xs"
              value={actionPayloadText}
              onChange={event => setActionPayloadText(event.target.value)}
            />
            <Button disabled={busy || !hasScenario} onClick={() => void runAction()}>
              Run Action
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('SCENARIO_PROMPT_RESOLVE', { defaultValue: 'Resolve Prompt' })}</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="app-form-field">
                <Label htmlFor="scenario-prompt-id">Prompt ID</Label>
                <Input
                  id="scenario-prompt-id"
                  value={promptId}
                  onChange={event => setPromptId(Number(event.target.value) || 0)}
                />
              </div>
              <div className="app-form-field">
                <Label htmlFor="scenario-export-scope">{t('SCENARIO_EXPORT_SCOPE', { defaultValue: 'Export scope' })}</Label>
                <select
                  id="scenario-export-scope"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={scope}
                  onChange={event => setScope(event.target.value as ScenarioScope)}
                >
                  <option value="board">board</option>
                  <option value="full">full</option>
                  <option value="player">player</option>
                  <option value="active">active</option>
                  <option value="bench">bench</option>
                </select>
              </div>
            </div>
            <Textarea
              className="min-h-[120px] font-mono text-xs"
              value={promptResultText}
              onChange={event => setPromptResultText(event.target.value)}
            />
            <div className="app-inline-actions">
              <Button disabled={busy || !hasScenario} onClick={() => void resolvePrompt()}>
                Resolve Prompt
              </Button>
              <Button variant="outline" disabled={busy || !hasScenario} onClick={() => void exportScenario()}>
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('SCENARIO_PATCH', { defaultValue: 'Patch' })}</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <Textarea
              className="min-h-[180px] font-mono text-xs"
              value={patchOperationsText}
              onChange={event => setPatchOperationsText(event.target.value)}
            />
            <Button disabled={busy || !hasScenario} onClick={() => void applyPatch()}>
              Apply Patch
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('SCENARIO_ASSERT', { defaultValue: 'Assert' })}</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <div className="app-inline-actions">
              <Button size="sm" variant="outline" disabled={!hasScenario} onClick={() => useAssertTemplate('promptPending')}>Prompt Template</Button>
              <Button size="sm" variant="outline" disabled={!hasScenario} onClick={() => useAssertTemplate('damage')}>Damage Template</Button>
              <Button size="sm" variant="outline" disabled={!hasScenario} onClick={() => useAssertTemplate('cardInZone')}>Card In Zone Template</Button>
            </div>
            <Textarea
              className="min-h-[180px] font-mono text-xs"
              value={assertChecksText}
              onChange={event => setAssertChecksText(event.target.value)}
            />
            <Button disabled={busy || !hasScenario} onClick={() => void assertScenario()}>
              Run Assert
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('SCENARIO_RESULT', { defaultValue: 'Result' })}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {scenarioState && (
            <div className="grid gap-3 lg:grid-cols-2">
              {scenarioState.players.map(player => (
                <div key={player.id} className="app-panel p-3">
                  <p className="font-semibold">{player.side} · {player.name}</p>
                  <p className="text-xs text-muted-foreground">Deck {player.zones.deck.length} / Hand {player.zones.hand.length} / Discard {player.zones.discard.length}</p>
                  <p className="text-xs text-muted-foreground">Lost Zone {player.zones.lostzone.length} / Prize {player.zones.prizes.reduce((sum, prize) => sum + prize.length, 0)}</p>
                  <p className="text-xs text-muted-foreground mt-2">Active: {player.active.pokemons[0]?.name || '-'} · Damage {player.active.damage}</p>
                  <p className="text-xs text-muted-foreground">Bench: {player.bench.map(slot => slot.pokemons[0]?.name || '-').join(', ') || '-'}</p>
                </div>
              ))}
              <div className="app-panel p-3 lg:col-span-2">
                <p className="font-semibold">State Snapshot</p>
                <p className="text-xs text-muted-foreground">Turn {scenarioState.turn} · Phase {scenarioState.phase} · Active Player {scenarioState.activePlayer}</p>
                <p className="text-xs text-muted-foreground">Pending Prompts: {scenarioState.prompts.length}</p>
              </div>
            </div>
          )}
          <Textarea readOnly className="min-h-[280px] font-mono text-xs" value={rawResult} />
        </CardContent>
      </Card>
    </div>
  );
}
