# 架构边界规范

本文档定义前端工程的硬边界。可稳定判断的规则由 `pnpm lint:engineering` 执行，语义类问题由 Codex Review 和人工 Review 收口。

## 已接入硬校验

`scripts/check-engineering-rules.mjs` 当前会检查：

- Feature、页面、组件不能直接 `import axios from 'axios'`；HTTP 必须通过 `apps/web/src/shared/api`。
- 只有 `apps/web/src/shared/config` 能读取 `import.meta.env`。
- Feature 模块不能直接 import 另一个 feature 的私有路径。
- `packages/ui` 不能 import `@/` 应用代码，也不能依赖 `@agent-flow/contracts`。
- `packages/contracts` 不能依赖应用代码或 UI 包。
- 前端组件不能直接 import LangGraph、CrewAI、Mastra、OpenAI Agents SDK、Google ADK 等运行框架 SDK。
- Feature 和组件样式不能写硬编码颜色，必须使用设计 token。
- 不能新增第二套 UI 框架、请求库、状态库或装饰动画库。

## Feature 边界

- `features/<feature>` 内部文件默认私有。
- 跨 feature 共享能力必须上移到 `shared`、`packages/ui` 或 `packages/contracts`。
- 页面组件只做路由入口、布局和数据编排。
- API、query、store、schema、mapper 需要按职责拆分，不堆进页面。

## Shared 边界

- `shared/api` 负责 HTTP client、request helper、错误归一和边界校验。
- `shared/auth` 负责权限判断、路由权限和局部权限指令。
- `shared/config` 负责环境变量读取和解析。
- `shared/runtime` 负责 RuntimeAdapter 抽象。

## Package 边界

- `packages/contracts` 只放跨前后端共享 schema、type、enum 和解析规则。
- `packages/ui` 只放 token、布局、状态、基础组合组件，不放业务模型。
- `apps/mock-api` 可以依赖 contracts，不依赖 web 或 ui。
- `apps/web` 可以依赖 contracts、ui 和 shared，不反向污染 packages。

## Review 重点

- 是否出现“为了方便”绕过边界的 import。
- 是否把业务状态放进通用 UI 包。
- 是否把后端 SDK、Agent SDK 或运行时细节带入页面组件。
- 是否在组件里混合请求、权限、状态、展示和数据转换。
