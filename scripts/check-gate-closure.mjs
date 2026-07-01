import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const failures = [];

function readText(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`${relativePath}: required file is missing.`);
    return '';
  }

  return fs.readFileSync(absolutePath, 'utf8');
}

function readJson(relativePath) {
  const content = readText(relativePath);
  if (!content) return {};

  try {
    return JSON.parse(content);
  } catch (error) {
    failures.push(`${relativePath}: invalid JSON - ${error.message}`);
    return {};
  }
}

function requireIncludes(relativePath, content, expected, reason) {
  if (!content.includes(expected)) {
    failures.push(`${relativePath}: missing "${expected}" (${reason}).`);
  }
}

function requireScript(scriptName, scriptValue, requiredParts) {
  if (!scriptValue) {
    failures.push(`package.json: missing script "${scriptName}".`);
    return;
  }

  for (const requiredPart of requiredParts) {
    if (!scriptValue.includes(requiredPart)) {
      failures.push(`package.json: script "${scriptName}" must include "${requiredPart}".`);
    }
  }
}

const packageJson = readJson('package.json');
const scripts = packageJson.scripts ?? {};

requireScript('precommit', scripts.precommit, ['lint-staged', 'lint:standards', 'lint:engineering', 'check:gates']);
requireScript('verify', scripts.verify, ['format:check', 'lint', 'test', 'build', 'check:gates']);
requireScript('lint', scripts.lint, ['lint:standards', 'lint:engineering']);
requireScript('test', scripts.test, ['test:standards', 'test:engineering']);
requireScript('lint:engineering', scripts['lint:engineering'], ['scripts/check-engineering-rules.mjs']);
requireScript('test:engineering', scripts['test:engineering'], ['scripts/check-engineering-rules.test.mjs']);
requireScript('test:coverage', scripts['test:coverage'], [
  '@agent-flow/contracts',
  '@agent-flow/mock-api',
  '@agent-flow/web'
]);
requireScript('verify:e2e', scripts['verify:e2e'], ['@agent-flow/web', 'test:e2e']);
requireScript('check:gates', scripts['check:gates'], ['scripts/check-gate-closure.mjs']);
requireScript('scaffold:feature', scripts['scaffold:feature'], ['scripts/scaffold-feature.mjs']);
requireScript('protect:github', scripts['protect:github'], ['scripts/configure-github-branch-protection.mjs']);

const license = readText('LICENSE');
requireIncludes('LICENSE', license, 'MIT License', 'public template must declare the chosen license');
requireIncludes('LICENSE', license, 'Permission is hereby granted', 'MIT grant terms must stay intact');

const gitAttributes = readText('.gitattributes');
requireIncludes(
  '.gitattributes',
  gitAttributes,
  '* text=auto eol=lf',
  'text files must check out with LF for deterministic formatting'
);

const starterVersion = readText('.starter-version');
requireIncludes(
  '.starter-version',
  starterVersion,
  'frontend-engineering-starter@',
  'template version must be traceable'
);

const rootEnvExample = readText('.env.example');
requireIncludes('.env.example', rootEnvExample, 'VITE_API_BASE_URL=', 'root env example must show API base URL');
requireIncludes('.env.example', rootEnvExample, 'VITE_ENABLE_MOCK_AUTH=', 'root env example must show mock-auth flag');

const webEnvExample = readText('apps/web/.env.example');
requireIncludes('apps/web/.env.example', webEnvExample, 'VITE_API_BASE_URL=', 'web env example must show API base URL');
requireIncludes(
  'apps/web/.env.example',
  webEnvExample,
  'VITE_AUTH_STORAGE_KEY=',
  'web env example must show auth storage key'
);
requireIncludes(
  'apps/web/.env.example',
  webEnvExample,
  'VITE_REQUEST_TIMEOUT_MS=',
  'web env example must show request timeout'
);
requireIncludes(
  'apps/web/.env.example',
  webEnvExample,
  'VITE_ENABLE_MOCK_AUTH=',
  'web env example must show mock-auth flag'
);

const readme = readText('README.md');
requireIncludes('README.md', readme, 'Use this template', 'README must explain template creation flow');
requireIncludes('README.md', readme, '不要 fork', 'README must warn downstream projects not to fork');
requireIncludes('README.md', readme, 'AGENTS.md', 'README must keep Codex entrypoint discoverable');
requireIncludes('README.md', readme, 'docs/TEAM_TEMPLATE_GUIDE.md', 'README must link team template guide');

