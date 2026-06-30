# 前端开发规范

本文档是 `agent-flow-starter` 派生项目的部门级前端基线。目标是同时适配后台系统和智能体系统：后台侧需要菜单、表格、表单、权限、审计和配置；智能体侧需要任务会话、流程编排、事件流、人工审批、工具调用和结果产物。

如果需要面向新人或业务开发者的通俗解释，先读 `docs/FRONTEND_BOUNDARY_GUIDE.md`；本文档保留为执行标准和验收规则。

## 1. 架构基线

- 默认技术栈：Vue 3 + TypeScript + Vite + Element Plus。
- 状态与请求：Pinia 管理客户端状态，TanStack Vue Query 管理服务端缓存，Axios 管理 HTTP，Zod 管理运行时校验。
- 流程编排：使用 `@vue-flow/core`，不要手写画布连接、节点拖拽和缩放能力。
- 合同模型：跨前后端的 Agent、Tool、Workflow、Run、RunEvent、HumanApproval、Artifact 放在 `packages/contracts`。
- 通用 UI：设计 token、布局壳、状态组件和薄封装放在 `packages/ui`。
- 运行适配：智能体框架统一通过 `RuntimeAdapter` 接入，页面组件不能直接依赖 LangGraph、CrewAI、Mastra、OpenAI Agents SDK、Google ADK 或后端 SDK。
- 结构分析：使用 CodeGraph 查询结构、入口、调用链和影响范围；不要生成重复的 `docs/ai/code-map.md` 或模块索引。
- 任务类型和 Codex 内部规则路由见 `docs/CODEX_RULE_ROUTER.md`。
- 架构边界、API、组件、测试、安全、性能和可访问性分别见对应标准文档。

## 2. 目录结构

```text
apps/web/src/
  app/                 应用壳、全局页面、布局入口
  features/<feature>/  业务模块，按能力聚合页面、组件、查询、store、schema
  router/              路由表、路由 meta 类型、路由 guard
  shared/
    api/               Axios 实例、request helper、错误归一
    auth/              权限判断、指令、鉴权辅助
    config/            环境变量解析和运行配置
    runtime/           RuntimeAdapter 和智能体运行接入边界
  stores/              跨模块客户端状态
  styles/              应用级样式，只组合 token，不定义新设计系统
```

新模块默认结构：

```text
features/<feature>/
  pages/<FeaturePage>.vue
  components/
  queries/
  stores/
  schema.ts
  routes.ts
  index.ts
```

规则：

- 页面级组件放 `pages/`，只负责布局、数据编排和路由入口。
- 模块内私有组件放 `components/`，只服务当前 feature。
- 跨项目可复用的状态、布局和视觉基元进入 `packages/ui`。
- 跨前后端共享的数据结构进入 `packages/contracts`。
- 不要让一个 feature 直接读取另一个 feature 的私有文件；需要共享时上移到 `shared/`、`packages/ui` 或 `packages/contracts`。

## 3. 路由组织

路由集中在 `apps/web/src/router`，路由 meta 类型在 `route-meta.d.ts`。

标准 meta：

```ts
meta: {
  title: '运行审计',
  requiresAuth: true,
  permissions: ['run:read'],
  permissionMode: 'all',
  layout: 'shell'
}
```

规则：

- 每个页面路由必须声明 `name` 和 `meta.title`。
- 需要登录的页面设置 `requiresAuth: true`。
- 需要权限的页面设置 `permissions`；默认 `permissionMode` 是 `all`，需要任一权限时设置 `any`。
- 公共页面不要配置 `permissions`。
- 路由 guard 负责标题、登录态和权限判断；页面组件不要重复写权限跳转逻辑。
- 无权限统一进入 `/403`。

## 4. 组件分层

组件分四层：

- Element Plus：按钮、表单、表格、弹窗、抽屉、菜单、标签、空状态、提示、通知等成熟基础控件。
- `packages/ui`：设计 token、页面标题、surface 布局、导航、KV 列表、时间线、状态块等跨项目薄封装。
- `shared`：请求、权限、运行适配、配置等非视觉基础设施。
- `features`：Agent、Tool、Workflow、Run、Approval、Artifact 等业务组件。

规则：

- 优先使用 Element Plus，不重复造按钮、输入框、表格、弹窗。
- `packages/ui` 只做薄封装和组合，不重新实现组件库。
- Feature 组件只表达业务语义，不定义全局样式规则。
- 不做卡片套卡片。只有独立对象、列表项、弹窗和明确边界的工具面板才使用 card-like 容器。

## 5. 状态管理

Pinia 只管理客户端状态：

- `stores/app-store.ts`：密度、侧栏、inspector 等 UI 状态。
- `stores/auth-store.ts`：用户、token、权限、会话持久化。
- Feature store：仅当状态跨多个同 feature 组件共享且不是服务端缓存时才新增。

