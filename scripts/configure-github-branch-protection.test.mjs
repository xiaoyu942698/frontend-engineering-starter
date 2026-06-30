import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBranchProtectionPayload } from './configure-github-branch-protection.mjs';

test('builds branch protection payload with required checks and owner review', () => {
  const payload = buildBranchProtectionPayload([
    'CI / verify',
    'CI / coverage',
    'CI / e2e',
    'Codex Review / codex_review'
  ]);

  assert.equal(payload.enforce_admins, true);
  assert.equal(payload.allow_force_pushes, false);
  assert.equal(payload.allow_deletions, false);
  assert.equal(payload.required_pull_request_reviews.require_code_owner_reviews, true);
  assert.equal(payload.required_pull_request_reviews.dismiss_stale_reviews, true);
  assert.deepEqual(payload.required_status_checks.contexts, [
    'CI / verify',
    'CI / coverage',
    'CI / e2e',
    'Codex Review / codex_review'
  ]);
});
