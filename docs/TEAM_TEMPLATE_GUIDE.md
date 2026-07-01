# 团队使用说明

这份文档给第一次使用的人看。你不需要懂模板仓库、工程化、门禁这些词，按下面做就行。

## 一句话

这个仓库是前端项目的样板间。

你做新项目时，不要在这个样板间里写业务代码。你应该从样板间复制一套新房子，然后在自己的新仓库里开发。

## 正确用法

1. 打开 `frontend-engineering-starter` 仓库。
2. 点击 GitHub 上的 `Use this template`。
3. 创建一个属于你自己的新仓库。
4. 如果是公司或客户项目，新仓库请选择 private。
5. 把新仓库 clone 到本地。
6. 运行 `pnpm install`。
7. 运行 `pnpm dev` 看项目能不能启动。
8. 运行 `pnpm verify`，确认基础检查能通过。
9. 改项目名、页面标题、README、接口地址和负责人。
10. 后续业务代码都写在你自己的仓库里。

## 不要这样做

- 不要 fork 这个公开模板后写业务代码。
- 不要把业务代码提交到模板仓库。
- 不要删除 `AGENTS.md`。
- 不要删除 `.github/workflows`、`.husky`、`scripts` 和 `docs` 里的规范文档。
- 不要用 `--no-verify` 跳过检查。
- 不要把包含业务代码的仓库误设成 public。

## 为什么不要 fork

如果模板仓库是 public，fork 出来的仓库通常也是 public。你在 fork 里写业务代码，就可能把业务代码公开。

用 `Use this template` 不一样。它是复制一份新项目，你可以把新项目设成 private。

## Codex 怎么用

你只需要正常给 Codex 说需求，例如：

```text
新增一个订单列表页面，支持查询、表格、空状态和错误状态。
```

不用每次提醒 Codex 遵守规范。项目里的 `AGENTS.md` 会告诉 Codex 必须怎么做。

Codex 应该自己完成这些事：

- 先读 `AGENTS.md`。
- 新模块优先用 `pnpm scaffold:feature` 生成骨架。
- 请求统一走 `shared/api`。
- 权限统一走 route meta 和 `v-permission`。
- UI 优先用 Element Plus 和 `packages/ui`。
- 提交前运行项目要求的验证命令。

## 更新规则会不会自动影响我

不会。

你从模板创建项目后，你的项目就是独立的。模板仓库后面更新，不会自动改你的项目。

如果你想升级到新规则，需要手动升级：

1. 看模板仓库的新版本说明。
2. 新建一个升级分支。
3. 只同步需要的规则文件或脚本。
4. 跑 `pnpm verify`。
5. 检查没问题再合并。

## 哪些文件很重要

这些文件不要随便删：

| 文件或目录                  | 作用                   |
| --------------------------- | ---------------------- |
| `AGENTS.md`                 | Codex 的入口规则。     |
| `docs/CODEX_RULE_ROUTER.md` | Codex 怎么选规则。     |
| `docs/*STANDARD.md`         | 前端开发规范。         |
| `.github/workflows`         | GitHub 自动检查。      |
| `.husky`                    | 本地提交和推送检查。   |
| `scripts`                   | 工程化检查和脚手架。   |
| `.starter-version`          | 记录项目基于哪个版本。 |

## 第一次创建项目后要改什么

最少改这些：

- `README.md`：改成自己的项目说明。
- `package.json`：改项目名和描述。
- `apps/web/index.html`：改浏览器标题。
- `.github/CODEOWNERS`：改成自己的负责人。
- `apps/web/.env.example`：改成自己的接口配置示例。
- `.starter-version`：保留，不要删。

## 遇到检查失败怎么办

先不要跳过检查。

常见处理方式：

- `pnpm install` 失败：确认 Node.js、pnpm、网络和 registry。
- `pnpm verify` 失败：把失败日志交给 Codex，让它按日志修。
- 页面启动失败：先确认 `pnpm dev` 是否同时启动 web 和 mock API。
- CI 失败：先看 GitHub Actions 里失败的是 verify、coverage、e2e 还是 Codex Review。

## 发给团队的一段话

可以直接把这段发给团队：

```text
以后新前端项目请基于 frontend-engineering-starter 创建。不要 fork，不要在模板仓库写业务代码。
打开模板仓库后点 Use this template，生成自己的项目仓库；业务项目建议设为 private。
创建后保留 AGENTS.md、docs、scripts、.husky 和 .github/workflows。
平时给 Codex 直接描述需求即可，Codex 会按项目里的 AGENTS.md 和工程化规则开发。
提交前至少跑 pnpm verify。
```
