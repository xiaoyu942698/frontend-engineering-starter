import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const scriptPath = path.resolve('scripts/check-gate-closure.mjs');

function writeFile(projectDir, relativePath, content) {
  const filePath = path.join(projectDir, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function createGateProject(overrides = {}) {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-flow-gates-'));
  const files = {
    'package.json': JSON.stringify({
      scripts: {
        precommit: 'lint-staged && pnpm lint:standards && pnpm lint:engineering && pnpm check:gates',
        verify: 'pnpm format:check && pnpm lint && pnpm test && pnpm build && pnpm check:gates',
        lint: 'pnpm -r lint && pnpm lint:standards && pnpm lint:engineering',
        test: 'pnpm -r test && pnpm test:standards && pnpm test:engineering',
        'lint:engineering': 'node scripts/check-engineering-rules.mjs',
        'test:engineering':
          'node --test scripts/check-engineering-rules.test.mjs scripts/check-gate-closure.test.mjs scripts/configure-github-branch-protection.test.mjs scripts/scaffold-feature.test.mjs',
        'test:coverage':
          'pnpm --filter @agent-flow/contracts test:coverage && pnpm --filter @agent-flow/mock-api test:coverage && pnpm --filter @agent-flow/web test:coverage',
        'verify:e2e': 'pnpm --filter @agent-flow/web test:e2e',
        'check:gates': 'node scripts/check-gate-closure.mjs',
        'protect:github': 'node scripts/configure-github-branch-protection.mjs',
        'scaffold:feature': 'node scripts/scaffold-feature.mjs'
      }
    }),
    '.husky/pre-commit': 'pnpm precommit\n',
    '.husky/commit-msg': 'pnpm commitlint --edit "$1"\n',
    '.husky/pre-push': 'pnpm verify\n',
    '.github/CODEOWNERS':
      '* @your-org/frontend-platform\npackages/contracts/ @your-org/frontend-platform\npackages/ui/ @your-org/frontend-platform\napps/web/src/shared/api/ @your-org/frontend-platform\napps/web/src/shared/auth/ @your-org/frontend-platform\napps/web/src/shared/runtime/ @your-org/frontend-platform\n',
    '.github/CODEOWNERS.example':
      'packages/contracts/ @your-org/frontend-platform\npackages/ui/ @your-org/frontend-platform\napps/web/src/shared/api/ @your-org/frontend-platform\napps/web/src/shared/auth/ @your-org/frontend-platform\n',
    '.github/workflows/ci.yml':
      'pull_request:\nrun: pnpm install --frozen-lockfile\nrun: pnpm verify\nrun: pnpm test:coverage\nrun: pnpm verify:e2e\n',
    '.github/workflows/codex-review.yml':
      'openai/codex-action@v1\nsecrets.OPENAI_API_KEY\nprompt-file: .github/codex/prompts/review.md\noutput-file: codex-review.md\nMERGE_DECISION: BLOCK\nMERGE_DECISION: PASS\n',
    '.github/codex/prompts/review.md':
      'MERGE_DECISION: PASS\nMERGE_DECISION: BLOCK\n--no-verify\npnpm verify\nnaming/comment/file-size\narchitecture/API/component/security/performance/accessibility\npnpm test:coverage\npnpm verify:e2e\n',
    '.github/pull_request_template.md':
      'pnpm lint:standards\npnpm lint:engineering\npnpm build\npnpm test:coverage\npnpm verify:e2e\n--no-verify\nCI / coverage\nCI / e2e\nCodex Review / codex_review\n',
    'AGENTS.md': '--no-verify\npnpm verify\nrequired GitHub checks\nFRONTEND_BOUNDARY_GUIDE\nCODEX_RULE_ROUTER\n',
    'docs/GIT_MERGE_GATES.md':
      'CI / verify\nCI / coverage\nCI / e2e\nCodex Review / codex_review\nOPENAI_API_KEY\n--no-verify\npnpm lint:engineering\npnpm test:coverage\npnpm verify:e2e\n',
    'docs/GITHUB_BRANCH_PROTECTION.md':
      'CI / verify\nCI / coverage\nCI / e2e\nCodex Review / codex_review\nDo not allow bypassing the above settings\n',
    'scripts/configure-github-branch-protection.mjs':
      'CI / coverage\nCodex Review / codex_review\nrequire_code_owner_reviews: true\n',
    'docs/FRONTEND_BOUNDARY_GUIDE.md': '',
    'docs/CODEX_RULE_ROUTER.md': '',
    'docs/ARCHITECTURE_BOUNDARY_STANDARD.md': '',
    'docs/API_CONTRACT_STANDARD.md': '',
    'docs/COMPONENT_STANDARD.md': '',
    'docs/TESTING_STANDARD.md': '',
    'docs/PERFORMANCE_BUDGET.md': '',
    'docs/SECURITY_FRONTEND_STANDARD.md': '',
    'docs/ACCESSIBILITY_STANDARD.md': ''
  };

  for (const [relativePath, content] of Object.entries({ ...files, ...overrides })) {
    if (content !== null) {
      writeFile(projectDir, relativePath, content);
    }
  }

  return projectDir;
}

function runGateClosure(projectDir) {
  return execFileSync(process.execPath, [scriptPath], {
    cwd: projectDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function expectGateFailure(projectDir, expectedMessage) {
  assert.throws(
    () => runGateClosure(projectDir),
    (error) => {
      const output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
      return output.includes(expectedMessage);
    }
  );
}

test('requires real CODEOWNERS instead of example-only ownership', () => {
  const projectDir = createGateProject({
    '.github/CODEOWNERS': null,
    '.github/CODEOWNERS.example':
      'packages/contracts/ @your-org/frontend-platform\npackages/ui/ @your-org/frontend-platform\napps/web/src/shared/api/ @your-org/frontend-platform\napps/web/src/shared/auth/ @your-org/frontend-platform\n'
  });

  expectGateFailure(projectDir, '.github/CODEOWNERS: required file is missing.');
});

test('requires CI coverage and e2e jobs in protected checks', () => {
  const projectDir = createGateProject({
    '.github/workflows/ci.yml': 'pull_request:\nrun: pnpm install --frozen-lockfile\nrun: pnpm verify\n',
    'docs/GITHUB_BRANCH_PROTECTION.md':
      'CI / verify\nCodex Review / codex_review\nDo not allow bypassing the above settings\n'
  });

  expectGateFailure(projectDir, 'CI / coverage');
});
