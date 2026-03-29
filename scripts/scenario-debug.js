#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function readScenario(filePath) {
  const absPath = path.resolve(process.cwd(), filePath);
  const raw = fs.readFileSync(absPath, 'utf8');
  const ext = path.extname(absPath).toLowerCase();
  if (ext === '.yaml' || ext === '.yml') {
    return yaml.load(raw);
  }
  return JSON.parse(raw);
}

function getByPath(source, dottedPath) {
  if (!dottedPath) {
    return source;
  }

  return dottedPath.split('.').reduce((current, key) => {
    if (current === null || current === undefined) {
      return undefined;
    }
    return current[key];
  }, source);
}

function stringifyTemplateValue(value) {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function resolveTemplates(value, context) {
  if (typeof value === 'string') {
    const exactMatch = value.match(/^\$\{lastExport(?:\.([^\}]+))?\}$/);
    if (exactMatch) {
      return getByPath(context.lastExport, exactMatch[1] || '');
    }

    return value.replace(/\$\{lastExport(?:\.([^\}]+))?\}/g, (_, exportPath) => {
      const resolved = getByPath(context.lastExport, exportPath || '');
      return stringifyTemplateValue(resolved);
    });
  }

  if (value instanceof Array) {
    return value.map(item => resolveTemplates(item, context));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, resolveTemplates(nestedValue, context)])
    );
  }

  return value;
}

async function api(baseUrl, token, method, apiPath, body) {
  const response = await fetch(baseUrl.replace(/\/$/, '') + apiPath, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Auth-Token': token } : {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    data = { raw: text };
  }
  if (!response.ok) {
    const err = new Error(`HTTP ${response.status} ${apiPath}`);
    err.response = data;
    throw err;
  }
  return data;
}

async function run(filePath) {
  if (filePath === '--help' || filePath === '-h') {
    process.stdout.write([
      'Usage: npm run scenario:debug -- <scenario-file>',
      'Environment:',
      '  SCENARIO_BASE_URL   default http://127.0.0.1:3000',
      '  SCENARIO_AUTH_TOKEN Auth-Token header value',
      ''
    ].join('\n'));
    return;
  }

  if (!filePath) {
    throw new Error('Missing scenario file path. Usage: npm run scenario:debug -- ./scenario.json');
  }

  const baseUrl = process.env.SCENARIO_BASE_URL || 'http://127.0.0.1:3000';
  const token = process.env.SCENARIO_AUTH_TOKEN || '';
  const scenario = readScenario(filePath);
  const createInput = scenario.create || {};

  const createResult = await api(baseUrl, token, 'POST', '/v1/testing/scenario/create', {
    playerDeckId: createInput.playerDeckId,
    botDeckId: createInput.botDeckId,
    formatName: createInput.formatName || ''
  });

  const scenarioId = createResult.scenarioId;
  const steps = scenario.steps || [];
  const history = [];
  let lastExport = createResult.state;
  let lastPromptId = Number(lastExport?.prompts?.[0]?.id);
  let lastAssert = null;

  for (const rawStep of steps) {
    const step = resolveTemplates(rawStep, { lastExport });
    const type = String(step.type || '').trim();

    if (type === 'patch') {
      const result = await api(baseUrl, token, 'POST', `/v1/testing/scenario/${scenarioId}/patch`, {
        operations: step.operations || []
      });
      history.push({ type, result });
      continue;
    }

    if (type === 'action') {
      const result = await api(baseUrl, token, 'POST', `/v1/testing/scenario/${scenarioId}/action`, {
        actor: step.actor,
        actionType: step.actionType,
        payload: step.payload || {}
      });
      history.push({ type, result });
      continue;
    }

    if (type === 'resolvePrompt') {
      let promptId = Number(step.promptId);
      if (!Number.isFinite(promptId)) {
        promptId = lastPromptId;
      }
      if (!Number.isFinite(promptId)) {
        const stateResult = await api(baseUrl, token, 'GET', `/v1/testing/scenario/${scenarioId}/state`);
        lastExport = stateResult.state;
        lastPromptId = Number(lastExport?.prompts?.[0]?.id);
        promptId = Number(lastExport?.prompts?.[0]?.id);
      }
      if (!Number.isFinite(promptId)) {
        throw new Error(`Missing promptId for scenario step in ${filePath}`);
      }

      const result = await api(baseUrl, token, 'POST', `/v1/testing/scenario/${scenarioId}/prompt/resolve`, {
        actor: step.actor,
        promptId,
        result: step.result
      });
      history.push({ type, result });
      continue;
    }

    if (type === 'createStateRefresh') {
      const result = await api(baseUrl, token, 'GET', `/v1/testing/scenario/${scenarioId}/state`);
      lastExport = result.state;
      lastPromptId = Number(lastExport?.prompts?.[0]?.id);
      history.push({ type, result });
      continue;
    }

    if (type === 'export') {
      const result = await api(baseUrl, token, 'POST', `/v1/testing/scenario/${scenarioId}/export`, {
        scope: step.scope || 'full',
        player: step.player
      });
      lastExport = result.state;
      lastPromptId = Number(lastExport?.prompts?.[0]?.id);
      history.push({ type, result });
      continue;
    }

    if (type === 'assert') {
      const result = await api(baseUrl, token, 'POST', `/v1/testing/scenario/${scenarioId}/assert`, {
        checks: step.checks || []
      });
      lastAssert = result.result;
      history.push({ type, result: result.result });
      continue;
    }

    history.push({ type: 'unknown', step });
  }

  if ((scenario.expects || []).length > 0) {
    const result = await api(baseUrl, token, 'POST', `/v1/testing/scenario/${scenarioId}/assert`, {
      checks: scenario.expects
    });
    lastAssert = result.result;
    history.push({ type: 'assert', result: result.result });
  }

  const output = {
    ok: true,
    scenarioId,
    players: {
      player1Id: createResult.player1Id,
      player2Id: createResult.player2Id
    },
    lastExport,
    lastAssert,
    history
  };

  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
}

run(process.argv[2]).catch(error => {
  const output = {
    ok: false,
    error: String(error.message || error),
    response: error.response || null
  };
  process.stderr.write(JSON.stringify(output, null, 2) + '\n');
  process.exit(1);
});
