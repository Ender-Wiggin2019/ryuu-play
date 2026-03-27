const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CSV_PATH = path.join(ROOT, 'tracking', 'fgh-pokemon-progress.csv');
const OUTPUT_PATH = path.join(ROOT, 'packages', 'sets', 'src', 'standard', 'set_h', 'simple-generated.ts');
const CARD_IMAGE_BASE_URL = process.env.PTCG_CARD_IMAGE_BASE_URL
  || 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev';
const CARD_IMAGE_MAP_PATH = path.join(ROOT, 'packages', 'sets', 'src', 'standard', 'card-image-r2.generated.ts');
const CARD_IMAGE_URLS_BY_ID = new Map(
  [...fs.readFileSync(CARD_IMAGE_MAP_PATH, 'utf8').matchAll(/\s(\d+): '([^']+)'/g)]
    .map(([, id, url]) => [Number(id), url])
);

const IMPLEMENTED_FILE = '/Users/easygod/code/ryuu-play/packages/sets/src/standard/set_h/simple-generated.ts';
const TEST_FILE = '/Users/easygod/code/ryuu-play/packages/sets/tests/standard/set_h/simple-generated.spec.ts';

const CARD_TYPE_MAP = {
  '草': 'CardType.GRASS',
  '火': 'CardType.FIRE',
  '水': 'CardType.WATER',
  '雷': 'CardType.LIGHTNING',
  '超': 'CardType.PSYCHIC',
  '斗': 'CardType.FIGHTING',
  '恶': 'CardType.DARK',
  '钢': 'CardType.METAL',
  '妖': 'CardType.FAIRY',
  '龙': 'CardType.DRAGON',
  '无色': 'CardType.COLORLESS',
  '无': 'CardType.COLORLESS',
};

const STAGE_MAP = {
  '基础': 'Stage.BASIC',
  '1阶进化': 'Stage.STAGE_1',
  '2阶进化': 'Stage.STAGE_2',
};

const TAG_MAP = {
  POKEMON_EX: 'CardTag.POKEMON_EX',
  POKEMON_V: 'CardTag.POKEMON_V',
  POKEMON_VSTAR: 'CardTag.POKEMON_VSTAR',
  RADIANT: 'CardTag.RADIANT',
  TERA: 'CardTag.TERA',
};

function parseCsv(content) {
  const lines = content.replace(/\r\n/g, '\n').trim().split('\n');
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = splitCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
}

function splitCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function escapeCsvValue(value) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${url} -> ${response.status}`);
  }
  return response.json();
}

function parseWeakness(value) {
  if (!value) {
    return [];
  }
  const match = value.match(/^(\S+)\s+[×x](\d+)$/);
  if (!match) {
    return [];
  }
  return [{ type: CARD_TYPE_MAP[match[1]] || 'CardType.COLORLESS' }];
}

function parseResistance(value) {
  if (!value) {
    return [];
  }
  const match = value.match(/^(\S+)\s+([+-]?\d+)$/);
  if (!match) {
    return [];
  }
  return [{ type: CARD_TYPE_MAP[match[1]] || 'CardType.COLORLESS', value: Number(match[2]) }];
}

function mapCosts(costs) {
  return (costs || []).map(cost => CARD_TYPE_MAP[cost] || 'CardType.COLORLESS');
}

function toPowerType(_featureText) {
  return 'PowerType.ABILITY';
}

function resolveCardImageUrl(detail) {
  const mappedUrl = CARD_IMAGE_URLS_BY_ID.get(detail.id);
  if (mappedUrl) {
    return mappedUrl;
  }

  if (detail.imageUrl) {
    return detail.imageUrl.startsWith('http')
      ? detail.imageUrl
      : `${CARD_IMAGE_BASE_URL}${detail.imageUrl}`;
  }

  return `${CARD_IMAGE_BASE_URL}/api/v1/cards/${detail.id}/image`;
}

async function resolveDetail(row) {
  const collectionNumber = row.collection_numbers.split('|')[0];
  const listUrl = new URL('http://localhost:3000/api/v1/cards');
  listUrl.searchParams.append('q', row.name_zh);
  listUrl.searchParams.append('regulationMark[]', 'H');
  listUrl.searchParams.append('pageSize', '60');

  const listResult = await fetchJson(listUrl);
  const candidates = listResult.items || [];
  const exact = candidates.find(card => card.collectionNumber === collectionNumber)
    || candidates[0];

  if (!exact) {
    throw new Error(`No card found for ${row.name_zh}`);
  }

  const detail = await fetchJson(`http://localhost:3000/api/v1/cards/${exact.id}`);
  if (detail.evolveText !== '基础') {
    return null;
  }

  return detail;
}

