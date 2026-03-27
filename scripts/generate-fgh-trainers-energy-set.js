const fs = require('fs');
const path = require('path');

const datasetRoot = process.env.PTCG_CHS_DATASET_ROOT || '/Users/easygod/code/PTCG-CHS-Datasets';
const sqliteModulePath = path.join(datasetRoot, 'node_modules', 'better-sqlite3');
const Database = require(sqliteModulePath);

const datasetDbPath = path.join(datasetRoot, 'data', 'ptcg.sqlite');
const outputPath = path.join(
  __dirname,
  '..',
  'packages',
  'sets',
  'src',
  'standard',
  'set_fgh',
  'cards.generated.ts'
);

const CARD_IMAGE_BASE_URL = process.env.PTCG_CARD_IMAGE_BASE_URL
  || 'https://pub-a275b3fdda064fe5a8c45a3a5afb1266.r2.dev';
const CARD_IMAGE_MAP_PATH = path.join(
  __dirname,
  '..',
  'packages',
  'sets',
  'src',
  'standard',
  'card-image-r2.generated.ts'
);
const CARD_IMAGE_URLS_BY_ID = new Map(
  [...fs.readFileSync(CARD_IMAGE_MAP_PATH, 'utf8').matchAll(/\s(\d+): '([^']+)'/g)]
    .map(([, id, url]) => [Number(id), url])
);

const trainerTypeMap = {
  '物品': 'ITEM',
  '支援者': 'SUPPORTER',
  '竞技场': 'STADIUM',
  '宝可梦道具': 'TOOL'
};

const energyTypeMap = {
  '基本能量': 'BASIC',
  '特殊能量': 'SPECIAL'
};

const providesTypeMap = {
  '无': 'COLORLESS',
  '草': 'GRASS',
  '火': 'FIRE',
  '水': 'WATER',
  '雷': 'LIGHTNING',
  '超': 'PSYCHIC',
  '斗': 'FIGHTING',
  '恶': 'DARK',
  '钢': 'METAL',
  '龙': 'DRAGON',
  '妖': 'FAIRY'
};

