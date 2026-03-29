import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Format, Player, Prompt, Rules, SpecialCondition } from '@ptcg/common';
import { EMPTY, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';

import {
  ScenarioActor,
  ScenarioAssertCheck,
  ScenarioAssertResponse,
  ScenarioCardInZoneName,
  ScenarioExportResponse,
  ScenarioPatchOperation,
  ScenarioPokemonSlotEditIntent,
  ScenarioScope,
  ScenarioZoneEditIntent
} from '../api/interfaces/testing.interface';
import { GameService } from '../api/services/game.service';
import { TestingService } from '../api/services/testing.service';
import { CardsBaseService } from '../shared/cards/cards-base.service';
import { SessionService } from '../shared/session/session.service';
import { LocalGameState } from '../shared/session/session.interface';
import {
  ScenarioBoardStateEditorDialogData,
  ScenarioPokemonSlotEditorDialogData,
  ScenarioZoneEditorDialogData
} from './scenario-sandbox-dialog.types';
import { ScenarioSandboxEditorDialogService } from './scenario-sandbox-editor-dialog.service';
import { BoardSandboxSlotEditEvent, BoardSandboxZoneEditEvent } from '../table/board/board.component';

type ScenarioAssertTemplate = 'promptPending' | 'damage' | 'cardInZone';
type ScenarioResultKind = 'idle' | 'export' | 'assert' | 'patch' | 'create';

@Component({
  selector: 'ptcg-scenario-lab',
  templateUrl: './scenario-lab.component.html',
  styleUrls: ['./scenario-lab.component.scss']
})
export class ScenarioLabComponent implements OnInit {
  public loading = false;
  public formats: Format[] = [];
  public format: Format | undefined;
  public scenarioId: number | undefined;
  public scenarioLocalId: number | undefined;
  public localGameState: LocalGameState | undefined;
  public currentViewSide: ScenarioActor = 'PLAYER_1';
  public exportScope: ScenarioScope = 'board';
  public exportPlayer: ScenarioActor = 'PLAYER_1';
  public assertTemplate: ScenarioAssertTemplate = 'promptPending';
  public promptPendingExpected = 0;
  public damageExpected = 0;
  public damagePlayer: ScenarioActor = 'PLAYER_2';
  public damageSlot: 'ACTIVE' | 'BENCH' = 'BENCH';
  public damageSlotIndex = 0;
  public cardInZonePlayer: ScenarioActor = 'PLAYER_2';
  public cardInZoneName: ScenarioCardInZoneName = 'discard';
  public cardInZoneSlotIndex = 0;
  public cardInZoneCardName = '';
  public showRawResult = false;
  public showTerminalHelp = false;
  public resultKind: ScenarioResultKind = 'idle';
  public resultSummary = '';
  public rawResult = '';
  public readonly scopeOptions: ScenarioScope[] = ['board', 'full', 'player', 'active', 'bench'];
  public readonly actorOptions: ScenarioActor[] = ['PLAYER_1', 'PLAYER_2'];
  private destroyRef = inject(DestroyRef);

  constructor(
    private cardsBaseService: CardsBaseService,
    private gameService: GameService,
    private sandboxDialogService: ScenarioSandboxEditorDialogService,
    private sessionService: SessionService,
    private testingService: TestingService,
    private translate: TranslateService
  ) {}

  public ngOnInit(): void {
    this.formats = [
      ...this.cardsBaseService.getAllFormats(),
      {
        name: '',
        cards: [],
        rules: new Rules(),
        ranges: []
      }
    ];
    this.format = this.formats[0];

    this.sessionService.get(session => session.gameStates)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(gameStates => {
        this.localGameState = this.scenarioLocalId !== undefined
          ? gameStates.find(game => game.localId === this.scenarioLocalId)
          : undefined;
      });
  }

  public createScenario(): void {
    if (!this.format) {
      return;
    }

    this.loading = true;
    this.recycleScenarioRequest()
      .pipe(
        switchMap(() => this.testingService.createScenario(undefined, undefined, this.format.name)),
        switchMap(result => {
          this.scenarioId = result.scenarioId;
          this.resultKind = 'create';
          this.resultSummary = `${result.scenarioId} sandbox ready`;
          this.rawResult = JSON.stringify(result.state, null, 2);
          return this.gameService.join(result.scenarioId);
        }),
        catchError(error => this.handleRequestError(error)),
        finalize(() => { this.loading = false; }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(localGameState => {
        this.scenarioLocalId = localGameState?.localId;
        this.localGameState = localGameState;
      });
  }

  public recycleScenario(): void {
    if (!this.scenarioId || this.loading) {
      return;
    }

    this.loading = true;
    this.recycleScenarioRequest()
      .pipe(
        catchError(error => this.handleRequestError(error)),
        finalize(() => { this.loading = false; }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.resultKind = 'patch';
        this.resultSummary = 'Sandbox recycled';
        this.rawResult = '';
      });
  }

  public toggleViewSide(): void {
    this.currentViewSide = this.currentViewSide === 'PLAYER_1' ? 'PLAYER_2' : 'PLAYER_1';
  }

  public openBoardStateEditor(): void {
    const state = this.localGameState?.state;
    if (!state) {
      return;
    }

    const data: ScenarioBoardStateEditorDialogData = {
      title: this.translate.instant('SCENARIO_EDITOR_STATE_TITLE'),
      phase: state.phase,
      turn: state.turn,
      activePlayer: state.activePlayer,
      winner: state.winner,
      clearPrompts: false,
      markers: {
        PLAYER_1: this.getPlayerMarkers('PLAYER_1'),
        PLAYER_2: this.getPlayerMarkers('PLAYER_2')
      }
    };

    this.sandboxDialogService.openBoardStateEditorAsPatchOperations(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(operations => this.applyPatchOperations(operations, 'Board state updated'));
  }

  public openZoneEditorFromBoard(event: BoardSandboxZoneEditEvent): void {
    this.openZoneEditor({
      side: event.side,
      zone: event.zone,
      index: event.index
    });
  }

  public openPokemonSlotEditorFromBoard(event: BoardSandboxSlotEditEvent): void {
    this.openPokemonSlotEditor({
      side: event.side,
      slot: event.slot,
      index: event.index
    });
  }

  public openHandEditor(side: ScenarioActor): void {
    this.openZoneEditor({ side, zone: 'hand' });
  }

  public exportScenario(): void {
    if (!this.scenarioId) {
      return;
    }

    this.loading = true;
    this.testingService.scenarioExport(this.scenarioId, this.exportScope, this.requiresScopedPlayer(this.exportScope) ? this.exportPlayer : undefined)
      .pipe(
        catchError(error => this.handleRequestError(error)),
        finalize(() => { this.loading = false; }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result: ScenarioExportResponse) => {
        this.resultKind = 'export';
        this.resultSummary = `Exported ${this.exportScope}`;
        this.rawResult = JSON.stringify(result.state, null, 2);
      });
  }

  public runAssertTemplate(): void {
    if (!this.scenarioId) {
      return;
    }

    const checks = this.buildAssertChecks();
    this.loading = true;
    this.testingService.scenarioAssert(this.scenarioId, checks)
      .pipe(
        catchError(error => this.handleRequestError(error)),
        finalize(() => { this.loading = false; }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result: ScenarioAssertResponse) => {
        this.resultKind = 'assert';
        this.resultSummary = result.result.summary;
        this.rawResult = JSON.stringify(result.result, null, 2);
      });
  }

  public hasSandboxState(): boolean {
    return !!this.localGameState?.state && !!this.scenarioId;
  }

  public get pendingPrompts(): Prompt<any>[] {
    return (this.localGameState?.state?.prompts || []).filter(prompt => prompt.result === undefined);
  }

  public get topPlayer(): Player | undefined {
    const state = this.localGameState?.state;
    if (!state || state.players.length < 2) {
      return undefined;
    }

    return this.currentViewSide === 'PLAYER_1' ? state.players[1] : state.players[0];
  }

  public get bottomPlayer(): Player | undefined {
    const state = this.localGameState?.state;
    if (!state || state.players.length < 2) {
      return undefined;
    }

    return this.currentViewSide === 'PLAYER_1' ? state.players[0] : state.players[1];
  }

  public get boardClientId(): number {
    return this.bottomPlayer?.id || 0;
  }

  public get topPlayerSide(): ScenarioActor {
    return this.currentViewSide === 'PLAYER_1' ? 'PLAYER_2' : 'PLAYER_1';
  }

  public get bottomPlayerSide(): ScenarioActor {
    return this.currentViewSide;
  }

  public getPlayerState(side: ScenarioActor): Player | undefined {
    const state = this.localGameState?.state;
    if (!state || state.players.length < 2) {
      return undefined;
    }

    return side === 'PLAYER_1' ? state.players[0] : state.players[1];
  }

  public getZoneCount(side: ScenarioActor, zone: 'hand' | 'deck' | 'discard' | 'lostzone' | 'stadium' | 'supporter'): number {
    const player = this.getPlayerState(side);
    if (!player) {
      return 0;
    }

    return player[zone].cards.length;
  }

  public getPrizeCount(side: ScenarioActor): number {
    const player = this.getPlayerState(side);
    if (!player) {
      return 0;
    }

    return player.prizes.reduce((count, prize) => count + prize.cards.length, 0);
  }

  public openZoneEditor(intent: ScenarioZoneEditIntent): void {
    const player = this.getPlayerState(intent.side);
    if (!player) {
      return;
    }

    const data: ScenarioZoneEditorDialogData = {
      title: this.buildZoneTitle(intent.side, intent.zone, intent.index),
      target: {
        player: intent.side,
        zone: intent.zone,
        slotIndex: intent.zone === 'prize' ? intent.index : undefined
      },
      cards: this.getZoneCards(player, intent.zone, intent.index)
    };

    this.sandboxDialogService.openZoneEditorAsPatchOperations(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(operations => this.applyPatchOperations(operations, `${data.title} updated`));
  }

  private openPokemonSlotEditor(intent: ScenarioPokemonSlotEditIntent): void {
    const player = this.getPlayerState(intent.side);
    if (!player) {
      return;
    }

    const slot = intent.slot === 'ACTIVE'
      ? player.active
      : player.bench[intent.index];
    if (!slot) {
      return;
    }

    const data: ScenarioPokemonSlotEditorDialogData = {
      title: this.buildSlotTitle(intent.side, intent.slot, intent.index),
      target: {
        player: intent.side,
        slot: intent.slot,
        index: intent.index
      },
      damage: slot.damage,
      conditions: slot.specialConditions.map(condition => SpecialCondition[condition]) as any,
      pokemons: slot.pokemons.cards.map(card => card.fullName),
      energies: slot.energies.cards.map(card => card.fullName),
      trainers: slot.trainers.cards.map(card => card.fullName)
    };

    this.sandboxDialogService.openPokemonSlotEditorAsPatchOperations(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(operations => this.applyPatchOperations(operations, `${data.title} updated`));
  }

  private applyPatchOperations(operations: ScenarioPatchOperation[] | undefined, summary: string): void {
    if (!this.scenarioId || !operations || operations.length === 0) {
      return;
    }

    this.loading = true;
    this.testingService.scenarioPatch(this.scenarioId, operations)
      .pipe(
        catchError(error => this.handleRequestError(error)),
        finalize(() => { this.loading = false; }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(result => {
        this.resultKind = 'patch';
        this.resultSummary = summary;
        this.rawResult = JSON.stringify(result.state, null, 2);
      });
  }

  private recycleScenarioRequest() {
    if (!this.scenarioId) {
      return of(undefined);
    }

    const scenarioId = this.scenarioId;
    const scenarioLocalId = this.scenarioLocalId;
    return this.testingService.deleteScenario(scenarioId).pipe(
      switchMap(() => {
        this.gameService.removeGameState(scenarioId);
        if (scenarioLocalId !== undefined) {
          this.gameService.removeLocalGameState(scenarioLocalId);
        }
        this.scenarioId = undefined;
        this.scenarioLocalId = undefined;
        this.localGameState = undefined;
        return of(undefined);
      })
    );
  }

  private buildAssertChecks(): ScenarioAssertCheck[] {
    switch (this.assertTemplate) {
      case 'damage':
        return [{
          type: 'damage',
          player: this.damagePlayer,
          slot: this.damageSlot,
          slotIndex: this.damageSlot === 'BENCH' ? this.damageSlotIndex : undefined,
          expected: this.damageExpected
        }];
      case 'cardInZone':
        return [{
          type: 'cardInZone',
          player: this.cardInZonePlayer,
          zone: this.cardInZoneName,
          slotIndex: this.cardInZoneName === 'prize' || this.cardInZoneName.startsWith('bench.')
            ? this.cardInZoneSlotIndex
            : undefined,
          cardName: this.cardInZoneCardName.trim()
        }];
      case 'promptPending':
      default:
        return [{
          type: 'promptPending',
          expected: this.promptPendingExpected
        }];
    }
  }

  private getZoneCards(
    player: Player,
    zone: ScenarioZoneEditIntent['zone'],
    index?: number
  ): string[] {
    if (zone === 'prize') {
      return (player.prizes[index || 0]?.cards || []).map(card => card.fullName);
    }

    return player[zone].cards.map(card => card.fullName);
  }

  private buildZoneTitle(side: ScenarioActor, zone: string, index?: number): string {
    const suffix = zone === 'prize' && index !== undefined ? ` #${index + 1}` : '';
    return `${side} ${this.translate.instant(this.getZoneLabelKey(zone))}${suffix}`;
  }

  private buildSlotTitle(side: ScenarioActor, slot: string, index: number): string {
    const suffix = slot === 'BENCH' ? ` #${index + 1}` : '';
    return `${side} ${this.translate.instant(this.getSlotLabelKey(slot))}${suffix}`;
  }

  public requiresScopedPlayer(scope: ScenarioScope): boolean {
    return scope === 'player' || scope === 'active' || scope === 'bench';
  }

  private getPlayerMarkers(side: ScenarioActor) {
    const player = this.getPlayerState(side);
    return {
      energyPlayedTurn: player?.energyPlayedTurn || 0,
      retreatedTurn: player?.retreatedTurn || 0,
      stadiumPlayedTurn: player?.stadiumPlayedTurn || 0,
      stadiumUsedTurn: player?.stadiumUsedTurn || 0
    };
  }

  public getZoneLabelKey(zone: string): string {
    switch (zone) {
      case 'deck':
        return 'SCENARIO_ZONE_DECK';
      case 'hand':
        return 'SCENARIO_ZONE_HAND';
      case 'discard':
        return 'SCENARIO_ZONE_DISCARD';
      case 'lostzone':
        return 'SCENARIO_ZONE_LOSTZONE';
      case 'prize':
        return 'SCENARIO_ZONE_PRIZE';
      case 'stadium':
        return 'SCENARIO_ZONE_STADIUM';
      case 'supporter':
        return 'SCENARIO_ZONE_SUPPORTER';
      case 'active.pokemons':
      case 'active.energies':
      case 'active.trainers':
        return 'SCENARIO_ZONE_ACTIVE';
      case 'bench.pokemons':
      case 'bench.energies':
      case 'bench.trainers':
        return 'SCENARIO_ZONE_BENCH';
      default:
        return 'SCENARIO_EDITOR_CARD_TITLE';
    }
  }

  public getSlotLabelKey(slot: string): string {
    return slot === 'ACTIVE' ? 'SCENARIO_ZONE_ACTIVE' : 'SCENARIO_ZONE_BENCH';
  }

  private handleRequestError(error: unknown) {
    const responseError = error as { error?: unknown; message?: string };
    this.resultKind = 'idle';
    this.resultSummary = 'Request failed';
    this.rawResult = JSON.stringify(responseError?.error ?? responseError ?? { message: 'Request failed' }, null, 2);
    return EMPTY;
  }
}
