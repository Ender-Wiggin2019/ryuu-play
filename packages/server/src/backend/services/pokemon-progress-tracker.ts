import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';

export interface PokemonProgressRecord {
  phase_mark: string;
  source_marks: string;
  tracking_key: string;
  yoren_code: string;
  name_zh: string;
  attribute: string;
  stage: string;
  hp: string;
  deck_rule_limit: string;
  special_rules: string;
  interaction_flags: string;
  complexity: string;
  source_variant_count: string;
  collection_numbers: string;
  implemented_in_repo: string;
  implementation_status: string;
  backend_status: string;
  ui_status: string;
  ai_api_status: string;
  implemented_file: string;
  test_file: string;
  notes: string;
}

export interface PokemonProgressFilters {
  phaseMark?: string;
  implementationStatus?: string;
  backendStatus?: string;
  uiStatus?: string;
  aiApiStatus?: string;
  implementedInRepo?: string;
  specialRule?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PokemonProgressSummary {
  total: number;
  csvPath: string;
  byMark: { [mark: string]: number };
  byImplementationStatus: { [status: string]: number };
  byBackendStatus: { [status: string]: number };
  byUiStatus: { [status: string]: number };
  byAiApiStatus: { [status: string]: number };
}

const HEADERS: Array<keyof PokemonProgressRecord> = [
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

const EDITABLE_COLUMNS = new Set<keyof PokemonProgressRecord>([
  'implementation_status',
  'backend_status',
  'ui_status',
  'ai_api_status',
  'implemented_file',
  'test_file',
  'notes'
]);

export class PokemonProgressTracker {

  constructor(private readonly baseDir: string = process.cwd()) { }

  public getCsvPath(): string {
    return path.join(this.baseDir, 'tracking', 'set-f-pokemon-progress.csv');
  }

  public getSummary(): PokemonProgressSummary {
    const rows = this.loadRows();

    return rows.reduce((summary, row) => {
      summary.total += 1;
      summary.byMark[row.phase_mark] = (summary.byMark[row.phase_mark] || 0) + 1;
      summary.byImplementationStatus[row.implementation_status] = (summary.byImplementationStatus[row.implementation_status] || 0) + 1;
      summary.byBackendStatus[row.backend_status] = (summary.byBackendStatus[row.backend_status] || 0) + 1;
      summary.byUiStatus[row.ui_status] = (summary.byUiStatus[row.ui_status] || 0) + 1;
      summary.byAiApiStatus[row.ai_api_status] = (summary.byAiApiStatus[row.ai_api_status] || 0) + 1;
      return summary;
    }, {
      total: 0,
      csvPath: this.getCsvPath(),
      byMark: {},
      byImplementationStatus: {},
      byBackendStatus: {},
      byUiStatus: {},
      byAiApiStatus: {}
    } as PokemonProgressSummary);
  }

  public list(filters: PokemonProgressFilters = {}): { total: number, items: PokemonProgressRecord[] } {
    const filtered = this.applyFilters(this.loadRows(), filters);
    const offset = Math.max(0, filters.offset || 0);
    const limit = filters.limit == null ? filtered.length : Math.max(0, filters.limit);

    return {
      total: filtered.length,
      items: filtered.slice(offset, offset + limit)
    };
  }

  public getNext(filters: PokemonProgressFilters = {}): PokemonProgressRecord | undefined {
    return this.applyFilters(this.loadRows(), filters)
      .find(row => row.implementation_status !== 'implemented');
  }

  public update(
    target: { trackingKey?: string, yorenCode?: string },
    patch: Partial<PokemonProgressRecord>
  ): PokemonProgressRecord {
    const rows = this.loadRows();
    const index = rows.findIndex(row => {
      return (target.trackingKey && row.tracking_key === target.trackingKey)
        || (target.yorenCode && row.yoren_code === target.yorenCode);
    });

    if (index === -1) {
      throw new Error('Pokemon progress row not found.');
    }

    EDITABLE_COLUMNS.forEach(column => {
      const value = patch[column];
      if (typeof value === 'string') {
        rows[index][column] = this.sanitizeCell(value);
      }
    });

    this.writeRows(rows);
    return rows[index];
  }

  public regenerate(): { outputPath?: string, totalRows?: number, summary?: unknown } {
    const scriptPath = path.join(this.baseDir, 'scripts', 'generate-set-f-pokemon-progress.js');
    const output = execFileSync('node', [scriptPath], {
      cwd: this.baseDir,
      encoding: 'utf8'
    }).trim();

    return output === '' ? {} : JSON.parse(output);
  }

  private applyFilters(rows: PokemonProgressRecord[], filters: PokemonProgressFilters): PokemonProgressRecord[] {
    const phaseMark = (filters.phaseMark || '').toUpperCase();
    const implementationStatus = filters.implementationStatus || '';
    const backendStatus = filters.backendStatus || '';
    const uiStatus = filters.uiStatus || '';
    const aiApiStatus = filters.aiApiStatus || '';
    const implementedInRepo = filters.implementedInRepo || '';
    const specialRule = (filters.specialRule || '').toUpperCase();
    const search = (filters.search || '').trim().toLowerCase();

    return rows.filter(row => {
      if (phaseMark && row.phase_mark !== phaseMark) {
        return false;
      }
      if (implementationStatus && row.implementation_status !== implementationStatus) {
        return false;
      }
      if (backendStatus && row.backend_status !== backendStatus) {
        return false;
      }
      if (uiStatus && row.ui_status !== uiStatus) {
        return false;
      }
      if (aiApiStatus && row.ai_api_status !== aiApiStatus) {
        return false;
      }
      if (implementedInRepo && row.implemented_in_repo !== implementedInRepo) {
        return false;
      }
      if (specialRule && !row.special_rules.split('|').map(item => item.toUpperCase()).includes(specialRule)) {
        return false;
      }
      if (search) {
        const haystack = [
          row.tracking_key,
          row.yoren_code,
          row.name_zh,
          row.special_rules,
          row.interaction_flags,
          row.notes
        ].join(' ').toLowerCase();
        if (!haystack.includes(search)) {
          return false;
        }
      }
      return true;
    });
  }

  private loadRows(): PokemonProgressRecord[] {
    const csvPath = this.getCsvPath();
    if (!fs.existsSync(csvPath)) {
      return [];
    }

    const content = fs.readFileSync(csvPath, 'utf8').trim();
    if (content === '') {
      return [];
    }

    const lines = content.split(/\r?\n/);
    const headers = this.parseCsvLine(lines[0]) as Array<keyof PokemonProgressRecord>;

    return lines.slice(1)
      .filter(line => line.trim() !== '')
      .map(line => {
        const values = this.parseCsvLine(line);
        const row = {} as PokemonProgressRecord;

        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        return row;
      });
  }

  private writeRows(rows: PokemonProgressRecord[]): void {
    const csvPath = this.getCsvPath();
    const lines = [
      HEADERS.join(','),
      ...rows.map(row => HEADERS.map(header => this.escapeCsvCell(row[header])).join(','))
    ];

    fs.mkdirSync(path.dirname(csvPath), { recursive: true });
    fs.writeFileSync(csvPath, lines.join('\n') + '\n');
  }

  private parseCsvLine(line: string): string[] {
    const cells: string[] = [];
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

  private sanitizeCell(value: string): string {
    return value.replace(/\r?\n/g, ' ').trim();
  }

  private escapeCsvCell(value: string): string {
    const sanitized = this.sanitizeCell(value || '');
    if (sanitized.includes(',') || sanitized.includes('"')) {
      return `"${sanitized.replace(/"/g, '""')}"`;
    }
    return sanitized;
  }

}