function getMarkRank(regulationMark) {
  switch (regulationMark) {
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
  return (value || '').trim();
}

function normalizeEffectText(value) {
  return normalizeText(value)
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ');
}

function normalizeImageUrl(value, id) {
  const mappedUrl = CARD_IMAGE_URLS_BY_ID.get(id);
  if (mappedUrl) {
    return mappedUrl;
  }
  if (!value) {
    return `${CARD_IMAGE_BASE_URL}/api/v1/cards/${id}/image`;
  }
  return value.startsWith('http')
    ? value
    : `${CARD_IMAGE_BASE_URL}${value}`;
}

function parseBasicEnergyProvides(name) {
  for (const [symbol, type] of Object.entries(providesTypeMap)) {
    if (name.includes(symbol)) {
      return [type];
    }
  }
  return ['ANY'];
}

function parseSpecialEnergyProvides(ruleText) {
  const text = normalizeText(ruleText);
  if (text.includes('所有属性的任意1个能量')) {
    return ['ANY'];
  }

  const quantityMatch = text.match(/视作(\d+)个【([^】]+)】能量/);
  if (quantityMatch) {
    const quantity = Number(quantityMatch[1]);
    const type = providesTypeMap[quantityMatch[2]] || 'ANY';
    return Array.from({ length: quantity }, () => type);
  }

  const singleMatch = text.match(/视作1个【([^】]+)】能量/);
  if (singleMatch) {
    return [providesTypeMap[singleMatch[1]] || 'ANY'];
  }

  return ['COLORLESS'];
}

function getEnergyProvides(row) {
  if (row.energy_type_label === '基本能量') {
    return parseBasicEnergyProvides(row.name);
  }
  return parseSpecialEnergyProvides(row.rule_text);
}

function buildRawData(row, variantGroupKey, variantGroupSize) {
  const rawCard = {
    id: row.id,
    name: row.name,
    yorenCode: row.yoren_code || undefined,
    cardType: row.card_type_code,
    commodityCode: row.commodity_code || undefined,
    trainerType: row.trainer_type_code || undefined,
    energyType: row.energy_type_code || undefined,
    text: row.rule_text || undefined,
    image: row.image_path || undefined,
    hash: row.hash || undefined,
    details: {
      regulationMarkText: row.regulation_mark,
      collectionNumber: row.collection_number,
      rarityLabel: row.rarity_label || undefined
    }
  };

  const collection = row.collection_id == null
    ? undefined
    : {
        id: row.collection_id,
        commodityCode: row.commodity_code || undefined,
        name: row.collection_name,
        salesDate: row.sales_date || undefined
      };

  return {
    raw_card: rawCard,
    collection,
    image_url: normalizeImageUrl(row.image_url, row.id),
    variant_group_key: variantGroupKey,
    variant_group_size: variantGroupSize
  };
}

function buildCardData(row, variantGroupKey, variantGroupSize) {
  const base = {
    set: `set_${row.regulation_mark.toLowerCase()}`,
    name: row.name,
    fullName: `${row.name} ${row.collection_number}#${row.id}`,
    text: normalizeText(row.rule_text),
    tags: row.special_card_label === 'ACE SPEC' ? ['ACE_SPEC'] : [],
    rawData: buildRawData(row, variantGroupKey, variantGroupSize)
  };

  if (row.card_type_label === '训练家') {
    return {
      kind: 'trainer',
      ...base,
      trainerType: trainerTypeMap[row.trainer_type_label],
      canUseOnFirstTurn: normalizeText(row.rule_text).includes('即使是先攻玩家的最初回合也可以使用')
    };
  }

  return {
    kind: 'energy',
    ...base,
    energyType: energyTypeMap[row.energy_type_label],
    provides: getEnergyProvides(row)
  };
}

function sortRowsForSelection(a, b) {
  const collectionDiff = (b.collection_number_numeric ?? -1) - (a.collection_number_numeric ?? -1);
  if (collectionDiff !== 0) {
    return collectionDiff;
  }

  const markDiff = getMarkRank(b.regulation_mark) - getMarkRank(a.regulation_mark);
  if (markDiff !== 0) {
    return markDiff;
  }

  return b.id - a.id;
}

function buildDedupKey(row) {
  return [
    row.card_type_label,
    row.trainer_type_label || '',
    row.energy_type_label || '',
    row.name,
    normalizeEffectText(row.rule_text)
  ].join('\u0001');
}

function generateFile(cards) {
  const content = `/* eslint-disable */
import { Card, CardTag, CardType, EnergyCard, EnergyType, TrainerCard, TrainerType } from '@ptcg/common';

type GeneratedTrainerType = 'ITEM' | 'SUPPORTER' | 'STADIUM' | 'TOOL';
type GeneratedEnergyType = 'BASIC' | 'SPECIAL';
type GeneratedCardTag = 'ACE_SPEC';

type GeneratedRawData = {
  raw_card: Record<string, unknown>;
  collection?: Record<string, unknown>;
  image_url: string;
  variant_group_key: string;
  variant_group_size: number;
};

type GeneratedBaseCardData = {
  set: string;
  name: string;
  fullName: string;
  text: string;
  tags: GeneratedCardTag[];
  rawData: GeneratedRawData;
};

type GeneratedTrainerCardData = GeneratedBaseCardData & {
  kind: 'trainer';
  trainerType: GeneratedTrainerType;
  canUseOnFirstTurn: boolean;
};

type GeneratedEnergyCardData = GeneratedBaseCardData & {
  kind: 'energy';
  energyType: GeneratedEnergyType;
  provides: Array<keyof typeof CardType>;
};

type GeneratedCardData = GeneratedTrainerCardData | GeneratedEnergyCardData;

class GeneratedTrainerCard extends TrainerCard {
  public trainerType: TrainerType;
  public set: string;
  public name: string;
  public fullName: string;
  public text: string;
  public canUseOnFirstTurn?: boolean;
  public rawData: GeneratedRawData;

  constructor(data: GeneratedTrainerCardData) {
    super();
    this.tags = data.tags.map(tag => CardTag[tag]);
    this.trainerType = TrainerType[data.trainerType];
    this.set = data.set;
    this.name = data.name;
    this.fullName = data.fullName;
    this.text = data.text;
    this.canUseOnFirstTurn = data.canUseOnFirstTurn;
    this.rawData = data.rawData;
  }
}

class GeneratedEnergyCard extends EnergyCard {
  public energyType: EnergyType;
  public provides: CardType[];
  public set: string;
  public name: string;
  public fullName: string;
  public text: string;
  public rawData: GeneratedRawData;

  constructor(data: GeneratedEnergyCardData) {
    super();
    this.tags = data.tags.map(tag => CardTag[tag]);
    this.energyType = EnergyType[data.energyType];
    this.provides = data.provides.map(type => CardType[type]);
    this.set = data.set;
    this.name = data.name;
    this.fullName = data.fullName;
    this.text = data.text;
    this.rawData = data.rawData;
  }
}

const generatedCardsData = JSON.parse(${JSON.stringify(JSON.stringify(cards))}) as GeneratedCardData[];

export const setFgh: Card[] = generatedCardsData.map(card => {
  return card.kind === 'trainer'
    ? new GeneratedTrainerCard(card)
    : new GeneratedEnergyCard(card);
});
`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content);
}

