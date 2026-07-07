# Codex 新项目初始化 Runbook

本文档给 Codex 或其他 AI agent 直接执行。目标是：用户只提供新项目地址、项目名和是否需要远端仓库，Codex 就能基于 `frontend-engineering-starter` 模板生成一个可运行、可验证、后续继续按本工程化规范开发的新项目。

模板仓库地址：`https://github.com/xiaoyu942698/frontend-engineering-starter.git`

模板分支：`main`

普通用户不需要记命令。用户只需要告诉 Codex：

```text
请按 https://github.com/xiaoyu942698/frontend-engineering-starter.git 模板帮我创建新项目：
- 新项目目录：D:\Work\MyProject
- 项目名：my-project
- 模板分支：main
- 先只在本地创建，暂时不推远端
```

## 输入契约

Codex 开始前必须拿到这些输入：

- `targetPath`：新项目本地目录，例如 `D:\Work\MyProject`。
- `projectName`：新项目包名，使用 npm package name 规则，例如 `my-project`。
- `creationMode`：`local-only` 或 `existing-remote`。
- `remoteUrl`：只有 `existing-remote` 时需要，例如 `git@github.com:org/my-project.git`。
- `templateRepoUrl`：模板仓库地址，默认使用 `https://github.com/xiaoyu942698/frontend-engineering-starter.git`。
- `templateBranch`：模板分支，默认使用 `main`。
- `repoLayout`：`standalone-frontend` 或 `fullstack-monorepo`，默认使用 `standalone-frontend`。

可选输入：

- `projectTitle`：README 和页面标题使用的人类可读名称。
- `owner`：`.github/CODEOWNERS` 的团队或账号。
- `initialFeature`：初始化后要不要顺手创建第一个业务模块。
- `enableLocalDemoAuth`：是否创建本地演示登录配置，默认使用 `true`。
- `monorepoRoot`：前后端同仓根目录，例如 `D:\Work\MyFullstack`。
- `frontendPath`：前后端同仓里的前端目录，例如 `D:\Work\MyFullstack\frontend`。

如果缺少 `targetPath` 或 `projectName`，先问用户。其他输入缺失时使用保守默认值：本地创建、不配置远端、不创建业务模块。

## 关键判断

My recommendation: 默认走 `local-only`，先在本地把项目搭好、跑通验证，再由用户决定是否创建远端仓库。

Why: 这样不会误推未确认的模板项目，也不会要求用户先在 GitHub 建仓。Codex 可以把本地目录准备完整，后续只需要加 remote、push、配置 secrets 和 branch protection。

Rejected alternatives:

- 直接在当前模板仓库里新建业务代码：会污染模板。
- fork 模板仓库：会把业务历史和模板历史绑在一起。
- 手动复制零散文件：容易漏掉 scripts、hooks、CI、Codex Review 或 `.starter-version`。

What would change my mind: 用户明确给出一个已创建的空远端仓库，并要求初始化后直接推送。

## 安全约束

- 不要在模板仓库里写业务代码。
- 不要复制模板仓库的 `.git`。
- 不要复制 `node_modules`、`dist`、`coverage`、`test-results`、`playwright-report`、`.codegraph`、`.codex-temp`。
- 不要把真实 token、生产 endpoint、账号密码写入 `.env.example`。
- 不要覆盖非空目标目录，除非用户明确允许并且 Codex 已经列出将要覆盖的内容。
- 不要使用 `--no-verify`。
- 提交、推送或 PR 前必须运行本项目定义的验证命令。

## 步骤一：确认模板源

默认模板源是：

```text
https://github.com/xiaoyu942698/frontend-engineering-starter.git
```

默认模板分支是：

```text
main
```

如果 Codex 已经在模板仓库工作区内，先执行：

```powershell
git rev-parse --show-toplevel
git remote get-url origin
git branch --show-current
git status --short --branch
Get-Content .starter-version
```

要求：

