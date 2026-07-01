# Frontend Engineering Starter

通用前端工程化基座。它不是某一个固定业务系统，也不是只能做 Agent 页面；它提供的是一套可以复制到新项目里的前端基础设施：目录结构、模块脚手架、接口边界、权限约束、UI 规范、测试、CI、Git 门禁和 Codex 接入规则。

后续项目可以长成后台管理、运营工具、Agent 产品、工作流控制台或其他前端系统，但新增代码都应该先遵守这套基础规则。

## 适合谁用

- 维护者：维护这个工程化基座，发布新版本。
- 项目负责人：基于本仓库创建自己的业务项目。
- 普通开发者：在业务项目里按规范开发页面、模块和接口。
- Codex：通过根目录 `AGENTS.md` 自动读取工程化规则并完成开发任务。

## 团队怎么用

先记住一句话：不要 fork，也不要在这个模板仓库里写业务代码。

当前模板状态：

- 模板地址：`https://github.com/xiaoyu942698/frontend-engineering-starter`
- 当前稳定版本：`v0.1.0`
- 仓库是 public GitHub template repository，License 是 MIT。
- public 只代表模板公开；业务项目仍建议创建为 private。

先问一个问题：前端和后端是不是放在同一个业务仓库？

- 不是，在独立前端仓库开发：点击 GitHub 的 `Use this template`，生成自己的前端项目仓库。
- 是，前后端在同一个仓库：不要再单独建一个长期前端仓库。先拿一份模板源码，再把前端工程文件复制到业务仓库的前端目录，例如 `frontend/`、`web/` 或团队已有前端目录。

前后端同仓时，“放进前端目录”的意思是：

1. 用 `Use this template` 或 `Download ZIP` 拿一份模板源码。
2. 不要把模板自己的 `.git` 复制进业务仓库，也不要做成嵌套仓库。
3. 复制到业务仓库前端目录：`apps`、`packages`、`docs`、`scripts`、`package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`.starter-version`、`.env.example` 和前端工具配置文件。
4. 合并到业务仓库根目录：`AGENTS.md`、`.github`、`.husky`、CODEOWNERS。已有文件要合并，不要直接覆盖。
5. 以后运行前端命令时，先进入前端目录，例如 `cd frontend`，再运行 `pnpm install`、`pnpm dev`、`pnpm verify`。

无论哪种方式，都要守住这几条：

1. 业务代码只写在自己的业务仓库里。
2. 公司、客户或未公开项目建议设为 private。
3. 保留 `AGENTS.md`、`docs`、`scripts`、`.husky` 和 `.github/workflows`。
4. 前后端同仓时，根目录配置要合并，不要覆盖后端已有配置。
5. 后续升级模板规则要手动做，不会自动同步上游 `main`。

两份接入文档：

- Codex 和维护者执行方案：`docs/CODEX_TEMPLATE_ROLLOUT_PLAN.md`
- 普通团队成员使用说明：`docs/TEAM_TEMPLATE_GUIDE.md`

## 快速启动

```powershell
pnpm install
pnpm dev
```

本地地址：

- Web：`http://127.0.0.1:5178`
- Mock API：`http://127.0.0.1:8787/api/runtime/snapshot`

根目录 `.env.example` 是模板级环境变量清单，只能保留示例值。Web 应用运行时配置仍以 app 级示例为准；如果项目需要配置接口地址、鉴权缓存 key 或 mock 登录开关，复制并修改：

```text
apps/web/.env.example
```

## 新增模块

新增业务模块时，先用脚手架生成标准骨架：

```powershell
pnpm scaffold:feature approval-center --title 审批中心 --permission approval:read
```

生成后再手动把 route 接入：

```text
apps/web/src/router/index.ts
```

基本要求：

- 请求统一走 `apps/web/src/shared/api`。
- 权限统一走 route meta 和 `v-permission`。
- UI 优先使用 Element Plus 和 `packages/ui`。
- 不要在业务页面里重新造一套按钮、弹窗、表格或颜色体系。

## Codex 接入