function isTrulySimple(detail) {
  const features = detail.features || [];
  const attacks = detail.attacks || [];
  if (features.length > 0) {
    return false;
  }
  return attacks.every(attack => (attack.text || '').trim() === '');
}

function buildCardData(row, detail) {
  const imageUrl = resolveCardImageUrl(detail);
  const commodityCode = Array.isArray(detail.commodityCodes) && detail.commodityCodes.length > 0
    ? detail.commodityCodes[0]
    : '';
  const commodityName = Array.isArray(detail.commodityNames) && detail.commodityNames.length > 0
    ? detail.commodityNames[0]
    : detail.collectionName;

  const tags = row.special_rules
    .split('|')
    .map(rule => TAG_MAP[rule])
    .filter(Boolean);

  return {
    set: 'set_h',
    name: detail.name,
    fullName: `${detail.name} ${commodityCode || detail.collectionNumber}`,
    tags,
    stage: STAGE_MAP[detail.evolveText] || 'Stage.BASIC',
    evolvesFrom: '',
    cardTypes: [CARD_TYPE_MAP[detail.attributeLabel] || 'CardType.COLORLESS'],
    hp: detail.hp || 0,
    weakness: parseWeakness(detail.weakness),
    resistance: parseResistance(detail.resistance),
    retreat: Array.from({ length: detail.retreatCost || 0 }, () => 'CardType.COLORLESS'),
    powers: (detail.features || []).map(feature => ({
      name: feature.name,
      text: feature.text,
      powerType: toPowerType(feature.text),
    })),
    attacks: (detail.attacks || []).map(attack => ({
      name: attack.name,
      cost: mapCosts(attack.cost),
      damage: attack.damage || '',
      text: attack.text || '',
    })),
    rawData: {
      raw_card: {
        id: detail.id,
        name: detail.name,
        yorenCode: detail.yorenCode,
        cardType: detail.cardTypeCode,
        commodityCode,
        details: {
          regulationMarkText: detail.regulationMark,
          collectionNumber: detail.collectionNumber,
        },
        image: imageUrl,
      },
      collection: {
        id: detail.collectionId,
        commodityCode,
        name: commodityName,
      },
      image_url: imageUrl,
    },
  };
}

function renderCardData(cardData) {
  return JSON.stringify(cardData, null, 2)
    .replace(/"CardType\.[A-Z_]+"/g, match => match.slice(1, -1))
    .replace(/"Stage\.[A-Z_0-9]+"/g, match => match.slice(1, -1))
    .replace(/"CardTag\.[A-Z_]+"/g, match => match.slice(1, -1))
    .replace(/"PowerType\.[A-Z_]+"/g, match => match.slice(1, -1));
}

