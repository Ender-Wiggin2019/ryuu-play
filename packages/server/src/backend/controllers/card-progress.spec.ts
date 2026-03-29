import { Application, Request, Response } from 'express';

import { CardProgress } from './card-progress';
import { Core } from '../../game/core/core';
import { Storage } from '../../storage';
import { PokemonProgressTracker } from '../services/pokemon-progress-tracker';

describe('CardProgress', () => {
  let controller: CardProgress;
  let req: Request;
  let res: jasmine.SpyObj<Response>;
  let app: jasmine.SpyObj<Application>;
  let db: jasmine.SpyObj<Storage>;
  let core: jasmine.SpyObj<Core>;
  let tracker: jasmine.SpyObj<PokemonProgressTracker>;

  beforeEach(() => {
    req = { query: {}, body: {} } as Request;
    res = jasmine.createSpyObj('Response', ['send', 'status']);
    res.status.and.returnValue(res);
    app = jasmine.createSpyObj('Application', ['get', 'post']);
    db = jasmine.createSpyObj('Storage', ['connect']);
    core = jasmine.createSpyObj('Core', ['connect', 'disconnect']);
    tracker = jasmine.createSpyObj<PokemonProgressTracker>('PokemonProgressTracker', [
      'getSummary',
      'getCsvPath',
      'list',
      'getNext',
      'update',
      'regenerate'
    ]);

    controller = new CardProgress('/v1/card-progress', app, db, core, tracker);
  });

  it('returns pokemon summary', async () => {
    tracker.getSummary.and.returnValue({
      total: 10,
      csvPath: '/tmp/set-f.csv',
      byMark: { H: 4 },
      byImplementationStatus: { todo: 7 },
      byBackendStatus: { todo: 7 },
      byUiStatus: { todo: 3 },
      byAiApiStatus: { review: 2 }
    });

    await controller.onPokemonSummary(req, res);

    expect(res.send).toHaveBeenCalledWith({
      ok: true,
      summary: jasmine.objectContaining({ total: 10 })
    });
  });

  it('rejects update when no row key is provided', async () => {
    req.body = {};

    await controller.onPokemonUpdate(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      ok: false,
      error: 'Missing trackingKey or yorenCode.'
    });
  });

  it('updates a pokemon progress row', async () => {
    tracker.getCsvPath.and.returnValue('/tmp/set-f.csv');
    tracker.update.and.returnValue({
      phase_mark: 'H',
      source_marks: 'H',
      tracking_key: 'Y1459',
      yoren_code: 'Y1459',
      name_zh: '多龙巴鲁托ex',
      attribute: '龙',
      stage: '2阶进化',
      hp: '320',
      deck_rule_limit: '4',
      special_rules: 'POKEMON_EX',
      interaction_flags: 'DAMAGE_COUNTERS',
      complexity: 'high',
      source_variant_count: '2',
      collection_numbers: '159/207|229/207',
      implemented_in_repo: 'yes',
      implementation_status: 'in_progress',
      backend_status: 'in_progress',
      ui_status: 'todo',
      ai_api_status: 'todo',
      implemented_file: '',
      test_file: '',
      notes: 'Implement phantom dive prompt'
    });
    req.body = {
      trackingKey: 'Y1459',
      implementationStatus: 'in_progress',
      backendStatus: 'in_progress',
      notes: 'Implement phantom dive prompt'
    };

    await controller.onPokemonUpdate(req, res);

    expect(tracker.update).toHaveBeenCalledWith(
      { trackingKey: 'Y1459', yorenCode: undefined },
      jasmine.objectContaining({
        implementation_status: 'in_progress',
        backend_status: 'in_progress',
        notes: 'Implement phantom dive prompt'
      })
    );
    expect(res.send).toHaveBeenCalledWith(jasmine.objectContaining({ ok: true }));
  });
});