- `git remote get-url origin` 指向 `https://github.com/xiaoyu942698/frontend-engineering-starter.git`。
- `git branch --show-current` 是 `main`，或 Codex 明确说明当前使用的模板分支不是默认分支。
- 模板源不是目标项目目录。
- `.starter-version` 存在。
- 模板源应该尽量干净。若存在未提交变更，先说明这些变更不会被默认的 `git archive` 带入新项目，除非用户要求先提交模板变更。

如果 Codex 不在模板仓库工作区内，先把模板仓库临时克隆到系统临时目录，再从这个临时目录生成新项目。

## 步骤二：确认目标目录

Codex 必须检查：

```powershell
Test-Path -LiteralPath '<targetPath>'
```

处理规则：

- 目录不存在：创建目录。
- 目录存在且为空：可以继续。
- 目录存在且包含 `.git`：按 `existing-remote` 或已有本地仓库处理，但必须确认没有业务文件会被覆盖。
- 目录存在且非空、没有 `.git`：停止并让用户确认是否换目录或允许覆盖。
- 目标目录不能位于模板仓库内部。
- `repoLayout=standalone-frontend` 时，`targetPath` 是新前端项目根目录。
- `repoLayout=fullstack-monorepo` 时，`targetPath` 应等于 `frontendPath`，`monorepoRoot` 是已有或待创建的业务项目根目录。
- 前后端同仓时，不能在 `frontendPath` 里创建嵌套 `.git`；Git 只归属 `monorepoRoot`。

## 步骤三：从模板生成干净项目

优先从模板远端 `main` 分支生成项目，避免复制 `.git`、依赖缓存和本地临时文件。

```powershell
$templateRepo = 'https://github.com/xiaoyu942698/frontend-engineering-starter.git'
$templateBranch = 'main'
$source = Join-Path $env:TEMP 'frontend-engineering-starter-template-source'
$target = '<targetPath>'
$archive = Join-Path $env:TEMP 'frontend-engineering-starter-template.zip'

Remove-Item -LiteralPath $archive -Force -ErrorAction SilentlyContinue
if (Test-Path -LiteralPath $source) {
  Remove-Item -LiteralPath $source -Recurse -Force
}
git clone --branch $templateBranch --depth 1 $templateRepo $source
New-Item -ItemType Directory -Force -Path $target | Out-Null

Push-Location $source
git archive --format=zip --output=$archive $templateBranch
Pop-Location

Expand-Archive -LiteralPath $archive -DestinationPath $target -Force
Remove-Item -LiteralPath $archive -Force
```

如果用户明确要求包含某个本地模板工作区的未提交变更，不能使用远端临时克隆和默认 `git archive`。改用受控复制，并显式排除：

```powershell
robocopy $source $target /E /XD .git node_modules dist coverage test-results playwright-report .codegraph .codex-temp /XF .env .env.local
```

受控复制前必须再次确认目标目录不会被误覆盖。

## 步骤四：初始化新项目 Git

如果 `repoLayout=standalone-frontend` 且目标目录还没有 `.git`：

```powershell
Set-Location <targetPath>
git init -b main
```

如果 `repoLayout=fullstack-monorepo`：

- 不要在 `frontendPath` 内执行 `git init`。
- 如果 `monorepoRoot` 已经有 `.git`，继续使用业务仓库根目录的 Git。
- 如果 `monorepoRoot` 还没有 `.git`，只有在用户明确要求初始化整个前后端同仓项目时，才在 `monorepoRoot` 执行 `git init -b main`。

如果用户提供了远端：

```powershell
git remote add origin <remoteUrl>
```

不要自动 push，除非用户明确要求。

## 步骤五：项目个性化

Codex 至少要处理这些位置：

- `package.json`
  - `name` 改为 `projectName`。
  - `description` 改为业务项目描述；缺省可写 `Frontend application based on frontend-engineering-starter.`。
  - 保留 `packageManager`、scripts、engines 和工程依赖。
- `README.md`
  - H1 改为 `projectTitle` 或 `projectName`。
  - 开头说明这是基于 `frontend-engineering-starter` 初始化的业务项目。
  - 保留 Codex 入口、开发命令、目录说明和升级说明。
- `.starter-version`
  - 保留模板版本，用来追踪上游基座来源。
