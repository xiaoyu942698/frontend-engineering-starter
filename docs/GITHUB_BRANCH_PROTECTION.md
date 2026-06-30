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
Codex Review / codex_review
```

项目稳定后可以考虑增加：

```text
CI / verify:e2e
CI / test:coverage
```

不要在真实运行夹具和执行时长未稳定前把 E2E 或 coverage 设为 required。

`CI / verify` 是确定性工程收口，负责 format、lint、typecheck、命名/注释/文件大小、test 和 build。

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
- `Codex Review / codex_review` 通过。
- PR conversations 已解决。
- 没有 AI-assisted `--no-verify`、跳过 Husky、跳过 `pnpm verify` 或绕过 required checks 的记录。
- 如果修改了 `.github/`、`.husky/`、`scripts/check-*`、`package.json` scripts 或 `docs/*STANDARD*.md`，必须说明是否影响门禁。

## 自检命令

本地和 CI 都应运行：

```powershell
pnpm check:gates
pnpm verify
```

`pnpm check:gates` 只检查仓库内门禁资产是否完整；它不能代替 GitHub branch protection。远端 required checks 必须由仓库管理员配置。
