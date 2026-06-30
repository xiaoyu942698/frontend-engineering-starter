import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const defaultRequiredChecks = ['CI / verify', 'CI / coverage', 'CI / e2e', 'Codex Review / codex_review'];

export function buildBranchProtectionPayload(requiredChecks = defaultRequiredChecks) {
  return {
    required_status_checks: {
      strict: true,
      contexts: requiredChecks
    },
    enforce_admins: true,
    required_pull_request_reviews: {
      dismiss_stale_reviews: true,
      require_code_owner_reviews: true,
      required_approving_review_count: 1,
      require_last_push_approval: false
    },
    restrictions: null,
    required_conversation_resolution: true,
    required_linear_history: false,
    allow_force_pushes: false,
    allow_deletions: false,
    block_creations: false,
    lock_branch: false
  };
}

function readArg(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    ...options
  }).trim();
}

function resolveRepoSlug() {
  const explicitRepo = readArg('--repo', '');
  if (explicitRepo) return explicitRepo;

  const remoteUrl = run('git', ['remote', 'get-url', 'origin']);
  const httpsMatch = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/);
  if (!httpsMatch) {
    throw new Error(`Cannot resolve GitHub repo from origin URL: ${remoteUrl}`);
  }

  return `${httpsMatch[1]}/${httpsMatch[2]}`;
}

function configureBranchProtection() {
  const repo = resolveRepoSlug();
  const branch = readArg('--branch', 'main');
  const dryRun = process.argv.includes('--dry-run');
  const payload = buildBranchProtectionPayload();

  if (dryRun) {
    console.log(JSON.stringify({ repo, branch, payload }, null, 2));
    return;
  }

  run('gh', ['api', '--method', 'PUT', `repos/${repo}/branches/${branch}/protection`, '--input', '-'], {
    input: JSON.stringify(payload)
  });
  console.log(`Configured branch protection for ${repo}:${branch}`);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    configureBranchProtection();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