- `.github/CODEOWNERS`
  - 如果用户提供 `owner`，替换为真实 owner。
  - 如果没有 owner，保留文件但在最终回复提示用户配置。
- `.env.example` 和 `apps/web/.env.example`
  - 只保留示例值。
  - 不写真实密钥。
  - 保持 `VITE_ENABLE_MOCK_AUTH=false`，不要为了本地演示改动示例文件。

本地演示登录单独写入不提交的 app 级环境文件。默认允许 Codex 创建：

```powershell
Copy-Item apps/web/.env.example apps/web/.env.local -Force
```

并在 `apps/web/.env.local` 中设置：

```text
VITE_ENABLE_MOCK_AUTH=true
```

说明：`.env.local` 已被 `.gitignore` 忽略，只用于本机演示。Codex 不得提交 `.env.local`，也不得把 `VITE_ENABLE_MOCK_AUTH=true` 写进 `.env.example`、CI 或生产配置。

不要删除：

- `AGENTS.md`
- `docs/`
- `scripts/`
- `.github/workflows/`
- `.github/codex/`
- `.husky/`
- `packages/contracts`
- `packages/ui`
- `apps/mock-api`
- `apps/web`

这些是后续 Codex 开发继续遵守工程化规范的基础。

## 步骤六：安装和验证

在前端项目目录执行。独立前端仓库时进入 `targetPath`；前后端同仓时进入 `frontendPath`：

```powershell
corepack enable
corepack pnpm install
corepack pnpm verify
```

需要验证页面、路由权限、运行流、审批和产物展示时，再执行：

```powershell
$env:VITE_ENABLE_MOCK_AUTH='true'
corepack pnpm verify:e2e
```

说明：模板默认关闭 mock auth。没有 `apps/web/.env.local` 或临时 `VITE_ENABLE_MOCK_AUTH=true` 时，首页可能因权限守卫进入 `/403`，这不是页面缺失，而是测试环境没有本地登录态。

## 步骤七：本地启动

本地启动前，确认本机演示登录配置存在：

```powershell
Test-Path apps/web/.env.local
```

如果不存在且用户没有禁用本地演示登录，按步骤五创建 `apps/web/.env.local` 并开启 `VITE_ENABLE_MOCK_AUTH=true`。

```powershell
corepack pnpm dev
```

检查：

- Web：`http://127.0.0.1:5178`
- Mock API：`http://127.0.0.1:8787/api/runtime/snapshot`

如果端口被占用，Codex 应先查明占用进程，再选择停止旧服务或改端口，不要误判为项目初始化失败。

## 步骤八：可选创建第一个业务模块

只有用户明确提供 `initialFeature` 时才执行：

```powershell
corepack pnpm scaffold:feature approval-center --title 审批中心 --permission approval:read
```

生成后必须手动接入：

```text
apps/web/src/router/index.ts
```

新增模块后至少运行：

```powershell
corepack pnpm lint
corepack pnpm --filter @agent-flow/web test
corepack pnpm build
```

## 步骤九：首次提交

用户要求提交时，Codex 必须先确认验证通过，然后提交：

```powershell
git status --short
git add .
git commit -m "chore(repo): initialize frontend project from starter"
```

独立前端仓库时在 `targetPath` 提交。前后端同仓时在 `monorepoRoot` 提交，提交说明应写清前端目录，例如 `frontend/`。

如果用户要求推送，并且已经配置远端：

```powershell
git push -u origin main
```

推送前不要绕过 hooks，不要 force push。

## 完成回复格式

Codex 完成后必须告诉用户：

- 新项目目录。
- 使用的模板源路径和 `.starter-version`。
- Git 状态：是否已 `git init`、是否配置 remote、是否已提交或推送。
- 已改名的位置：`package.json`、`README.md`、CODEOWNERS 是否已配置。
- 是否创建了未提交的 `apps/web/.env.local` 本地演示登录配置。
- 已运行的验证命令和结果。
- 本地启动地址。
- 未完成但需要用户决定的事项，例如远端仓库、CODEOWNERS、secrets、部署环境、真实 API。
