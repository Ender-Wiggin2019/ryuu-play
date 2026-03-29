const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const datasetRoot = process.env.PTCG_CHS_DATASET_ROOT || '/Users/easygod/code/PTCG-CHS-Datasets';
const sqliteModulePath = path.join(datasetRoot, 'node_modules', 'better-sqlite3');
const Database = require(sqliteModulePath);

const datasetDbPath = path.join(datasetRoot, 'data', 'ptcg.sqlite');
const outputDir = path.join(repoRoot, 'tracking');
const outputPath = path.join(outputDir, 'set-f-pokemon-progress.csv');
const setsRoot = path.join(repoRoot, 'packages', 'sets', 'src', 'standard');
const testsRoot = path.join(repoRoot, 'packages', 'sets', 'tests', 'standard');

const HEADERS = [
  'phase_mark',
  'source_marks',
  'tracking_key',
  'yoren_code',
  'name_zh',
  'attribute',
  'stage',
  'hp',
  'deck_rule_limit',
  'special_rules',
  'interaction_flags',
  'complexity',
  'source_variant_count',
  'collection_numbers',
  'implemented_in_repo',
  'implementation_status',
  'backend_status',
  'ui_status',
  'ai_api_status',
  'implemented_file',
  'test_file',
  'notes'
];

const EDITABLE_COLUMNS = new Set([
  'implementation_status',
  'backend_status',
  'ui_status',
  'ai_api_status',
  'implemented_file',
  'test_file',
  'notes'
]);

function getMarkRank(mark) {
  switch (mark) {
    case 'H':
      return 3;
    case 'G':
      return 2;
    case 'F':
      return 1;
    default:
      return 0;
  }
}

function normalizeText(value) {
  return String(value || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildTrackingKey(row) {
  if (row.yoren_code) {
    return row.yoren_code;
  }

  return [
    'fallback',
    row.regulation_mark,
    row.name,
    row.attribute_label || '',
    row.hp || '',
    row.evolve_text || '',
    normalizeText(row.rule_text),
    row.id
  ].join(':');
}

function compareRows(left, right) {
  const markDiff = getMarkRank(right.regulation_mark) - getMarkRank(left.regulation_mark);
  if (markDiff !== 0) {
    return markDiff;
  }

  const collectionDiff = (right.collection_number_numeric ?? -1) - (left.collection_number_numeric ?? -1);
  if (collectionDiff !== 0) {
    return collectionDiff;
  }

  return right.id - left.id;
}

function parseSpecialRules(rows) {
  const flags = new Set();

  rows.forEach(row => {
    const name = row.name || '';
    const text = normalizeText([row.search_text, row.rule_text].filter(Boolean).join(' '));

    if (name.endsWith('ex')) {
      flags.add('POKEMON_EX');
    }
    if (name.endsWith('VSTAR')) {
      flags.add('VSTAR');
    } else if (name.endsWith('VMAX')) {
      flags.add('VMAX');
    } else if (name.endsWith('V')) {
      flags.add('V');
    }
    if (name.includes('光辉')) {
      flags.add('RADIANT');
    }
    if (row.special_card_label === '太晶') {
      flags.add('TERA');
    }
    if (row.special_card_label === '古代') {
      flags.add('ANCIENT');
    }
    if (row.special_card_label === '未来') {
      flags.add('FUTURE');
    }
    if (text.includes('ACE SPEC')) {
      flags.add('ACE_SPEC');
    }
    if (text.includes('拥有规则')) {
      flags.add('RULE_BOX');
    }
  });

  return Array.from(flags);
}

function parseInteractionFlags(rows) {
  const flags = new Set();
  const text = normalizeText(rows.map(row => [row.search_text, row.rule_text].filter(Boolean).join(' ')).join(' '));

  if (/选择/.test(text) && /宝可梦/.test(text)) {
    flags.add('SELECT_POKEMON');
  }
  if (/选择/.test(text) && /能量/.test(text)) {
    flags.add('SELECT_ENERGY');
  }
  if (/选择/.test(text)) {
    flags.add('SELECT_CARD');
  }
  if (/抛掷/.test(text)) {
    flags.add('COIN_FLIP');
  }
  if (/伤害指示物/.test(text)) {
    flags.add('DAMAGE_COUNTERS');
  }
  if (/附着/.test(text)) {
    flags.add('ATTACH_ENERGY');
  }
  if (/丢弃/.test(text) && /能量/.test(text)) {
    flags.add('DISCARD_ENERGY');
  }
  if (/互换|替换|换到/.test(text)) {
    flags.add('SWITCH');
  }
  if (/麻痹|中毒|睡眠|混乱|灼伤/.test(text)) {
    flags.add('SPECIAL_CONDITION');
  }
  if (/从牌库|查看.*牌库|重洗牌库|从弃牌区|加入手牌|放回牌库/.test(text)) {
    flags.add('SEARCH_OR_RECOVERY');
  }

  return Array.from(flags);
}

function getComplexity(specialRules, interactionFlags) {
  let score = interactionFlags.length;

  if (specialRules.some(rule => ['TERA', 'VSTAR', 'VMAX', 'RADIANT', 'ACE_SPEC'].includes(rule))) {
    score += 2;
  }

  if (specialRules.some(rule => ['POKEMON_EX', 'V', 'ANCIENT', 'FUTURE'].includes(rule))) {
    score += 1;
  }

  if (score >= 5) {
    return 'high';
  }
  if (score >= 2) {
    return 'medium';
  }
  return 'low';
}

function needsUiSupport(interactionFlags, specialRules) {
  return interactionFlags.length > 0
    || specialRules.some(rule => ['TERA', 'VSTAR', 'VMAX', 'RADIANT', 'ACE_SPEC'].includes(rule));
}

function needsAiApiSupport(interactionFlags, specialRules) {
  return needsUiSupport(interactionFlags, specialRules)
    || specialRules.some(rule => ['POKEMON_EX', 'V', 'ANCIENT', 'FUTURE'].includes(rule));
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }
    return [fullPath];
  });
}