服务端数据优先使用 TanStack Vue Query：

- 查询 key 必须包含 feature 和业务标识。
- Query 函数统一调用 `shared/api/request` 或 feature API 文件。
- 不在组件里直接写 `axios.get/post`。
- 每个 starter 派生项目至少保留一个真实 Query 用例；本模板示例是 `features/studio/queries/runtime-queries.ts`。

## 6. 接口调用规范

统一入口：

- Axios 实例：`apps/web/src/shared/api/client.ts`
- 错误归一：`apps/web/src/shared/api/errors.ts`
- 环境变量：`apps/web/src/shared/config/env.ts`

规则：

- 所有 HTTP 请求通过 `request<T>()` 或基于它封装的 feature API。
- 请求拦截器统一注入 `Authorization: Bearer <token>`。
- 响应错误统一转换为 `AppApiError`。
- `401` 统一清理本地会话；业务页面只决定展示错误还是重试。
- API 返回结构需要跨前后端复用时，先放 `packages/contracts` 并配 Zod schema。
- Feature API 文件负责把接口数据转换为页面需要的模型，组件不直接解析 raw response。

## 7. 鉴权与权限

基础能力：

- `stores/auth-store.ts`：`hydrate`、`setSession`、`clearSession`、`isAuthenticated`、`permissions`、`hasPermission`。
- `shared/auth/permissions.ts`：`canAccess`、`hasRequiredPermissions`。
- `shared/auth/permission-directive.ts`：`v-permission` 控制局部操作显示。

规则：

- 路由级权限用 route meta。
- 按钮、菜单项、危险操作用 `v-permission` 或 `authStore.hasPermission()`。
- 后端仍必须做权限校验；前端权限只负责体验和入口控制。
- Starter 默认 `VITE_ENABLE_MOCK_AUTH=true`，提供本地 `*` 权限账号，方便模板演示。真实项目必须替换为后端会话或 SSO。

## 8. Loading / Empty / Error

通用状态组件：

- `UiStateBlock`：统一 loading、empty、error 展示。
- `UiEmptyState`：保留给非常轻量的空状态。

规则：

- 页面、表格、抽屉、详情面板必须有 loading、empty、error 状态。
- Loading 不改变主布局尺寸，避免跳动。
- Empty 文案说明“为什么为空”和“下一步可以做什么”。
- Error 展示可读信息和可重试动作；不要直接把 raw error dump 到页面。
- 列表和表格优先用 Element Plus 的 `v-loading`、`empty-text`、`ElSkeleton`，复杂面板用 `UiStateBlock`。

## 9. UI 规范

设计标准遵循 `docs/UI_DESIGN_AUDIT.md`。

布局：

- 后台系统：左侧导航 + 顶部/内容工具条 + 主内容 + 可选详情抽屉。
- 智能体系统：任务会话、流程画布、运行事件、审批、产物面板按能力组合，不固定成单一工作台。
- 默认左对齐，强调扫描效率。
- 容器宽度和高度使用稳定约束，避免 hover、加载、长文案导致布局跳动。

间距：

- 只使用 token：`--ui-space-1` 到 `--ui-space-6`。
- 页面边距默认 18-24px，密集面板 12-16px。
- 表格、表单、详情区域之间用清晰分区，不靠大面积留白伪装层级。

表单：

- 使用 Element Plus `ElForm`、`ElFormItem`、`ElInput`、`ElSelect`、`ElDatePicker`。
- 必填、校验、帮助文本和错误提示在表单项内完成。
- 抽屉/弹窗内表单底部固定主次操作，主按钮在右侧。

弹窗与抽屉：

- 短确认用 `ElMessageBox`。
- 编辑复杂对象用 `ElDrawer` 或 `ElDialog`。
- 弹窗标题写对象和动作，不写泛化词，例如“编辑工具权限”优于“提示”。

表格：

- 使用 Element Plus `ElTable`。
- 必须具备 loading、empty、分页或虚拟滚动策略。
- 操作列放右侧，危险操作二次确认。
- 状态、风险、权限用标签或文字组合，不用装饰性图标堆叠。

按钮和图标：

- 按钮文本使用明确动作：保存、发布、取消、重试、批准、拒绝。
- 常见工具按钮使用 `@element-plus/icons-vue`。
- 不手写 SVG 图标，除非是产品品牌资产或现有图标库没有覆盖。
- 危险操作使用 danger 类型，并保留确认流程。

主题变量：

- 颜色、文字、提示、状态、半径、间距、字体全部从 `packages/ui/src/styles/tokens.css` 获取。
- 禁止在 feature 里新增品牌色体系。
- 允许通过 `[data-theme]` 扩展主题，但必须复用同一套变量名。

