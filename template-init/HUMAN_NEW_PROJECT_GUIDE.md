# 给 Codex 创建新项目的说明

目标是基于 `frontend-engineering-starter` 模板创建新项目时，应该给 Codex 什么信息，以及 Codex 会替你做什么。

模板仓库地址：`https://github.com/xiaoyu942698/frontend-engineering-starter.git`

具体执行细节在模板仓库的 `template-init/CODEX_NEW_PROJECT_RUNBOOK.md`。Codex 读取那份 runbook 后，应该能直接在你指定的目录里搭好完整项目。

## 推荐提示词

提示词使用这段，把新项目目录和项目名改掉：

```text
请使用模板仓库 https://github.com/xiaoyu942698/frontend-engineering-starter.git，
并读取其中的 template-init/CODEX_NEW_PROJECT_RUNBOOK.md，
帮我创建一个新的前端项目。

输入：
- 新项目目录：D:\Work\MyProject
- 项目名：my-project
- 项目显示名：My Project
- 创建模式：local-only

要求：
- 不要在模板仓库写业务代码。
- 不要复制 .git、node_modules、dist、coverage、test-results。
- 初始化新项目 Git。
- 安装依赖并运行验证。
- 验证结果和未完成事项最后告诉我。
```

如果你要推远端，把创建模式改成：

```text
- 创建模式：existing-remote
- 远端仓库：git@github.com:my-org/my-project.git
- 验证通过后提交并推送 main
```

## Codex 应该做什么

Codex 不是让你手动照 README 复制文件，而是应该直接完成这些事：

1. 确认当前模板仓库和版本。
2. 检查目标目录是否安全，避免覆盖已有文件。
3. 从模板当前提交生成一个干净的新项目。
4. 初始化新项目 Git。
5. 改 `package.json`、`README.md`、必要的 owner 和项目名。
6. 保留 `AGENTS.md`、`docs`、`scripts`、`.github`、`.husky` 等工程化资产。
7. 安装依赖。
8. 运行验证。
9. 必要时本地启动并检查页面。
10. 如果你要求，再提交或推送。

你不需要记 `pnpm verify`、hooks、CI 或 E2E 的细节。Codex 应该自己按模板规则完成。

## 为什么先推荐本地创建

默认建议先让 Codex 在本地目录把项目搭好，再决定是否推远端。

这样有几个好处：

- 不需要你先去 GitHub 建仓。
- 可以先确认项目名、README、目录和验证结果。
- 不会把未确认的模板项目推到远端。
- 出问题时只影响本地目录，处理成本低。

等本地跑通后，再让 Codex 加 remote、提交、推送、配置 GitHub secrets 和分支保护。

## 本地项目后续怎么开发

新项目建好后，后续开发就不再走“初始化模板”的逻辑，而是走新项目里的工程化规则：

- Codex 先读新项目根目录 `AGENTS.md`。
- 新页面优先用 `pnpm scaffold:feature`。
- API 走 `apps/web/src/shared/api`。
- 权限走 route meta 和 `v-permission`。
- UI 复用 Element Plus 和 `packages/ui`。
- 提交前由 Codex 运行验证，不需要你在提示词里重复命令。

也就是说，模板只负责把工程基础搭起来；项目建好后，它就是一个正常业务前端项目。

## 什么时候需要额外说明

下面这些情况最好提前告诉 Codex：

- 目标目录已经有文件。
- 你要放进一个前后端同仓的子目录。
- 已经有远端仓库。
- 要立刻推送。
- 要使用公司固定 CODEOWNERS。
- 要替换默认端口。
- 第一个业务模块已经确定。
- 不想保留 mock-api 或 Agent 示例。

如果你不说，Codex 应该保守处理：保留完整模板能力，先本地创建，不覆盖已有文件，不推远端。
