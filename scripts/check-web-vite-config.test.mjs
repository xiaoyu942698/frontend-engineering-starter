import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';

const webDir = path.resolve('apps/web');
const viteCli = path.join(webDir, 'node_modules/vite/bin/vite.js');

test('blocks production web builds when mock auth is enabled', () => {
  assert.throws(
    () =>
      execFileSync(process.execPath, [viteCli, 'build'], {
        cwd: webDir,
        env: { ...process.env, VITE_ENABLE_MOCK_AUTH: 'true' },
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe']
      }),
    (error) => {
      const output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
      return output.includes('VITE_ENABLE_MOCK_AUTH must be disabled before building production assets.');
    }
  );
});
