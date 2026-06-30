# Git 提交与合并门禁

本模板要求“本地提交前阻断 + 推送前阻断 + CI 合并阻断 + Codex review”四层检查，并用 `pnpm check:gates` 自检门禁资产是否完整。

## AI 操作红线

当提交、推送、创建 PR、更新 PR 或合并由 Codex 或任何 AI agent 执行时，以下行为禁止：

- 使用 `git commit --no-verify`。
- 使用 `git push --no-verify`。
- 跳过 `.husky/pre-commit`、`.husky/commit-msg` 或 `.husky/pre-push`。
- 跳过 `pnpm verify` 或只运行部分检查后声称可合并。
- 绕过 GitHub required checks、强推保护分支，或建议用户在检查失败时直接合并。
- 修改门禁配置来让当前变更通过，除非 PR 目标就是调整门禁且说明了风险、迁移方式和验证结果。

人类开发者手动使用 `--no-verify` 属于团队管理策略范畴；但只要后续进入 AI 辅助 PR 或合并流程，仍必须重新通过完整本地验证、CI 和 Codex Review。

## 本地提交

`pre-commit` 运行：

```powershell
pnpm precommit
```

覆盖：

- Prettier。
- ESLint auto-fix。
- Stylelint auto-fix。
- 相关包 typecheck。
- 命名、注释与单文件大小标准检查。
- 门禁闭环自检。

`commit-msg` 运行：

```powershell
pnpm commitlint --edit "$1"
```

## 本地推送

`pre-push` 运行：

```powershell
pnpm verify
```

任何格式、Lint、命名、注释、单文件大小、测试或构建失败都不允许推送。

## CI 合并检查

`.github/workflows/ci.yml` 运行：

```powershell
pnpm install --frozen-lockfile
pnpm verify
```

仓库分支保护必须把以下 checks 设置为 required：

```text
CI / verify
Codex Review / codex_review
```

没有分支保护时，GitHub Action 只能报告失败，不能真正阻止管理员直接合并。

远端仓库必须按 `docs/GITHUB_BRANCH_PROTECTION.md` 配置 branch protection。没有远端分支保护时，双收口不完整。

## 门禁闭环自检

`pnpm check:gates` 检查：

- `package.json` 的 `precommit`、`test`、`verify` 和 `check:gates` 脚本。
- `.husky/pre-commit`、`.husky/commit-msg`、`.husky/pre-push`。
- `.github/workflows/ci.yml` 是否运行 `pnpm verify`。
- `.github/workflows/codex-review.yml` 是否运行 Codex Review 并强制 `MERGE_DECISION`。
- `.github/codex/prompts/review.md` 是否检查 AI 绕过、标准门禁和验证证据。
- `.github/pull_request_template.md` 是否暴露验证和 AI 禁绕过确认项。
- `AGENTS.md`、`docs/GIT_MERGE_GATES.md` 和 `docs/GITHUB_BRANCH_PROTECTION.md` 是否保留双收口规则。

新增工程化规则时必须同步 `pnpm lint:engineering`，并保证 `pnpm check:gates` 能检测规则入口没有被删除。

## 可选本地增强门禁

当前模板提供两个不进入默认 `pnpm verify` 的本地增强命令：

```powershell
pnpm test:coverage
pnpm verify:e2e
```

使用建议：

- 修改 `packages/contracts`、`shared/api`、`shared/auth`、`shared/runtime` 时运行 `pnpm test:coverage`。
- 修改路由、权限、运行流、审批、artifact 或可见页面流程时运行 `pnpm verify:e2e`。
- 真实项目稳定后，可把它们拆成独立 GitHub Actions required checks。

该命令会被 `pnpm precommit` 和 `pnpm verify` 调用。修改门禁相关文件时，必须先让它通过。

## Codex Code Review

推荐同时启用两种方式：

- GitHub 集成：在 Codex settings 中为仓库启用 Code review 或 Automatic reviews；PR 评论可使用 `@codex review` 触发。
- GitHub Action：`.github/workflows/codex-review.yml` 使用 `openai/codex-action@v1` 做合并门禁。

Action 需要仓库配置：

```text
OPENAI_API_KEY
```

Codex review 输出必须包含：

```text
MERGE_DECISION: PASS
```

如输出 `MERGE_DECISION: BLOCK` 或缺少明确结论，workflow 失败，不允许合并。

## Codex Review 关注项

Codex review 必须重点检查：

- 是否存在 AI 操作绕过 `--no-verify`、Husky、`pnpm verify` 或 required checks 的迹象。
- 命名与注释规范是否被绕过。
- 是否存在注释掉的旧代码、无 scope TODO、无意义注释。
- 公共 API 是否缺少 TSDoc。
- 新增 class 是否符合命名空间和 kebab/BEM。
- 新增函数是否使用动作前缀。
- 新增或修改文件是否超过单文件大小上限，是否存在规避拆分的压缩写法。
- 是否绕过 `shared/api`、auth guard、permission directive、`packages/ui`、contracts 等基础边界。
- UI 是否违反 `ai-ui-design-audit`。