const rolloutPlan = readText('docs/CODEX_TEMPLATE_ROLLOUT_PLAN.md');
requireIncludes(
  'docs/CODEX_TEMPLATE_ROLLOUT_PLAN.md',
  rolloutPlan,
  'Public Release Checklist',
  'rollout plan must keep release checklist'
);
requireIncludes('docs/CODEX_TEMPLATE_ROLLOUT_PLAN.md', rolloutPlan, 'LICENSE', 'rollout plan must mention license');
requireIncludes(
  'docs/CODEX_TEMPLATE_ROLLOUT_PLAN.md',
  rolloutPlan,
  '固定 MIT',
  'rollout plan must treat MIT as the fixed template license'
);
requireIncludes(
  'docs/CODEX_TEMPLATE_ROLLOUT_PLAN.md',
  rolloutPlan,
  '.env.example',
  'rollout plan must mention environment examples'
);
requireIncludes(
  'docs/CODEX_TEMPLATE_ROLLOUT_PLAN.md',
  rolloutPlan,
  '.github/CODEOWNERS.example',
  'rollout plan must mention CODEOWNERS example'
);
requireIncludes(
  'docs/CODEX_TEMPLATE_ROLLOUT_PLAN.md',
  rolloutPlan,
  '.starter-version',
  'rollout plan must mention starter version'
);

const teamTemplateGuide = readText('docs/TEAM_TEMPLATE_GUIDE.md');
requireIncludes(
  'docs/TEAM_TEMPLATE_GUIDE.md',
  teamTemplateGuide,
  'Use this template',
  'team guide must explain template flow'
);
requireIncludes('docs/TEAM_TEMPLATE_GUIDE.md', teamTemplateGuide, '不要 fork', 'team guide must warn against forks');
requireIncludes('docs/TEAM_TEMPLATE_GUIDE.md', teamTemplateGuide, 'AGENTS.md', 'team guide must keep Codex entrypoint');
requireIncludes(
  'docs/TEAM_TEMPLATE_GUIDE.md',
  teamTemplateGuide,
  '.starter-version',
  'team guide must mention starter version'
);

const preCommit = readText('.husky/pre-commit');
requireIncludes('.husky/pre-commit', preCommit, 'pnpm precommit', 'local commit gate must run precommit');

const commitMsg = readText('.husky/commit-msg');
requireIncludes('.husky/commit-msg', commitMsg, 'pnpm commitlint', 'commit message gate must run commitlint');

const prePush = readText('.husky/pre-push');
requireIncludes('.husky/pre-push', prePush, 'pnpm verify', 'local push gate must run verify');

const ciWorkflow = readText('.github/workflows/ci.yml');
requireIncludes('.github/workflows/ci.yml', ciWorkflow, 'pull_request:', 'CI must run on pull requests');
requireIncludes(
  '.github/workflows/ci.yml',
  ciWorkflow,
  'pnpm install --frozen-lockfile',
  'CI must install locked deps'
);
requireIncludes('.github/workflows/ci.yml', ciWorkflow, 'pnpm verify', 'CI must run deterministic verify');
requireIncludes('.github/workflows/ci.yml', ciWorkflow, 'coverage:', 'CI must expose a required coverage job');
requireIncludes('.github/workflows/ci.yml', ciWorkflow, 'pnpm test:coverage', 'CI must run coverage gates');
requireIncludes('.github/workflows/ci.yml', ciWorkflow, 'e2e:', 'CI must expose a required e2e job');
requireIncludes('.github/workflows/ci.yml', ciWorkflow, 'pnpm verify:e2e', 'CI must run e2e smoke gates');

const codexWorkflow = readText('.github/workflows/codex-review.yml');
requireIncludes('.github/workflows/codex-review.yml', codexWorkflow, 'openai/codex-action@v1', 'Codex review action');
requireIncludes('.github/workflows/codex-review.yml', codexWorkflow, 'secrets.OPENAI_API_KEY', 'Codex review secret');
requireIncludes(
  '.github/workflows/codex-review.yml',
  codexWorkflow,
  'prompt-file: .github/codex/prompts/review.md',
  'shared review prompt'
);
requireIncludes(
  '.github/workflows/codex-review.yml',
  codexWorkflow,
  'output-file: codex-review.md',
  'review output must be auditable'
);
requireIncludes(
  '.github/workflows/codex-review.yml',
  codexWorkflow,
  'MERGE_DECISION: BLOCK',
  'blocking decision must fail'
);
requireIncludes(
  '.github/workflows/codex-review.yml',
  codexWorkflow,
  'MERGE_DECISION: PASS',
  'passing decision must be explicit'
);