function relativeRepoPath(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function collectImplementedCards() {
  const implemented = new Map();
  const setDirs = ['set_f', 'set_g', 'set_h'];

  setDirs.forEach(setDir => {
    const sourceDir = path.join(setsRoot, setDir);
    walkFiles(sourceDir)
      .filter(filePath => filePath.endsWith('.ts'))
      .filter(filePath => !filePath.endsWith('/index.ts'))
      .filter(filePath => !filePath.endsWith('/cards.generated.ts'))
      .forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/yorenCode:\s*'([^']+)'/);
        if (!match) {
          return;
        }

        const yorenCode = match[1];
        const testPath = path.join(
          testsRoot,
          setDir,
          path.basename(filePath).replace(/\.ts$/, '.spec.ts')
        );

        implemented.set(yorenCode, {
          implementedFile: relativeRepoPath(filePath),
          testFile: fs.existsSync(testPath) ? relativeRepoPath(testPath) : ''
        });
      });
  });

  return implemented;
}

function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (insideQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      insideQuotes = true;
    } else if (char === ',') {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

function loadExistingEditableFields() {
  if (!fs.existsSync(outputPath)) {
    return new Map();
  }

  const content = fs.readFileSync(outputPath, 'utf8').trim();
  if (content === '') {
    return new Map();
  }

  const lines = content.split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);
  const rows = new Map();

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      continue;
    }

    const values = parseCsvLine(lines[i]);
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });

    const editable = {};
    EDITABLE_COLUMNS.forEach(column => {
      editable[column] = record[column] || '';
    });

    rows.set(record.tracking_key, editable);
  }

  return rows;
}

function csvEscape(value) {
  const sanitized = String(value ?? '').replace(/\r?\n/g, ' ').trim();
  if (sanitized.includes(',') || sanitized.includes('"')) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
}

function buildDefaultStatuses({ implemented, uiNeeded, apiNeeded }) {
  if (implemented) {
    return {
      implementation_status: 'implemented',
      backend_status: 'implemented',
      ui_status: uiNeeded ? 'review' : 'not_needed',
      ai_api_status: apiNeeded ? 'review' : 'not_needed'
    };
  }

  return {
    implementation_status: 'todo',
    backend_status: 'todo',
    ui_status: uiNeeded ? 'todo' : 'not_needed',
    ai_api_status: apiNeeded ? 'todo' : 'not_needed'
  };
}

