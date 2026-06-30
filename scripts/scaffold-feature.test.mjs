import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const scriptPath = path.resolve('scripts/scaffold-feature.mjs');

function createTempProject() {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-flow-scaffold-'));
  fs.mkdirSync(path.join(projectDir, 'apps/web/src/features'), { recursive: true });
  return projectDir;
}

function read(projectDir, relativePath) {
  return fs.readFileSync(path.join(projectDir, relativePath), 'utf8');
}

test('scaffolds a feature module with routes, schema, query, page, and test files', () => {
  const projectDir = createTempProject();

  execFileSync(
    process.execPath,
    [scriptPath, 'approval-center', '--title', '审批中心', '--permission', 'approval:read'],
    {
      cwd: projectDir,
      encoding: 'utf8'
    }
  );

  for (const relativePath of [
    'apps/web/src/features/approval-center/index.ts',
    'apps/web/src/features/approval-center/routes.ts',
    'apps/web/src/features/approval-center/schema.ts',
    'apps/web/src/features/approval-center/queries/approval-center-queries.ts',
    'apps/web/src/features/approval-center/pages/ApprovalCenterPage.vue',
    'apps/web/src/features/approval-center/tests/approval-center.spec.ts'
  ]) {
    assert.equal(fs.existsSync(path.join(projectDir, relativePath)), true, `${relativePath} should exist`);
  }

  assert.match(read(projectDir, 'apps/web/src/features/approval-center/routes.ts'), /permissions: \['approval:read'\]/);
  assert.match(read(projectDir, 'apps/web/src/features/approval-center/routes.ts'), /name: 'approval-center'/);
  assert.match(read(projectDir, 'apps/web/src/features/approval-center/pages/ApprovalCenterPage.vue'), /UiStateBlock/);
  assert.match(read(projectDir, 'apps/web/src/features/approval-center/tests/approval-center.spec.ts'), /审批中心/);
});

test('refuses unsafe feature names', () => {
  const projectDir = createTempProject();

  assert.throws(
    () => execFileSync(process.execPath, [scriptPath, '../escape'], { cwd: projectDir, encoding: 'utf8' }),
    (error) => `${error.stderr ?? ''}${error.stdout ?? ''}`.includes('Use kebab-case feature names')
  );
});
