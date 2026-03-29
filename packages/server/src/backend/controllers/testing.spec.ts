import { Application, Request, Response } from 'express';
import { CardManager, ResolvePromptAction } from '@ptcg/common';

import { Testing } from './testing';
import { BotManager } from '../../game/bots/bot-manager';
import { Core } from '../../game/core/core';
import { Storage, Deck, User } from '../../storage';
import { generateToken } from '../services/auth-token';

describe('Testing', () => {
  let controller: Testing;
  let req: Request;
  let res: jasmine.SpyObj<Response>;
  let app: jasmine.SpyObj<Application>;
  let db: jasmine.SpyObj<Storage>;
  let core: Core;

  beforeEach(() => {
    req = {
      body: { playerDeckId: 10, botDeckId: 11, formatName: 'Standard' },
      header: jasmine.createSpy('header').and.returnValue(generateToken(1)),
      ip: '127.0.0.1'
    } as any as Request;
    res = jasmine.createSpyObj('Response', ['send', 'status']);
    res.status.and.returnValue(res);
    app = jasmine.createSpyObj('Application', ['get', 'post']);
    db = jasmine.createSpyObj('Storage', ['connect']);
    core = {
      clients: [],
      createGame: jasmine.createSpy('createGame')
    } as any as Core;
    controller = new Testing('/v1/testing', app, db, core);

    spyOn(User, 'findOneById').and.resolveTo({ id: 1 } as User);
    spyOn(Deck, 'findOne').and.callFake(async (options: any) => {
      const id = options.where.id;
      return {
        id,
        user: { id: 1 },
        cards: JSON.stringify(['Card A']),
        formatNames: JSON.stringify(['Standard'])
      } as any;
    });
    spyOn(CardManager, 'getInstance').and.returnValue({
      isCardDefined: () => true,
      getAllFormats: () => []
    } as any);
  });

  it('creates a testing game and auto-resolves the bot invite', async () => {
    const bot = {
      id: 9,
      user: { id: 99 }
    } as any;
    spyOn(BotManager, 'getInstance').and.returnValue({
      getBot: () => bot
    } as any);
    (core.clients as any) = [{ user: { id: 1 } }];

    const dispatch = jasmine.createSpy('dispatch');
    (core.createGame as jasmine.Spy).and.returnValue({
      id: 123,
      state: {
        prompts: [{ id: 77, playerId: 9, result: undefined }]
      },
      dispatch
    } as any);

    await controller.onCreate(req, res);

    expect(core.createGame as jasmine.Spy).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalled();
    const action = dispatch.calls.mostRecent().args[1] as ResolvePromptAction;
    expect(action).toEqual(jasmine.any(ResolvePromptAction));
    expect(res.send).toHaveBeenCalledWith(jasmine.objectContaining({
      ok: true,
      gameId: 123,
      botUserId: 99
    }));
  });

  it('rejects decks outside the requested format', async () => {
    (Deck.findOne as jasmine.Spy).and.callFake(async (options: any) => {
      const id = options.where.id;
      return {
        id,
        user: { id: 1 },
        cards: JSON.stringify(['Card A']),
        formatNames: JSON.stringify(id === 10 ? ['Standard'] : ['Expanded'])
      } as any;
    });

    await controller.onCreate(req, res);

    expect(core.createGame as jasmine.Spy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: 'ERROR_DECK_INVALID' });
  });

  it('creates a scenario game', async () => {
    const scenarioService = {
      createScenario: jasmine.createSpy('createScenario').and.returnValue({
        scenarioId: 321,
        player1Id: 1001,
        player2Id: 1002,
        state: { turn: 1 }
      })
    };
    (controller as any).scenarioLab = scenarioService;
    (core.clients as any) = [{ id: 5, user: { id: 1 } }];

    await (controller as any).onCreateScenario(req, res);

    expect(scenarioService.createScenario).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(jasmine.objectContaining({
      ok: true,
      scenarioId: 321,
      player1Id: 1001,
      player2Id: 1002
    }));
  });

  it('returns scenario state', async () => {
    const scenarioService = {
      getScenarioState: jasmine.createSpy('getScenarioState').and.returnValue({ turn: 3 })
    };
    (controller as any).scenarioLab = scenarioService;
    (req as any).params = { id: '321' };

    await (controller as any).onGetScenarioState(req, res);

    expect(scenarioService.getScenarioState).toHaveBeenCalledWith(321);
    expect(res.send).toHaveBeenCalledWith({
      ok: true,
      scenarioId: 321,
      state: { turn: 3 }
    });
  });

  it('dispatches a scenario action', async () => {
    const scenarioService = {
      dispatchAction: jasmine.createSpy('dispatchAction')
    };
    (controller as any).scenarioLab = scenarioService;
    (req as any).params = { id: '321' };
    req.body = {
      actor: 'PLAYER_1',
      actionType: 'passTurn',
      payload: { ignored: true }
    };

    await (controller as any).onScenarioAction(req, res);

    expect(scenarioService.dispatchAction).toHaveBeenCalledWith(321, 'PLAYER_1', 'passTurn', { ignored: true });
    expect(res.send).toHaveBeenCalledWith({ ok: true });
  });

  it('applies a scenario patch and returns updated state', async () => {
    const state = { players: [], turn: 2 };
    const scenarioService = {
      applyPatch: jasmine.createSpy('applyPatch').and.returnValue(state)
    };
    (controller as any).scenarioLab = scenarioService;
    (req as any).params = { id: '321' };
    req.body = {
      operations: [{ op: 'setDamage', target: { player: 'PLAYER_1', slot: 'ACTIVE' }, damage: 40 }]
    };

    await (controller as any).onScenarioPatch(req, res);

    expect(scenarioService.applyPatch).toHaveBeenCalledWith(321, req.body.operations);
    expect(res.send).toHaveBeenCalledWith({ ok: true, state });
  });

  it('exports scenario state for a specific scope and player', async () => {
    const state = { player: 'PLAYER_2', active: { damage: 10 } };
    const scenarioService = {
      exportScenarioState: jasmine.createSpy('exportScenarioState').and.returnValue(state)
    };
    (controller as any).scenarioLab = scenarioService;
    (req as any).params = { id: '321' };
    req.body = {
      scope: 'active',
      player: 'PLAYER_2'
    };

    await (controller as any).onScenarioExport(req, res);

    expect(scenarioService.exportScenarioState).toHaveBeenCalledWith(321, 'active', 'PLAYER_2');
    expect(res.send).toHaveBeenCalledWith({ ok: true, scope: 'active', state });
  });

  it('asserts scenario state and returns aggregated result', async () => {
    const result = {
      passed: true,
      summary: 'All 1 checks passed',
      checks: [{ type: 'zoneCount', passed: true, message: 'zoneCount expected=1 actual=1' }]
    };
    const scenarioService = {
      assertState: jasmine.createSpy('assertState').and.returnValue(result)
    };
    (controller as any).scenarioLab = scenarioService;
    (req as any).params = { id: '321' };
    req.body = {
      checks: [{ type: 'zoneCount', player: 'PLAYER_1', zone: 'hand', expected: 1 }]
    };

    await (controller as any).onScenarioAssert(req, res);

    expect(scenarioService.assertState).toHaveBeenCalledWith(321, req.body.checks);
    expect(res.send).toHaveBeenCalledWith({ ok: true, result });
  });

  it('deletes a scenario game', async () => {
    const scenarioService = {
      deleteScenario: jasmine.createSpy('deleteScenario')
    };
    (controller as any).scenarioLab = scenarioService;
    (req as any).params = { id: '321' };

    await (controller as any).onDeleteScenario(req, res);

    expect(scenarioService.deleteScenario).toHaveBeenCalledWith(321);
    expect(res.send).toHaveBeenCalledWith({ ok: true, scenarioId: 321 });
  });
});
