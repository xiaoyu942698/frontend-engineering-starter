# Codex Template Rollout Plan

本文档给 Codex、仓库维护者和负责接入业务项目的人使用。目标是把本仓库作为公开前端工程化模板分发，同时避免业务项目和基座仓库互相污染。

## Decision

采用公开 GitHub template repository 模式。

- 上游仓库：`frontend-engineering-starter`，只维护工程化基座、规则、脚手架、CI、Codex 入口和示例。
- 下游仓库：团队成员从 template 生成的新前端项目，或已经存在的前后端同仓业务项目。
- 更新方式：不自动同步上游 `main`。下游项目只按版本手动升级。
- Codex 入口：每个下游项目必须保留可被 Codex 发现的 `AGENTS.md`。前后端同仓时，根目录 `AGENTS.md` 必须把前端任务路由到前端目录和本模板规则。

## Current Published State

当前上游模板已经完成公开发布。

- 模板地址：`https://github.com/xiaoyu942698/frontend-engineering-starter`
- 仓库可见性：public。
- GitHub template repository：已开启。
- License：MIT。
- 默认分支：`main`。
- 当前稳定版本：`v0.1.0`，对应 `.starter-version` 中的 `frontend-engineering-starter@0.1.0`。
- Release 地址：`https://github.com/xiaoyu942698/frontend-engineering-starter/releases/tag/v0.1.0`

## Repository Roles

| 角色          | 职责                                                                  |
| ------------- | --------------------------------------------------------------------- |
| Upstream      | 维护模板、规则、脚手架、CI、示例、发布版本和升级说明。                |
| Downstream    | 承载具体业务代码，可能是独立前端仓库，也可能是前后端同仓业务仓库。    |
| Maintainer    | 在上游发版本、写迁移说明、处理规则变更和破坏性变更。                  |
| Project owner | 在下游替换项目名、CODEOWNERS、secrets、环境变量、业务接口和部署配置。 |

## Public Release Checklist

`v0.1.0` 已经发布。后续每次公开 release 前，Codex 必须完成这些检查：

1. 确认工作区干净：`git status --short --branch`
2. 扫描敏感信息：真实 token、密钥、生产账号、私有 endpoint、内部截图、业务文档。
3. 检查 git history 是否包含不应公开的提交。
4. 确认根目录 `LICENSE` 仍为固定 MIT。
5. 确认根目录 `.env.example` 和 app 级 `.env.example` 只有示例值，没有真实配置。
6. 确认 `.github/CODEOWNERS.example` 可指导下游替换 owner。
7. 确认 `README.md`、本文件、`docs/TEAM_TEMPLATE_GUIDE.md` 说明不要 fork 业务项目。
8. 确认 `.starter-version` 存在，并与发布 tag 对应。
9. 运行 `pnpm verify`。
10. 更新版本号和 release notes，打 tag，例如 `v0.2.0`。
11. 确认 GitHub 仓库仍为 public，并且 template repository 仍开启。
12. 发布后核对 release 页面，并同步 README 和团队使用说明里的版本信息。

## Downstream Creation Flow

下游项目分两种接入方式，Codex 必须先判断业务仓库形态。

| 业务仓库形态           | 怎么接入                                                                        |
| ---------------------- | ------------------------------------------------------------------------------- |
| 只有前端一个仓库       | 用 `Use this template` 生成新的前端项目仓库。                                   |
| 前端和后端在同一个仓库 | 复制模板前端工程文件到业务仓库的前端目录，例如 `frontend/`、`web/` 或已有目录。 |

如果不确定，优先问清楚前端目录在哪里，不要直接创建长期前端业务仓库。

### Independent Frontend Repository

独立前端项目按这个流程生成：

1. 打开 `https://github.com/xiaoyu942698/frontend-engineering-starter`，使用 GitHub `Use this template` 生成新仓库，不使用 fork。
2. 新仓库由业务负责人放到自己的个人账号下。
3. 业务项目如果有私有代码，必须设为 private。
4. 克隆下游仓库。
5. 替换 `README.md`、`package.json`、网页 title 和项目显示名。
6. 替换 `.github/CODEOWNERS` 为下游项目真实负责人。
7. 配置下游项目自己的 GitHub secrets、根目录和 app 级 `.env.example`、部署设置。
8. 保留 `AGENTS.md`、`docs/CODEX_RULE_ROUTER.md`、`.github/workflows`、`.husky`、`scripts` 和 `pnpm verify`。
9. 运行 `pnpm install`、`pnpm verify`。
10. 首次提交应说明基于哪个 `.starter-version`。