function renderFile(cards) {
  const entries = cards.map(card => renderCardData(card)).join(',\n');

  return `import {\n  Card,\n  CardTag,\n  CardType,\n  PokemonCard,\n  PowerType,\n  Stage,\n} from '@ptcg/common';\n\n` +
    `type GeneratedSimpleHPokemonCardData = {\n` +
    `  set: string;\n` +
    `  name: string;\n` +
    `  fullName: string;\n` +
    `  tags: string[];\n` +
    `  stage: Stage;\n` +
    `  evolvesFrom: string;\n` +
    `  cardTypes: CardType[];\n` +
    `  hp: number;\n` +
    `  weakness: { type: CardType; value?: number }[];\n` +
    `  resistance: { type: CardType; value: number }[];\n` +
    `  retreat: CardType[];\n` +
    `  powers: { name: string; text: string; powerType: PowerType }[];\n` +
    `  attacks: { name: string; cost: CardType[]; damage: string; text: string }[];\n` +
    `  rawData: Record<string, unknown>;\n` +
    `};\n\n` +
    `class GeneratedSimpleHPokemonCard extends PokemonCard {\n` +
    `  public set = 'set_h';\n` +
    `  public name = '';\n` +
    `  public fullName = '';\n` +
    `  public tags: string[] = [];\n` +
    `  public stage = Stage.BASIC;\n` +
    `  public evolvesFrom = '';\n` +
    `  public cardTypes: CardType[] = [];\n` +
    `  public hp = 0;\n` +
    `  public weakness: { type: CardType; value?: number }[] = [];\n` +
    `  public resistance: { type: CardType; value: number }[] = [];\n` +
    `  public retreat: CardType[] = [];\n` +
    `  public powers: { name: string; text: string; powerType: PowerType }[] = [];\n` +
    `  public attacks: { name: string; cost: CardType[]; damage: string; text: string }[] = [];\n\n` +
    `  constructor(data: GeneratedSimpleHPokemonCardData) {\n` +
    `    super();\n` +
    `    this.set = data.set;\n` +
    `    this.name = data.name;\n` +
    `    this.fullName = data.fullName;\n` +
    `    this.tags = data.tags;\n` +
    `    this.stage = data.stage;\n` +
    `    this.evolvesFrom = data.evolvesFrom;\n` +
    `    this.cardTypes = data.cardTypes;\n` +
    `    this.hp = data.hp;\n` +
    `    this.weakness = data.weakness;\n` +
    `    this.resistance = data.resistance;\n` +
    `    this.retreat = data.retreat;\n` +
    `    this.powers = data.powers;\n` +
    `    this.attacks = data.attacks;\n` +
    `    this.rawData = data.rawData as any;\n` +
    `  }\n` +
    `}\n\n` +
    `const generatedSimpleHPokemonData: GeneratedSimpleHPokemonCardData[] = [\n${entries}\n];\n\n` +
    `export const simpleHCards: Card[] = generatedSimpleHPokemonData.map(data => new GeneratedSimpleHPokemonCard(data));\n`;
}

async function main() {
  const rows = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'));
  const previousGeneratedKeys = new Set(
    rows
      .filter(row => row.implemented_file === IMPLEMENTED_FILE)
      .map(row => row.tracking_key)
  );

  const selectedRows = rows.filter(row =>
    row.phase_mark === 'H'
    && (row.implementation_status !== 'implemented' || previousGeneratedKeys.has(row.tracking_key))
    && row.complexity === 'low'
    && row.interaction_flags === ''
  );

  const generatedCards = [];
  const generatedKeys = new Set();

  for (const row of selectedRows) {
    const detail = await resolveDetail(row);
    if (!detail) {
      continue;
    }
    if (!isTrulySimple(detail)) {
      continue;
    }
    generatedCards.push(buildCardData(row, detail));
    generatedKeys.add(row.tracking_key);
  }

  generatedCards.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
  fs.writeFileSync(OUTPUT_PATH, renderFile(generatedCards));

  const updatedRows = rows.map(row => {
    if (previousGeneratedKeys.has(row.tracking_key) && !generatedKeys.has(row.tracking_key)) {
      return {
        ...row,
        implemented_in_repo: 'no',
        implementation_status: 'todo',
        backend_status: 'todo',
        ui_status: 'todo',
        ai_api_status: 'todo',
        implemented_file: '',
        test_file: '',
        notes: (row.notes || '')
          .replace(/;?\s*H basic low-complexity generated card added\./g, '')
          .trim(),
      };
    }

    if (!generatedKeys.has(row.tracking_key)) {
      return row;
    }
    return {
      ...row,
      implemented_in_repo: 'yes',
      implementation_status: 'implemented',
      backend_status: 'implemented',
      ui_status: row.ui_status === 'not_needed' ? 'not_needed' : 'todo',
      ai_api_status: row.ai_api_status === 'not_needed' ? 'not_needed' : 'planned',
      implemented_file: IMPLEMENTED_FILE,
      test_file: TEST_FILE,
      notes: row.notes
        ? `${row.notes}; H basic low-complexity generated card added.`
        : 'H basic low-complexity generated card added.',
    };
  });

  const headers = Object.keys(updatedRows[0]);
  const csvLines = [
    headers.join(','),
    ...updatedRows.map(row => headers.map(header => escapeCsvValue(String(row[header] || ''))).join(',')),
  ];
  fs.writeFileSync(CSV_PATH, `${csvLines.join('\n')}\n`);

  console.log(`Generated ${generatedCards.length} simple H basic Pokemon cards.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