const codexPrompt = readText('.github/codex/prompts/review.md');
requireIncludes(
  '.github/codex/prompts/review.md',
  codexPrompt,
  'MERGE_DECISION: PASS',
  'review must emit pass decision'
);
requireIncludes(
  '.github/codex/prompts/review.md',
  codexPrompt,
  'MERGE_DECISION: BLOCK',
  'review must emit block decision'
);
requireIncludes('.github/codex/prompts/review.md', codexPrompt, '--no-verify', 'review must check AI bypass');
requireIncludes(
  '.github/codex/prompts/review.md',
  codexPrompt,
  'pnpm verify',
  'review must require verification evidence'
);
requireIncludes(
  '.github/codex/prompts/review.md',
  codexPrompt,
  'pnpm test:coverage',
  'review must require coverage evidence'
);
requireIncludes('.github/codex/prompts/review.md', codexPrompt, 'pnpm verify:e2e', 'review must require e2e evidence');
requireIncludes(
  '.github/codex/prompts/review.md',
  codexPrompt,
  'naming/comment/file-size',
  'review must check standards gates'
);
requireIncludes(
  '.github/codex/prompts/review.md',
  codexPrompt,
  'architecture/API/component/security/performance/accessibility',
  'review must check engineering standards'
);

const pullRequestTemplate = readText('.github/pull_request_template.md');
requireIncludes(
  '.github/pull_request_template.md',
  pullRequestTemplate,
  'pnpm lint:standards',
  'PR must expose standards gate'
);
requireIncludes(
  '.github/pull_request_template.md',
  pullRequestTemplate,
  'pnpm lint:engineering',
  'PR must expose engineering gate'
);
requireIncludes('.github/pull_request_template.md', pullRequestTemplate, 'pnpm build', 'PR must expose build evidence');
requireIncludes(
  '.github/pull_request_template.md',
  pullRequestTemplate,
  '--no-verify',
  'PR must disclose AI bypass policy'
);
requireIncludes(
  '.github/pull_request_template.md',
  pullRequestTemplate,
  'Codex Review / codex_review',
  'PR must expose Codex required check'
);
requireIncludes(
  '.github/pull_request_template.md',
  pullRequestTemplate,
  'CI / coverage',
  'PR must expose coverage required check'
);
requireIncludes(
  '.github/pull_request_template.md',
  pullRequestTemplate,
  'CI / e2e',
  'PR must expose e2e required check'
);

const codeOwnersExample = readText('.github/CODEOWNERS.example');
requireIncludes(
  '.github/CODEOWNERS.example',
  codeOwnersExample,
  'packages/contracts/',
  'contracts owner must be documented'
);
requireIncludes('.github/CODEOWNERS.example', codeOwnersExample, 'packages/ui/', 'ui owner must be documented');
requireIncludes(
  '.github/CODEOWNERS.example',
  codeOwnersExample,
  'apps/web/src/shared/api/',
  'api owner must be documented'
);
requireIncludes(
  '.github/CODEOWNERS.example',
  codeOwnersExample,
  'apps/web/src/shared/auth/',
  'auth owner must be documented'
);

const codeOwners = readText('.github/CODEOWNERS');
requireIncludes('.github/CODEOWNERS', codeOwners, 'packages/contracts/', 'contracts owner must be enforced');
requireIncludes('.github/CODEOWNERS', codeOwners, 'packages/ui/', 'ui owner must be enforced');
requireIncludes('.github/CODEOWNERS', codeOwners, 'apps/web/src/shared/api/', 'api owner must be enforced');
requireIncludes('.github/CODEOWNERS', codeOwners, 'apps/web/src/shared/auth/', 'auth owner must be enforced');
requireIncludes('.github/CODEOWNERS', codeOwners, 'apps/web/src/shared/runtime/', 'runtime owner must be enforced');