### Full-stack Repository

前后端同仓项目不应该长期维护一个额外的前端业务仓库。Codex 应按迁入方式处理：

1. 识别业务仓库已有结构，例如 `frontend/`、`web/`、`server/`、`backend/`。
2. 和业务负责人确认前端目录；默认建议使用已有前端目录，没有则创建 `frontend/`。
3. 用 `Use this template`、临时 clone 或 `Download ZIP` 拿到模板源码，但不要把模板 `.git` 放入业务仓库。
4. 复制到前端目录：`apps`、`packages`、`docs`、`scripts`、`package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`.starter-version`、`.env.example`、`tsconfig.base.json`、ESLint、Prettier、Stylelint、commitlint 和 lint-staged 配置。
5. 合并到业务仓库根目录：`AGENTS.md`、`.github`、`.husky`、CODEOWNERS、PR 模板、CI、Codex Review、secrets 和部署配置。已有后端配置必须合并，不能直接覆盖。
6. 根目录 `AGENTS.md` 必须明确：前端任务进入前端目录后再读取本模板规则，后端任务继续按后端规则处理。
7. 下游 `.starter-version` 可以放在前端目录，也可以由根目录统一记录，但必须能看出当前前端基座版本。
8. 前端验证命令应在业务仓库中可执行；如果前端位于子目录，CI 和 hooks 应显式 `cd frontend` 或设置等价 working directory。
9. 首次提交应说明基于哪个 `.starter-version`、迁入到哪个前端目录、哪些根目录配置被合并。

## Upgrade Flow

下游项目升级模板规则时，Codex 必须走手动升级，不允许自动拉上游 `main` 覆盖业务项目。

1. 读取下游 `.starter-version`。
2. 读取上游 release notes 和本文件中的升级流程，只从稳定 release tag 判断升级内容。
3. 新建升级分支，例如 `chore/update-frontend-starter-v0.2.0`。
4. 只迁移必要的规则文件、脚本、CI、hooks 或示例，不覆盖业务代码。
5. 前后端同仓时，只迁移前端目录和已合并的根目录前端门禁配置，不改后端规则。
6. 如果新规则会卡住旧代码，先记录影响，再决定是修代码还是延后升级。
7. 更新下游 `.starter-version`。
8. 运行 `pnpm verify`。
9. 如果升级影响核心链路或可见页面，加跑 `pnpm test:coverage` 和 `pnpm verify:e2e`。
10. 提交时说明升级版本、迁移文件、验证命令和剩余风险。

## Version Rules

上游版本按影响范围管理：

- `PATCH`：文档修正、示例修正、非破坏性脚本修复。
- `MINOR`：新增规则、新增脚手架、新增可选检查，默认不破坏旧项目。
- `MAJOR`：收紧门禁、改目录结构、改包名、改验证命令，可能需要下游迁移。

不要让下游项目直接跟随上游 `main`。`main` 是开发态，release tag 才是稳定同步点。

## Forbidden

Codex 不允许执行这些做法：

- 不要把业务项目 fork 自公开上游仓库。
- 不要在上游模板仓库写业务代码。
- 不要让下游项目自动同步上游 `main`。
- 不要只远程引用规则文档却删除本地 `AGENTS.md`、scripts、CI 或 hooks。
- 不要用 `--no-verify` 绕过本地门禁。
- 不要把包含业务代码的个人仓库误改成 public。

## Validation

上游模板变更至少运行：

```powershell
pnpm format:check
pnpm verify
```

涉及核心链路、覆盖率门禁、Playwright、运行流示例时，加跑：

```powershell
pnpm test:coverage
pnpm verify:e2e
```

下游业务项目可根据项目阶段缩小验证范围，但提交前至少应运行 `pnpm verify` 或项目定义的等价验证命令。

修改发布状态、版本说明或接入方式时，还要同步检查：

- `README.md`
- `docs/TEAM_TEMPLATE_GUIDE.md`
- `.starter-version`
- GitHub release notes