function main() {
  const db = new Database(datasetDbPath, { readonly: true });
  const rows = db.prepare(`
    SELECT
      cards.id,
      cards.name,
      cards.yoren_code,
      cards.card_type_code,
      cards.card_type_label,
      cards.trainer_type_code,
      cards.trainer_type_label,
      cards.energy_type_code,
      cards.energy_type_label,
      cards.regulation_mark,
      cards.collection_number,
      cards.collection_number_numeric,
      cards.commodity_code,
      cards.image_path,
      cards.image_url,
      cards.hash,
      cards.rule_text,
      cards.rarity_label,
      cards.special_card_label,
      collections.id AS collection_id,
      collections.name AS collection_name,
      collections.sales_date
    FROM cards
    LEFT JOIN collections ON collections.commodity_code = cards.commodity_code
    WHERE cards.regulation_mark IN ('F', 'G', 'H')
      AND (cards.card_type_label = '训练家' OR cards.card_type_label = '能量')
  `).all();

  const grouped = new Map();
  for (const row of rows) {
    const key = buildDedupKey(row);
    const group = grouped.get(key) || [];
    group.push(row);
    grouped.set(key, group);
  }

  const cards = Array.from(grouped.entries())
    .flatMap(([key, groupRows]) => {
      const sortedRows = groupRows.slice().sort(sortRowsForSelection);
      return sortedRows.map(row => buildCardData(row, key, sortedRows.length));
    });

  const selectedRows = Array.from(grouped.values())
    .map(groupRows => groupRows.slice().sort(sortRowsForSelection)[0])
    .sort((a, b) => {
    if (a.card_type_label !== b.card_type_label) {
      return a.card_type_label.localeCompare(b.card_type_label, 'zh-Hans-CN');
    }
    if ((a.trainer_type_label || '') !== (b.trainer_type_label || '')) {
      return (a.trainer_type_label || '').localeCompare(b.trainer_type_label || '', 'zh-Hans-CN');
    }
    if ((a.energy_type_label || '') !== (b.energy_type_label || '')) {
      return (a.energy_type_label || '').localeCompare(b.energy_type_label || '', 'zh-Hans-CN');
    }
    return a.name.localeCompare(b.name, 'zh-Hans-CN');
  });

  generateFile(cards);
  console.log(JSON.stringify({
    sourceCount: rows.length,
    logicalCount: selectedRows.length,
    emittedCount: cards.length,
    outputPath
  }, null, 2));
}

main();