响应式：

- 1180px 以下收敛为单列或上下布局。
- 640px 以下操作区换行，详情区下移，表格提供横向滚动或改为列表摘要。
- 字号不随视口宽度缩放。
- 长词、URL、模型名、工具名必须可截断或换行，不能溢出按钮、表格单元格和面板。

## 10. 命名规则

详细规则与自动化门禁见 `docs/NAMING_AND_COMMENT_STANDARD.md`。

- Vue 组件：`PascalCase.vue`。
- 组合函数：`useXxx.ts`。
- Store：`useXxxStore`，文件名 `xxx-store.ts`。
- API 文件：`api.ts` 或 `<domain>-api.ts`。
- Schema：`schema.ts`。
- 类型：导出类型用 `PascalCase`，局部变量用 `camelCase`。
- CSS class：项目级样式使用小写 kebab-case，UI 包以 `ui-` 前缀，业务样式以业务域前缀。
- 路由 name：小写 kebab-case。
- 权限码：`domain:action`，例如 `workflow:read`、`run:approve`、`tool:manage`。

## 11. 文件大小与拆分

单文件大小由 `pnpm lint:standards` 强制检查：

- Vue SFC 不超过 420 行。
- TypeScript source 不超过 320 行。
- CSS source 不超过 700 行。
- 任一源码文件不超过 80KB。

拆分规则：

- 页面组件只保留路由入口、布局编排和少量交互 glue code。
- 数据请求拆到 feature API 或 `queries/`。
- 跨组件状态拆到 feature store 或全局 store。
- 复杂计算拆到 `schema.ts`、mapper、adapter 或组合函数。
- 大块模板拆成有业务语义的子组件，不用 `PanelA`、`Block1` 这类占位命名。
- 大 CSS 文件按 token、layout、feature、third-party override 或组件样式拆分。

超限不能通过压缩格式、减少换行、缩短命名或堆注释规避；需要真实拆分职责。

## 12. 环境变量与构建

环境示例在 `apps/web/.env.example`。

```text
VITE_API_BASE_URL=
VITE_AUTH_STORAGE_KEY=agent-flow.auth
VITE_REQUEST_TIMEOUT_MS=10000
VITE_ENABLE_MOCK_AUTH=true
```

规则：

- 所有 Vite 环境变量必须以 `VITE_` 开头。
- 新增变量必须同步更新 `.env.example`、`env.d.ts` 和 `shared/config/env.ts`。
- 不在组件里直接读取 `import.meta.env`。
- 不提交真实密钥、真实 token、生产账号或私有 endpoint。
- 构建配置集中在 `vite.config.ts`；新增代理、alias、测试配置需要说明原因。

## 13. 代码风格与提交规范

代码风格：

- TypeScript strict 必须保持开启。
- 禁用无意义 `any`；未知边界先用 Zod 校验再收窄。
- 优先组合函数、feature API 和 store；不要把请求、权限和展示逻辑堆在页面组件里。
- 导出公共 API 必须使用 TSDoc；内部注释只解释复杂意图，不写机械注释。
- 注释率、TODO 格式、注释掉代码、函数动作前缀、class 命名和单文件大小由 `pnpm lint:standards` 强制检查。
- 架构边界、样式 token 和重复依赖由 `pnpm lint:engineering` 强制检查。

门禁：

```powershell
pnpm format:check
pnpm lint
pnpm lint:style
pnpm lint:standards
pnpm test
pnpm build
pnpm verify
```

提交格式：

```text
<type>(<scope>): <subject>
```

Allowed types:

```text
feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
```

Allowed scopes:

```text
web, ui, contracts, mock-api, runtime, adapter, docs, deps, tooling, config, tests, repo, release
```

示例：

```text
feat(ui): 新增通用状态组件
fix(web): 修复审批抽屉权限判断
docs(repo): 补充前端模块模板
```

## 14. 新页面验收清单

新页面或新模块合入前必须确认：

- 目录符合 `features/<feature>` 分层。
- 路由有 `name`、`meta.title`、必要的 `requiresAuth` 和 `permissions`。
- 请求通过 feature API 和 `request<T>()`。
- 服务端模型来自 `packages/contracts` 或 feature schema。
- 有 loading、empty、error 状态。
- 权限入口和按钮级权限已处理。
- 表单、表格、弹窗使用 Element Plus。
- 样式使用 token，没有新增一套颜色体系。
- 移动端不溢出、不重叠。
- 单文件大小未超过门禁阈值；复杂页面已拆分组件、查询、store 或 adapter。
- 测试覆盖关键行为，至少通过相关 typecheck/test/build。
- UI 通过 `ai-ui-design-audit`，没有过度装饰、嵌套卡片、泛紫蓝渐变和模板化图标卡片。