Codex 的入口固定在根目录：

```text
AGENTS.md
```

普通使用者只需要描述需求，例如：

```text
新增一个审批页面，支持列表、查询、空状态和错误状态。
```

不需要每次提醒 Codex 怎么遵守规范。Codex 必须自己读取 `AGENTS.md`，再按任务类型查对应文档和验证命令。

Codex 必须遵守：

- 先读 `AGENTS.md`。
- 新模块优先用 `pnpm scaffold:feature`。
- 修改接口、权限、UI、测试、CI 或 Git 门禁时，查对应 `docs` 文档。
- 提交前运行对应验证命令。
- 不允许使用 `--no-verify` 绕过检查。

## 常用命令

```powershell
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm typecheck
pnpm build
pnpm verify
pnpm verify:e2e
pnpm check:gates
```

远端分支保护配置脚本：

```powershell
pnpm protect:github --branch main
```

注意：GitHub Free 的 private repo 可能无法启用 branch protection。代码里的门禁资产可以准备好，但远端强制拦截能力取决于 GitHub 计划。

## 提交前必须确认

普通改动至少运行：

```powershell
pnpm verify
```

改了核心链路、覆盖率门禁、运行流或可见页面时，加跑：

```powershell
pnpm test:coverage
pnpm verify:e2e
```

本仓库已经配置：

- commit message 检查。
- pre-commit 自动格式化、lint、类型检查和工程规则检查。
- pre-push 自动运行 `pnpm verify`。
- GitHub Actions 运行 verify、coverage、e2e 和 Codex Review。

## 目录结构

```text
frontend-engineering-starter/
  apps/
    web/          前端应用示例
    mock-api/     本地 mock API 和运行流示例
  packages/
    contracts/    前后端共享数据结构和运行流 schema
    ui/           设计 token 和通用 UI 组件
  docs/           工程规范、接入方案和验证说明
  scripts/        工程检查和脚手架脚本
```

关键位置：

- `apps/web/src/router`：路由、标题、鉴权和权限守卫。
- `apps/web/src/stores/auth-store.ts`：登录态、token、用户和权限状态。
- `apps/web/src/shared/api`：统一请求、响应校验和错误归一化。
- `apps/web/src/shared/auth`：权限判断和 `v-permission`。
- `packages/ui`：设计 token、布局组件、状态组件、时间线和信息展示组件。

## 重要文档

- 总体工程规范：`docs/FRONTEND_ENGINEERING_STANDARD.md`
- 通俗边界说明：`docs/FRONTEND_BOUNDARY_GUIDE.md`
- 模块脚手架说明：`docs/FRONTEND_MODULE_TEMPLATE.md`
- Codex 规则路由：`docs/CODEX_RULE_ROUTER.md`
- Git 和合并门禁：`docs/GIT_MERGE_GATES.md`
- GitHub 分支保护：`docs/GITHUB_BRANCH_PROTECTION.md`
- 验证命令说明：`docs/VALIDATION.md`
- 团队使用说明：`docs/TEAM_TEMPLATE_GUIDE.md`
- Codex 模板分发方案：`docs/CODEX_TEMPLATE_ROLLOUT_PLAN.md`

## 版本和升级

`.starter-version` 记录当前基座版本。

`.env.example` 和各 app 目录下的 `.env.example` 只能写示例值，不要提交真实 token、生产 endpoint 或账号信息。

业务项目接入模板后，不会自动同步本仓库的新规则。升级应该手动进行：

1. 看本仓库的新版本说明：`https://github.com/xiaoyu942698/frontend-engineering-starter/releases`
2. 新建升级分支。
3. 只同步需要的规则文件、脚本或 CI。
4. 更新 `.starter-version`。
5. 运行 `pnpm verify`。
6. 验证通过后再合并。

不要让业务项目自动跟随本仓库 `main`。

## 代码结构分析

分析结构、入口、调用关系和影响范围时，优先使用 CodeGraph。不要额外生成 `docs/ai/code-map.md` 或重复的静态模块索引。
