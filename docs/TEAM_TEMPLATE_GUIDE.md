# 团队使用说明

这份文档给第一次使用的人看。你不需要懂模板仓库、工程化、门禁这些词，按下面做就行。

## 当前模板

- 模板地址：`https://github.com/xiaoyu942698/frontend-engineering-starter`
- 当前稳定版本：`v0.1.0`
- 这个模板仓库是 public，因为团队成员需要能直接复制。
- 你的业务项目一般不要 public，公司项目、客户项目和未公开产品都建议设成 private。

## 一句话

这个仓库是前端项目的样板间。

你做新项目时，不要在这个样板间里写业务代码。你应该把样板间复制或搬进自己的业务项目里，再在业务项目里开发。

## 正确用法

先看你的项目是哪一种。

独立前端项目：

1. 打开 `https://github.com/xiaoyu942698/frontend-engineering-starter`。
2. 点击 GitHub 上的 `Use this template`。
3. 创建一个属于你自己的前端项目仓库。
4. 如果是公司或客户项目，新仓库请选择 private。
5. 把新仓库 clone 到本地。
6. 运行 `pnpm install`。
7. 运行 `pnpm dev` 看项目能不能启动。
8. 运行 `pnpm verify`，确认基础检查能通过。
9. 改项目名、页面标题、README、接口地址和负责人。
10. 后续业务代码都写在你自己的仓库里。

前后端同仓项目：

1. 不要长期单独维护一个前端业务仓库。
2. 在业务仓库里确定前端目录，例如 `frontend/`、`web/` 或团队已有前端目录。
3. 把这个模板作为前端工程化基座迁入前端目录。
4. 根目录保留或合并 `AGENTS.md`，让 Codex 知道：前端任务进前端目录，后端任务按后端规则处理。
5. `.github/workflows`、`.husky`、CODEOWNERS、secrets 和部署配置要合并，不要直接覆盖后端已有配置。
6. 在业务仓库里运行前端目录要求的 `pnpm install`、`pnpm dev`、`pnpm verify`。

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

如果你们的业务项目是前后端同仓，`Use this template` 可以只作为拿到模板代码的方式。最终业务代码仍放在真正的业务仓库里，不要让临时复制出来的前端仓库变成长期业务仓库。

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

你接入模板后，你的项目就是独立的。模板仓库后面更新，不会自动改你的项目。

如果你想升级到新规则，需要手动升级：

1. 看模板仓库的新版本说明：`https://github.com/xiaoyu942698/frontend-engineering-starter/releases`
2. 新建一个升级分支。
3. 只同步需要的规则文件或脚本。
4. 跑 `pnpm verify`。
5. 检查没问题再合并。

## 哪些文件很重要

这些文件不要随便删：

| 文件或目录                  | 作用                                                   |
| --------------------------- | ------------------------------------------------------ |
| `AGENTS.md`                 | Codex 的入口规则。前后端同仓时，根目录也要有入口规则。 |
| `docs/CODEX_RULE_ROUTER.md` | Codex 怎么选规则。                                     |
| `docs/*STANDARD.md`         | 前端开发规范。                                         |
| `.github/workflows`         | GitHub 自动检查。                                      |
| `.husky`                    | 本地提交和推送检查。                                   |
| `scripts`                   | 工程化检查和脚手架。                                   |
| `.env.example`              | 示例环境变量清单。                                     |
| `.starter-version`          | 记录项目基于哪个版本。                                 |

## 第一次创建项目后要改什么

最少改这些：

- `README.md`：改成自己的项目说明。
- `package.json`：改项目名和描述。
- `apps/web/index.html`：改浏览器标题。
- `.github/CODEOWNERS`：改成自己的负责人。
- `.env.example`：保留模板级示例值，不要写真实密钥或生产地址。
- `apps/web/.env.example`：改成自己的接口配置示例，也不要写真实密钥。
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
以后新前端项目请基于 frontend-engineering-starter 接入。
模板地址：https://github.com/xiaoyu942698/frontend-engineering-starter
当前稳定版本：v0.1.0。
不要 fork，不要在模板仓库写业务代码。
如果是独立前端项目，可以点 Use this template 生成自己的项目仓库；公司、客户或未公开业务项目建议设为 private。
如果是前后端同仓项目，把模板迁入业务仓库的前端目录，并合并根目录 AGENTS.md、.github/workflows、.husky 和 CODEOWNERS。
接入后保留 AGENTS.md、docs、scripts、.husky 和 .github/workflows。
平时给 Codex 直接描述需求即可，Codex 会按项目里的 AGENTS.md 和工程化规则开发。
提交前至少跑 pnpm verify。
```
