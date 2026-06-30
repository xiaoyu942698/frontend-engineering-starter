# Agent Flow Starter

框架无关的智能体前端模板。它提供 Vue 3 + Element Plus 的通用 UI 框架层、Agent 运行能力组件、Fastify mock runtime、共享 contracts，以及面向 LangGraph、CrewAI、Mastra、OpenAI Agents SDK、Google ADK 等后端框架的适配边界。

## Stack

- Vue 3 + TypeScript + Vite
- Element Plus
- Pinia + Vue Router
- TanStack Vue Query + Axios
- Vue Flow
- Fastify mock API
- Zod contracts
- Design tokens and reusable Vue UI components
- Vitest + Playwright

## Structure

```text
agent-flow-starter/
  apps/
    web/          Vue Agent Studio
    mock-api/     REST + SSE mock runtime
  packages/
    contracts/    shared Agent/Tool/Workflow/Run schemas
    ui/           design tokens and reusable UI components
  docs/
```

Key front-end foundations:

- `apps/web/src/router`: route table, route meta typing, title/auth/permission guard.
- `apps/web/src/stores/auth-store.ts`: starter auth session, token, user, and permission state.
- `apps/web/src/shared/api`: Axios instance, `request<T>()`, Zod response validation, normalized errors.
- `apps/web/src/shared/auth`: route/action permission helpers and `v-permission`.
- `packages/ui`: design tokens, layout primitives, timeline/KV components, and `UiStateBlock`.

## Commands

```powershell
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm test:coverage
pnpm build
pnpm verify:e2e
```

Development URLs:

- Web: `http://127.0.0.1:5178`
- Mock API: `http://127.0.0.1:8787/api/runtime/snapshot`

Copy `apps/web/.env.example` when a project needs a local API base URL, auth storage key, or mock-auth switch.

## Design Rule

UI changes must pass `ai-ui-design-audit`: no decorative AI-looking gradients, no card nesting, no default-centered tool surfaces, and no repeated icon-card pattern. Theme color, secondary color, text color, state color, spacing, radius, and typography are centralized in `packages/ui/src/styles/tokens.css`. Mature controls come from Element Plus; local UI code should provide tokens, layout, and domain composition rather than another component framework.

## Engineering Rule

Department-level frontend rules live in `docs/FRONTEND_ENGINEERING_STANDARD.md`.
Human-readable architecture and boundary explanation lives in `docs/FRONTEND_BOUNDARY_GUIDE.md`.
New page and module templates live in `docs/FRONTEND_MODULE_TEMPLATE.md`.
Naming, comment, and single-file size rules live in `docs/NAMING_AND_COMMENT_STANDARD.md`.
Architecture, API, component, test, security, performance, accessibility, and Codex routing rules live in dedicated `docs/*STANDARD.md` and `docs/CODEX_RULE_ROUTER.md` files.
Commit, merge, CI, and Codex review gates live in `docs/GIT_MERGE_GATES.md`.
GitHub branch protection setup lives in `docs/GITHUB_BRANCH_PROTECTION.md`.

- Commit format: Conventional Commits, enforced by commitlint.
- Pre-commit: lint-staged formats changed files, runs ESLint/Stylelint auto-fix, focused type checks, naming/comment/file-size checks, engineering-rule checks, and gate-closure checks.
- Pre-push: `pnpm verify`.
- CI: `.github/workflows/ci.yml` runs `pnpm verify`; `.github/workflows/codex-review.yml` runs Codex review.
- Gate closure: `pnpm check:gates` verifies hooks, workflows, Codex review prompt, PR template, AI bypass rules, and required-check documentation are still present.
- Optional local gates: `pnpm test:coverage` generates coverage for core packages; `pnpm verify:e2e` runs the web Playwright smoke suite.
- Ownership template: `.github/CODEOWNERS.example` documents critical directories that should require owner review in the real GitHub repository.
- New shared frontend behavior belongs in `packages/ui` only when it is a thin adapter, layout shell, token, or cross-project composition helper.

## Code Structure Analysis

Use CodeGraph for code maps, callers/callees, entrypoints, and impact analysis. Do not add generated `docs/ai/code-map.md` or duplicate static module indexes.