const branchProtectionScript = readText('scripts/configure-github-branch-protection.mjs');
requireIncludes(
  'scripts/configure-github-branch-protection.mjs',
  branchProtectionScript,
  'Codex Review / codex_review',
  'branch protection script must configure Codex review'
);
requireIncludes(
  'scripts/configure-github-branch-protection.mjs',
  branchProtectionScript,
  'CI / coverage',
  'branch protection script must configure coverage'
);
requireIncludes(
  'scripts/configure-github-branch-protection.mjs',
  branchProtectionScript,
  'require_code_owner_reviews: true',
  'branch protection script must require code owner reviews'
);

const agentGuide = readText('AGENTS.md');
requireIncludes('AGENTS.md', agentGuide, '--no-verify', 'AI agents must not bypass local hooks');
requireIncludes('AGENTS.md', agentGuide, 'pnpm verify', 'AI agents must run verification before merge claims');
requireIncludes('AGENTS.md', agentGuide, 'required GitHub checks', 'AI agents must not bypass remote checks');
requireIncludes(
  'AGENTS.md',
  agentGuide,
  'FRONTEND_BOUNDARY_GUIDE',
  'plain-language boundary guide must stay discoverable'
);
requireIncludes('AGENTS.md', agentGuide, 'CODEX_RULE_ROUTER', 'AI agents must route task-specific rules');

const gateDoc = readText('docs/GIT_MERGE_GATES.md');
requireIncludes('docs/GIT_MERGE_GATES.md', gateDoc, 'CI / verify', 'required deterministic check must be documented');
requireIncludes(
  'docs/GIT_MERGE_GATES.md',
  gateDoc,
  'Codex Review / codex_review',
  'required Codex check must be documented'
);
requireIncludes('docs/GIT_MERGE_GATES.md', gateDoc, 'OPENAI_API_KEY', 'Codex review secret must be documented');
requireIncludes('docs/GIT_MERGE_GATES.md', gateDoc, '--no-verify', 'AI bypass policy must be documented');
requireIncludes('docs/GIT_MERGE_GATES.md', gateDoc, 'pnpm lint:engineering', 'engineering gate must be documented');
requireIncludes('docs/GIT_MERGE_GATES.md', gateDoc, 'CI / coverage', 'coverage required check must be documented');
requireIncludes('docs/GIT_MERGE_GATES.md', gateDoc, 'CI / e2e', 'e2e required check must be documented');
requireIncludes('docs/GIT_MERGE_GATES.md', gateDoc, 'pnpm test:coverage', 'coverage command must be documented');
requireIncludes('docs/GIT_MERGE_GATES.md', gateDoc, 'pnpm verify:e2e', 'e2e command must be documented');

const branchProtectionDoc = readText('docs/GITHUB_BRANCH_PROTECTION.md');
requireIncludes(
  'docs/GITHUB_BRANCH_PROTECTION.md',
  branchProtectionDoc,
  'CI / verify',
  'branch protection must require CI'
);
requireIncludes(
  'docs/GITHUB_BRANCH_PROTECTION.md',
  branchProtectionDoc,
  'Codex Review / codex_review',
  'branch protection must require Codex review'
);
requireIncludes(
  'docs/GITHUB_BRANCH_PROTECTION.md',
  branchProtectionDoc,
  'CI / coverage',
  'branch protection must require coverage'
);
requireIncludes(
  'docs/GITHUB_BRANCH_PROTECTION.md',
  branchProtectionDoc,
  'CI / e2e',
  'branch protection must require e2e'
);
requireIncludes(
  'docs/GITHUB_BRANCH_PROTECTION.md',
  branchProtectionDoc,
  'Do not allow bypassing the above settings',
  'branch protection must block admin bypass'
);

for (const requiredDoc of [
  'docs/FRONTEND_BOUNDARY_GUIDE.md',
  'docs/CODEX_RULE_ROUTER.md',
  'docs/ARCHITECTURE_BOUNDARY_STANDARD.md',
  'docs/API_CONTRACT_STANDARD.md',
  'docs/COMPONENT_STANDARD.md',
  'docs/TESTING_STANDARD.md',
  'docs/PERFORMANCE_BUDGET.md',
  'docs/SECURITY_FRONTEND_STANDARD.md',
  'docs/ACCESSIBILITY_STANDARD.md'
]) {
  readText(requiredDoc);
}

if (failures.length > 0) {
  console.error('Gate closure check failed:\n');
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Gate closure check passed.');
