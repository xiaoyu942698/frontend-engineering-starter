import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const scriptPath = path.resolve('scripts/check-engineering-rules.mjs');

function createTempProject() {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-flow-engineering-'));
  fs.mkdirSync(path.join(projectDir, 'apps/web/src/features/orders/components'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'apps/web/src/shared/api'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'packages/ui/src/styles'), { recursive: true });
  fs.writeFileSync(path.join(projectDir, 'package.json'), '{"dependencies":{}}', 'utf8');
  return projectDir;
}

function runEngineeringRules(projectDir, env = {}) {
  return execFileSync(process.execPath, [scriptPath], {
    cwd: projectDir,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function expectFailure(projectDir, expectedMessage, env) {
  assert.throws(
    () => runEngineeringRules(projectDir, env),
    (error) => {
      const output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
      return output.includes(expectedMessage);
    }
  );
}

test('blocks direct axios imports outside shared api', () => {
  const projectDir = createTempProject();
  fs.writeFileSync(
    path.join(projectDir, 'apps/web/src/features/orders/components/OrderTable.vue'),
    `<script setup lang="ts">\nimport axios from 'axios';\nawait axios.get('/api/orders');\n</script>\n`,
    'utf8'
  );

  expectFailure(projectDir, 'HTTP calls must go through shared/api');
});

test('blocks hardcoded colors in feature styles', () => {
  const projectDir = createTempProject();
  fs.writeFileSync(
    path.join(projectDir, 'apps/web/src/features/orders/components/OrderTable.vue'),
    `<style scoped>\n.order-row {\n  color: #3366ff;\n}\n</style>\n`,
    'utf8'
  );

  expectFailure(projectDir, 'Use design tokens instead of hardcoded color');
});

test('blocks v-html in Vue components', () => {
  const projectDir = createTempProject();
  fs.writeFileSync(
    path.join(projectDir, 'apps/web/src/features/orders/components/OrderTable.vue'),
    `<template>\n  <section v-html="rawHtml" />\n</template>\n`,
    'utf8'
  );

  expectFailure(projectDir, 'Do not use v-html');
});

test('blocks direct DOM HTML injection', () => {
  const projectDir = createTempProject();
  fs.writeFileSync(
    path.join(projectDir, 'apps/web/src/features/orders/components/render-order.ts'),
    `export function renderOrder(element: HTMLElement, rawHtml: string) {\n  element.innerHTML = rawHtml;\n}\n`,
    'utf8'
  );

  expectFailure(projectDir, 'Do not assign HTML strings directly');
});

test('blocks duplicate UI framework dependencies', () => {
  const projectDir = createTempProject();
  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({ dependencies: { antd: '^5.0.0' } }), 'utf8');

  expectFailure(projectDir, 'Duplicate UI framework dependency');
});

test('blocks committed env examples that enable mock auth by default', () => {
  const projectDir = createTempProject();
  fs.writeFileSync(path.join(projectDir, '.env.example'), 'VITE_ENABLE_MOCK_AUTH=true\n', 'utf8');
  fs.mkdirSync(path.join(projectDir, 'apps/web'), { recursive: true });
  fs.writeFileSync(path.join(projectDir, 'apps/web/.env.example'), 'VITE_ENABLE_MOCK_AUTH=false\n', 'utf8');

  expectFailure(projectDir, 'Mock auth must default to false in committed env examples');
});

test('blocks mock auth process env in CI and production gates', () => {
  const projectDir = createTempProject();

  expectFailure(projectDir, 'VITE_ENABLE_MOCK_AUTH must be false in CI or production', {
    CI: 'true',
    VITE_ENABLE_MOCK_AUTH: 'true'
  });
});