function main() {
  const db = new Database(datasetDbPath, { readonly: true });
  const existingEditableFields = loadExistingEditableFields();
  const implementedCards = collectImplementedCards();

  const rows = db.prepare(`
    SELECT
      id,
      name,
      yoren_code,
      regulation_mark,
      collection_number,
      collection_number_numeric,
      attribute_label,
      hp,
      evolve_text,
      rule_text,
      search_text,
      special_card_label,
      deck_rule_limit
    FROM cards
    WHERE regulation_mark IN ('F', 'G', 'H')
      AND card_type_label = '宝可梦'
    ORDER BY name
  `).all();

  const grouped = new Map();
  rows.forEach(row => {
    const trackingKey = buildTrackingKey(row);
    const group = grouped.get(trackingKey) || [];
    group.push(row);
    grouped.set(trackingKey, group);
  });

  const records = Array.from(grouped.entries()).map(([trackingKey, groupRows]) => {
    const sortedRows = groupRows.slice().sort(compareRows);
    const primaryRow = sortedRows[0];
    const sourceMarks = Array.from(new Set(sortedRows.map(row => row.regulation_mark)))
      .sort((left, right) => getMarkRank(right) - getMarkRank(left));
    const collectionNumbers = Array.from(new Set(sortedRows.map(row => row.collection_number)));
    const specialRules = parseSpecialRules(sortedRows);
    const interactionFlags = parseInteractionFlags(sortedRows);
    const implemented = primaryRow.yoren_code
      ? implementedCards.get(primaryRow.yoren_code)
      : undefined;
    const uiNeeded = needsUiSupport(interactionFlags, specialRules);
    const apiNeeded = needsAiApiSupport(interactionFlags, specialRules);
    const defaultStatuses = buildDefaultStatuses({
      implemented: !!implemented,
      uiNeeded,
      apiNeeded
    });
    const editableFields = existingEditableFields.get(trackingKey) || {};

    return {
      phase_mark: sourceMarks[0],
      source_marks: sourceMarks.join('|'),
      tracking_key: trackingKey,
      yoren_code: primaryRow.yoren_code || '',
      name_zh: primaryRow.name,
      attribute: primaryRow.attribute_label || '',
      stage: primaryRow.evolve_text || '',
      hp: primaryRow.hp || '',
      deck_rule_limit: primaryRow.deck_rule_limit || '',
      special_rules: specialRules.join('|'),
      interaction_flags: interactionFlags.join('|'),
      complexity: getComplexity(specialRules, interactionFlags),
      source_variant_count: sortedRows.length,
      collection_numbers: collectionNumbers.join('|'),
      implemented_in_repo: implemented ? 'yes' : 'no',
      implementation_status: editableFields.implementation_status || defaultStatuses.implementation_status,
      backend_status: editableFields.backend_status || defaultStatuses.backend_status,
      ui_status: editableFields.ui_status || defaultStatuses.ui_status,
      ai_api_status: editableFields.ai_api_status || defaultStatuses.ai_api_status,
      implemented_file: editableFields.implemented_file || implemented?.implementedFile || '',
      test_file: editableFields.test_file || implemented?.testFile || '',
      notes: editableFields.notes || ''
    };
  });

  records.sort((left, right) => {
    const markDiff = getMarkRank(right.phase_mark) - getMarkRank(left.phase_mark);
    if (markDiff !== 0) {
      return markDiff;
    }

    const implementedDiff = Number(left.implemented_in_repo === 'yes') - Number(right.implemented_in_repo === 'yes');
    if (implementedDiff !== 0) {
      return implementedDiff;
    }

    return left.name_zh.localeCompare(right.name_zh, 'zh-Hans-CN');
  });

  const lines = [
    HEADERS.join(','),
    ...records.map(record => HEADERS.map(header => csvEscape(record[header])).join(','))
  ];

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, lines.join('\n') + '\n');

  const summary = records.reduce((acc, record) => {
    acc.total += 1;
    acc.byMark[record.phase_mark] = (acc.byMark[record.phase_mark] || 0) + 1;
    acc.byStatus[record.implementation_status] = (acc.byStatus[record.implementation_status] || 0) + 1;
    return acc;
  }, {
    total: 0,
    byMark: {},
    byStatus: {}
  });

  console.log(JSON.stringify({
    outputPath,
    totalRows: records.length,
    summary
  }, null, 2));
}

main();
