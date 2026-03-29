import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { PokemonProgressTracker } from './pokemon-progress-tracker';

describe('PokemonProgressTracker', () => {
  let tempDir: string;
  let tracker: PokemonProgressTracker;
  let csvPath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pokemon-progress-'));
    csvPath = path.join(tempDir, 'tracking', 'set-f-pokemon-progress.csv');
    fs.mkdirSync(path.dirname(csvPath), { recursive: true });
    fs.writeFileSync(csvPath, [
      'phase_mark,source_marks,tracking_key,yoren_code,name_zh,attribute,stage,hp,deck_rule_limit,special_rules,interaction_flags,complexity,source_variant_count,collection_numbers,implemented_in_repo,implementation_status,backend_status,ui_status,ai_api_status,implemented_file,test_file,notes',
      'H,H,Y1459,Y1459,多龙巴鲁托ex,龙,2阶进化,320,4,POKEMON_EX,SELECT_POKEMON|DAMAGE_COUNTERS,high,2,159/207|229/207,yes,implemented,implemented,review,review,packages/sets/src/standard/set_h/dragapult-ex.ts,packages/sets/tests/standard/set_h/dragapult-ex.spec.ts,',
      'H,H,Y1399,Y1399,猛雷鼓ex,雷,基础,240,2,POKEMON_EX,SELECT_CARD|DISCARD_ENERGY,medium,1,154/204,no,todo,todo,todo,todo,,,',
      'G,G,Y1300,Y1300,赛富豪ex,钢,基础,260,2,POKEMON_EX,,low,1,139/182,yes,implemented,implemented,not_needed,review,packages/sets/src/standard/set_g/gholdengo-ex.ts,,'
    ].join('\n') + '\n');
    tracker = new PokemonProgressTracker(tempDir);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('lists rows with filters', () => {
    const result = tracker.list({
      phaseMark: 'H',
      implementationStatus: 'todo'
    });

    expect(result.total).toBe(1);
    expect(result.items[0].name_zh).toBe('猛雷鼓ex');
  });

  it('returns the next pending row in csv order', () => {
    const item = tracker.getNext();

    expect(item).toBeDefined();
    expect(item?.tracking_key).toBe('Y1399');
  });

  it('updates editable fields and persists them', () => {
    const updated = tracker.update(
      { trackingKey: 'Y1399' },
      {
        implementation_status: 'in_progress',
        notes: 'Start with attack prompts'
      }
    );

    const reloaded = tracker.list({ search: 'Y1399' }).items[0];

    expect(updated.implementation_status).toBe('in_progress');
    expect(reloaded.notes).toBe('Start with attack prompts');
  });
});
