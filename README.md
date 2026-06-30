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

## How To Use

这个仓库不是某一种业务系统模板，而是一套前端工程化底座。后面可以长成后台、Agent 产品、运营工具或别的系统，但新增代码都先按同一套基础规矩来。

最常用流程：

1. 安装依赖：`pnpm install`
2. 本地启动：`pnpm dev`
3. 新增模块：`pnpm scaffold:feature approval-center --title 审批中心 --permission approval:read`
4. 手动把新模块 route 接入 `apps/web/src/router/index.ts`
5. 开发时请求走 `shared/api`，权限走 route meta 和 `v-permission`，UI 优先用 Element Plus 和 `packages/ui`
6. 提交前跑：`pnpm verify`
7. 改了核心链路或可见流程时，加跑：`pnpm test:coverage` 和 `pnpm verify:e2e`

记住三条硬规则：

- 组件里不要直接写 `axios`，统一走 `apps/web/src/shared/api`。
- 不要在业务页面里新建一套颜色、按钮、弹窗或表格体系，先用 Element Plus 和 UI token。
- 新模块不要手写散乱目录，先用 `pnpm scaffold:feature` 生成骨架。

## Codex Entry

让 Codex 接入开发时，把入口固定在根目录 `AGENTS.md`。这是本仓库给 Codex 的必走规则文件。

给 Codex 派活时可以直接这样说：

```text
先阅读并遵守根目录 AGENTS.md。新增模块优先使用 pnpm scaffold:feature。提交前必须运行对应验证命令，不允许使用 --no-verify，不允许绕过 pnpm verify、pnpm test:coverage、pnpm verify:e2e 或 check:gates。
```

Codex 需要按 `AGENTS.md` 再去查具体规则文档，例如架构边界、API、组件、测试、安全、性能、可访问性和 Git 门禁。不要让 Codex 只看某个页面文件就直接改。

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
pnpm scaffold:feature approval-center --title 审批中心 --permission approval:read
pnpm protect:github --branch main
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
- CI: `.github/workflows/ci.yml` exposes `CI / verify`, `CI / coverage`, and `CI / e2e`; `.github/workflows/codex-review.yml` exposes `Codex Review / codex_review`.
- Gate closure: `pnpm check:gates` verifies hooks, workflows, Codex review prompt, PR template, CODEOWNERS, AI bypass rules, and required-check documentation are still present.
- Coverage gate: `pnpm test:coverage` enforces core contracts, mock runtime, and web shared/auth/api/runtime/store coverage thresholds.
- E2E gate: `pnpm verify:e2e` runs desktop and mobile Playwright smoke tests against the web app and mock API.
- Ownership: `.github/CODEOWNERS` protects critical directories; `.github/CODEOWNERS.example` is only a downstream replacement template.
- Module scaffold: `pnpm scaffold:feature <feature-name> --title <中文标题> --permission <domain:action>` creates the standard feature skeleton.
- Remote protection: `pnpm protect:github --branch main` applies required checks and Code Owner review through the GitHub API when the operator has admin permission and the GitHub plan supports branch protection.
- New shared frontend behavior belongs in `packages/ui` only when it is a thin adapter, layout shell, token, or cross-project composition helper.

## Code Structure Analysis

Use CodeGraph for code maps, callers/callees, entrypoints, and impact analysis. Do not add generated `docs/ai/code-map.md` or duplicate static module indexes.
