# 团队最终使用说明

这份文档是团队使用 `frontend-engineering-starter` 的最终说明。README 只做入口，本文件才是给团队转发和落地时看的版本。

模板地址：`https://github.com/xiaoyu942698/frontend-engineering-starter`

当前稳定版本：`v0.1.0`

## 先记住

- 不要 fork。
- 不要在模板仓库里写业务代码。
- 公司、客户或未公开项目建议设为 private。
- 业务项目接入后不会自动同步模板更新。

## 先判断

先看你的业务项目是哪一种。

| 项目情况               | 应该怎么做                                                            |
| ---------------------- | --------------------------------------------------------------------- |
| 只有前端一个仓库       | 点 `Use this template`，生成自己的前端仓库。                          |
| 前端和后端在同一个仓库 | 拿一份模板代码，不带 `.git`，把前端工程文件复制到业务仓库的前端目录。 |

前端目录一般叫 `frontend/`、`web/`，也可以用团队已有目录。

## 只有前端仓库

按这个做：

1. 打开模板地址。
2. 点击 GitHub 上的 `Use this template`。
3. 生成自己的前端项目仓库。
4. 把新仓库设为 private。
5. 在自己的仓库里写业务代码。

## 前后端同仓

按这个做：

1. 在业务仓库里确认前端目录，例如 `frontend/` 或 `web/`。
2. 用 `Use this template` 或 `Download ZIP` 拿一份模板代码。
3. 不要复制模板里的 `.git`。
4. 不要把模板仓库作为一个嵌套仓库塞进业务仓库。
5. 把前端工程文件复制到前端目录。
6. 把根目录配置合并到业务仓库根目录，不要覆盖后端已有配置。

复制到前端目录的内容：

```text
apps
packages
docs
scripts
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
.starter-version
.env.example
tsconfig.base.json
eslint.config.js
prettier.config.cjs
stylelint.config.cjs
commitlint.config.cjs
lint-staged.config.cjs
```

合并到业务仓库根目录的配置：

```text
AGENTS.md
.github/workflows
.github/CODEOWNERS
.github/pull_request_template.md
.github/codex
.husky
```

合并的意思是：已有文件就把规则加进去，不要直接覆盖。尤其是 `.github/workflows`、`.husky`、`.github/CODEOWNERS`，可能已经有后端规则。

## 第一次接入后

让 Codex 检查三件事：

1. 依赖能不能安装。
2. 页面能不能启动。
3. 提交前验证能不能通过。

如果前端在 `frontend/` 或 `web/` 这种子目录，Codex 应该先进入前端目录再检查。

## Codex 怎么用

你只需要正常给 Codex 说需求，例如：

```text
新增一个订单列表页面，支持查询、表格、空状态和错误状态。
```

不用每次提醒 Codex 遵守规范。项目里的 `AGENTS.md` 会告诉 Codex 必须怎么做。

## 后续升级

模板仓库后面更新，不会自动改你的业务项目。

要升级时再手动做：

1. 看模板仓库 release 说明。
2. 新建升级分支。
3. 只复制需要升级的规则、脚本或 CI。
4. 让 Codex 完成提交前验证。
5. 检查通过后再合并。

## 直接发给团队

```text
以后新前端项目请基于 frontend-engineering-starter 接入。
模板地址：https://github.com/xiaoyu942698/frontend-engineering-starter
当前稳定版本：v0.1.0。

不要 fork，不要在模板仓库写业务代码。

如果项目只有前端：点 Use this template，生成自己的前端仓库。
如果项目是前后端同仓：拿一份模板代码，不带 .git，把前端工程文件复制到业务仓库的前端目录，比如 frontend/ 或 web/。

接入后保留 AGENTS.md、docs、scripts、.husky 和 .github/workflows。
前后端同仓项目要合并 AGENTS.md、.github、.husky 等根目录配置，不要覆盖后端配置。

平时给 Codex 直接描述需求即可。
提交前验证由 Codex 负责，不需要使用者手动记命令。
```
