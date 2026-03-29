import { Injectable } from '@angular/core';

import { ApiService } from '../api.service';
import {
  ScenarioActionPayload,
  ScenarioActionRequest,
  ScenarioActionResponse,
  ScenarioActor,
  ScenarioAssertCheck,
  ScenarioAssertResponse,
  ScenarioCreateResponse,
  ScenarioDeleteResponse,
  ScenarioExportResponse,
  ScenarioJsonValue,
  ScenarioPatchOperation,
  ScenarioPatchRequest,
  ScenarioPatchResponse,
  ScenarioResolvePromptRequest,
  ScenarioResolvePromptResponse,
  ScenarioScope,
  ScenarioStateResponse,
  TestingCreateResponse
} from '../interfaces/testing.interface';

@Injectable()
export class TestingService {

  constructor(
    private api: ApiService,
  ) {}

  public createGame(playerDeckId: number, botDeckId: number, formatName: string, clientId?: number) {
    return this.api.post<TestingCreateResponse>('/v1/testing/create', {
      playerDeckId,
      botDeckId,
      formatName,
      clientId
    });
  }

  public createScenario(playerDeckId: number | undefined, botDeckId: number | undefined, formatName: string) {
    return this.api.post<ScenarioCreateResponse>('/v1/testing/scenario/create', {
      playerDeckId,
      botDeckId,
      formatName
    });
  }

  public getScenarioState(scenarioId: number) {
    return this.api.get<ScenarioStateResponse>(`/v1/testing/scenario/${scenarioId}/state`);
  }

  public deleteScenario(scenarioId: number) {
    return this.api.post<ScenarioDeleteResponse>(`/v1/testing/scenario/${scenarioId}/delete`, {});
  }

  public scenarioAction<TPayload = ScenarioActionPayload>(
    scenarioId: number,
    actor: ScenarioActor,
    actionType: string,
    payload?: TPayload
  ) {
    const request: ScenarioActionRequest<TPayload> = {
      actor,
      actionType,
      payload: (payload ?? {}) as TPayload
    };

    return this.api.post<ScenarioActionResponse>(`/v1/testing/scenario/${scenarioId}/action`, request);
  }

  public scenarioResolvePrompt<TResult = ScenarioJsonValue>(
    scenarioId: number,
    actor: ScenarioActor,
    promptId: number,
    result: TResult
  ) {
    const request: ScenarioResolvePromptRequest<TResult> = {
      actor,
      promptId,
      result
    };

    return this.api.post<ScenarioResolvePromptResponse>(`/v1/testing/scenario/${scenarioId}/prompt/resolve`, request);
  }

  public scenarioPatch(scenarioId: number, operations: ScenarioPatchOperation[]) {
    const request: ScenarioPatchRequest = {
      operations
    };

    return this.api.post<ScenarioPatchResponse>(`/v1/testing/scenario/${scenarioId}/patch`, request);
  }

  public scenarioExport(scenarioId: number, scope: ScenarioScope, player?: ScenarioActor) {
    return this.api.post<ScenarioExportResponse>('/v1/testing/scenario/' + scenarioId + '/export', {
      scope,
      player
    });
  }

  public scenarioAssert(scenarioId: number, checks: ScenarioAssertCheck[]) {
    return this.api.post<ScenarioAssertResponse>('/v1/testing/scenario/' + scenarioId + '/assert', {
      checks
    });
  }
}
