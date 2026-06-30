# Validation

Run commands from the repository root.

## Core

```powershell
pnpm format:check
pnpm lint
pnpm lint:style
pnpm lint:standards
pnpm lint:engineering
pnpm test
pnpm test:coverage
pnpm typecheck
pnpm build
pnpm check:gates
pnpm verify
```

## Focused

```powershell
pnpm --filter @agent-flow/contracts test
pnpm --filter @agent-flow/ui typecheck
pnpm --filter @agent-flow/mock-api test
pnpm --filter @agent-flow/web test
pnpm --filter @agent-flow/web test:e2e
pnpm verify:e2e
```

## Commit Gates

```powershell
pnpm commitlint --from HEAD~1 --to HEAD
pnpm precommit
```

Local Git hooks:

- `commit-msg`: validates Conventional Commit format.
- `pre-commit`: formats staged files, runs ESLint/Stylelint auto-fix, focused type checks, naming/comment/file-size checks, and gate-closure checks.
- `pre-push`: runs `pnpm verify`.

CI:

- `.github/workflows/ci.yml` runs `pnpm install --frozen-lockfile` and `pnpm verify`.
- `.github/workflows/codex-review.yml` runs Codex review and must emit `MERGE_DECISION: PASS`.
- `pnpm check:gates` verifies that local hooks, CI, Codex Review, AI bypass rules, and engineering-rule entrypoints are still wired.
- `pnpm test:coverage` and `pnpm verify:e2e` are optional local gates. Add them to required checks only after the real project has stable runtime fixtures and acceptable execution time.

Required merge checks are documented in `docs/GIT_MERGE_GATES.md`.
GitHub branch protection settings are documented in `docs/GITHUB_BRANCH_PROTECTION.md`.

## Manual Smoke

```powershell
pnpm dev
```

Open `http://127.0.0.1:5178`.

Check:

- Agent Studio loads without console errors.
- Task-session, workflow, and audit surfaces can be switched.
- Workflow canvas is visible and not blank.
- Agent and tool resource panels are left-aligned and scannable.
- Starting a mock run shows ordered runtime events.
- Pending human approval can be approved or rejected.
- Result artifact appears after approval.
- Route guard sends unauthorized routes to `/403`.
- Request failures surface as normalized errors instead of raw Axios errors.
- No nested cards, generic gradient treatment, or centered dashboard content.
