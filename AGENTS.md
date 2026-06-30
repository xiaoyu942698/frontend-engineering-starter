# Project Guide for Codex

## Required Entry

This file is the mandatory entry point for Codex work in this repository. Before changing code, Codex must use this file to route itself to the relevant docs, scripts, and verification commands.

Do not bypass this file by editing from a single source file alone. If a task touches UI, API, runtime, auth, tests, CI, dependencies, or Git workflow, follow the matching section below and the referenced document under `docs/`.

## Project Positioning

`agent-flow-starter` is a framework-neutral Agent front-end starter. It is not a SaaS landing page and not a single fixed dashboard. The project should provide a reusable UI framework layer plus Agent runtime capability components that can be composed into task-session, workflow-console, audit, approval, or artifact views.

## CodeGraph

- Before structure, entrypoint, routing, caller/callee, or impact analysis, run:
  `powershell -ExecutionPolicy Bypass -File C:\Users\joker\.codex\scripts\ensure-codegraph-global.ps1`
- Use CodeGraph MCP first for project structure and code relationships.
- Do not generate separate static code maps such as `docs/ai/code-map.md` or `module-index.md`.
- Use `rg` only for exact text search or when CodeGraph results are insufficient.

## Tech Stack

- Workspace package manager: pnpm
- Web: Vue 3, TypeScript, Vite, Element Plus, Pinia, Vue Router, TanStack Vue Query, Axios, Vue Flow
- Mock API: Node.js, TypeScript, Fastify
- Shared UI: local `@agent-flow/ui` package with design tokens and reusable Vue components
- Shared contracts: Zod
- Tests: Vitest and Playwright

## Boundaries

- `packages/contracts` owns shared schemas and types.
- `packages/ui` owns design tokens and generic UI components.
- `apps/mock-api` owns mock runtime behavior and SSE event streaming.
- `apps/web` owns Agent domain components, runtime adapter usage, and demo composition.
- Real LLM calls and real secrets are out of scope for this starter.

## Engineering Standard

- Follow `docs/FRONTEND_ENGINEERING_STANDARD.md` for department-level frontend architecture rules.
- Use `docs/FRONTEND_BOUNDARY_GUIDE.md` when the user needs a plain-language explanation of where code belongs and why a boundary exists.
- Follow `docs/CODEX_RULE_ROUTER.md` to choose task-specific rules internally without exposing long rule lists to ordinary users.
- Follow `docs/ARCHITECTURE_BOUNDARY_STANDARD.md` for feature, shared, package, API, runtime, style-token, and dependency boundaries.
- Follow `docs/API_CONTRACT_STANDARD.md`, `docs/COMPONENT_STANDARD.md`, `docs/TESTING_STANDARD.md`, `docs/SECURITY_FRONTEND_STANDARD.md`, `docs/PERFORMANCE_BUDGET.md`, and `docs/ACCESSIBILITY_STANDARD.md` according to task type.
- Follow `docs/NAMING_AND_COMMENT_STANDARD.md` for class naming, function naming, TSDoc, TODO, comment density, and single-file size rules.
- Follow `docs/GIT_MERGE_GATES.md` for commit, push, CI, and Codex review gate requirements.
- Follow `docs/GITHUB_BRANCH_PROTECTION.md` when configuring remote required checks.
- Use `docs/FRONTEND_MODULE_TEMPLATE.md` when adding pages or modules.
- Prefer `pnpm scaffold:feature <feature-name> --title <title> --permission <domain:action>` for new feature modules, then wire the route intentionally.
- Route-level auth and permissions must use route meta plus `apps/web/src/router` guards.
- HTTP calls must go through `apps/web/src/shared/api/client.ts`; feature components must not call Axios directly.
- Loading, empty, and error states should reuse `UiStateBlock` or Element Plus primitives according to the frontend standard.
- Use Conventional Commits: `<type>(<scope>): <subject>`.
- Allowed commit scopes are defined in `commitlint.config.cjs`.
- When Codex or any AI agent performs commit, push, PR, or merge work, it must not use `--no-verify`, skip Husky hooks, skip `pnpm verify`, bypass required GitHub checks, force-push to protected branches, or ask the user to merge around failed checks.
- Manual human `--no-verify` use is outside AI automation policy, but any later AI-assisted PR must still pass the full local and GitHub gates.
- Before adding a shared frontend abstraction, verify whether Element Plus, Vue Flow, TanStack Vue Query, Axios, Zod, or another approved dependency already solves it.

## Review Guidelines

- Treat violations of `docs/NAMING_AND_COMMENT_STANDARD.md` as merge-blocking unless the PR explicitly documents an approved exception.
- Check that new CSS classes use approved namespaces and kebab/BEM form.
- Check that new functions use action-oriented names and avoid vague names such as `processData`, `handleData`, `temp`, or `foo`.
- Check that exported public APIs have useful TSDoc and that comments explain intent rather than restating code.
- Check that TODO comments use `TODO(scope): message` format and that commented-out old code is removed.
- Check that new or modified source files stay within documented line and byte limits.
- Check architecture/API/component/security/performance/accessibility rules when the PR touches those areas.
- Check that `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm check:gates` evidence is included before recommending merge.
- Check that `pnpm test:coverage` and `pnpm verify:e2e` evidence is included before recommending merge when touching required checks or the covered surfaces.
- Treat any AI-authored commit, push, or merge that used `--no-verify` or bypassed required checks as merge-blocking.

## UI Standard

Apply global `ai-ui-design-audit` for all UI work:

- Remove unnecessary card wrappers and never nest cards.
- Avoid generic purple/blue gradients, glow, glassmorphism, and gradient text.
- Do not rebuild mature Element Plus controls; wrap or compose them only when shared tokens, layout, or domain mapping are needed.
- Use clear type hierarchy and readable line height.
- Use left alignment for tool surfaces, lists, workflow details, and explanatory content.
- Avoid repeated rounded icon tiles above headings.
- Keep theme color, secondary color, text color, prompt color, spacing, radius, and typography variables centralized in `packages/ui/src/styles/tokens.css`.

## Verification

Run the smallest relevant command after changes:

```powershell
pnpm format:check
pnpm lint
pnpm lint:engineering
pnpm test:coverage
pnpm --filter @agent-flow/contracts test
pnpm --filter @agent-flow/mock-api test
pnpm --filter @agent-flow/web test
pnpm typecheck
pnpm build
pnpm check:gates
pnpm verify:e2e
```

For UI changes, also run or manually smoke the app at `http://127.0.0.1:5178`.
Use `pnpm verify:e2e` when the changed surface affects routing, permissions, runtime flow, approvals, or visible user journeys.
