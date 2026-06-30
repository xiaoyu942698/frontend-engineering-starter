import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const scriptPath = path.resolve('scripts/check-naming-and-comments.mjs');

function createTempProject() {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-flow-standards-'));
  fs.mkdirSync(path.join(projectDir, 'apps/web/src'), { recursive: true });
  return projectDir;
}

function runStandards(projectDir) {
  return execFileSync(process.execPath, [scriptPath], {
    cwd: projectDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

test('blocks source files that exceed the configured line limit', () => {
  const projectDir = createTempProject();
  const filePath = path.join(projectDir, 'apps/web/src/LargePanel.vue');
  const longTemplate = Array.from({ length: 421 }, (_, index) => `  <div class="app-large-line">${index}</div>`).join(
    '\n'
  );

  fs.writeFileSync(
    filePath,
    `<template>\n${longTemplate}\n</template>\n<script setup lang="ts">\nconst getValue = 1;\n</script>\n`,
    'utf8'
  );

  assert.throws(
    () => runStandards(projectDir),
    (error) => {
      const output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
      return output.includes('exceeds the 420 line limit');
    }
  );
});
