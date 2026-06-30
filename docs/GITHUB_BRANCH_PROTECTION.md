# GitHub 分支保护配置

本文档定义远端仓库必须配置的合并收口。代码仓库只能提供 workflow、prompt、hook 和自检脚本；真正阻断合并必须在 GitHub 仓库设置中启用 branch protection。

## 保护分支

至少保护：

```text
main
master
release/*
```

如团队使用其他长期分支，必须同步添加同等保护。

## 必选设置

在 `Settings -> Branches -> Branch protection rules` 中启用：

- Require a pull request before merging.
- Require approvals.
- Require review from Code Owners，如仓库已配置 CODEOWNERS。当前模板提供 `.github/CODEOWNERS.example`，真实仓库需要复制为 `.github/CODEOWNERS` 并替换为实际团队。
- Dismiss stale pull request approvals when new commits are pushed.
- Require status checks to pass before merging.
- Require branches to be up to date before merging.
- Require conversation resolution before merging.
- Do not allow bypassing the above settings.
- Block force pushes.
- Restrict deletions.

## Required Checks

必须设为 required：

```text
CI / verify
CI / coverage
CI / e2e
Codex Review / codex_review
```

`CI / verify` 是确定性工程收口，负责 format、lint、typecheck、命名/注释/文件大小、test 和 build。

`CI / coverage` 是核心链路覆盖率收口，负责 contracts、mock runtime、web shared/api/auth/runtime/store 的覆盖率阈值。

`CI / e2e` 是桌面和移动端主流程 smoke 收口，负责验证 web 与 mock API 可以启动并进入审批态。

`Codex Review / codex_review` 是 AI 合规收口，负责检查架构边界、规则绕过、验证可信度和 `MERGE_DECISION`。

## Secrets

Codex Review workflow 需要仓库 secret：

```text
OPENAI_API_KEY
```

缺少该 secret 时，`Codex Review / codex_review` 必须失败，不能手动绕过后合并。

## 合并准入

合并前必须同时满足：

- PR 来自非保护分支。
- `CI / verify` 通过。
- `CI / coverage` 通过。
- `CI / e2e` 通过。
- `Codex Review / codex_review` 通过。
- PR conversations 已解决。
- 没有 AI-assisted `--no-verify`、跳过 Husky、跳过 `pnpm verify` 或绕过 required checks 的记录。
- 如果修改了 `.github/`、`.husky/`、`scripts/check-*`、`package.json` scripts 或 `docs/*STANDARD*.md`，必须说明是否影响门禁。

## 自检命令

本地和 CI 都应运行：

```powershell
pnpm check:gates
pnpm verify
pnpm test:coverage
pnpm verify:e2e
```

`pnpm check:gates` 只检查仓库内门禁资产是否完整；它不能代替 GitHub branch protection。远端 required checks 必须由仓库管理员配置。

## GitHub API 配置

有仓库管理员权限时，可以用脚本配置 `main`：

```powershell
pnpm protect:github --branch main
```

先检查 payload 而不写入远端：

```powershell
pnpm protect:github --branch main --dry-run
```

该脚本会要求 `CI / verify`、`CI / coverage`、`CI / e2e`、`Codex Review / codex_review`，并启用 Code Owner review、stale review dismissal、conversation resolution、管理员不可绕过、禁止 force push 和禁止删除。

注意：GitHub 对私有仓库的 branch protection 可能要求 GitHub Pro、Team、Enterprise，或要求仓库设为 public。若 API 返回 `Upgrade to GitHub Pro or make this repository public to enable this feature`，说明仓库内门禁资产已就绪，但远端保护无法在当前 GitHub 计划下生效。
