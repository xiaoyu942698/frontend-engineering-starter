# 命名与注释规范

本文档是前端工程化硬门禁的一部分。规则由 `eslint.config.js`、`stylelint.config.cjs` 和 `scripts/check-naming-and-comments.mjs` 执行；不满足时 `pnpm lint`、pre-commit、pre-push、CI 和合并检查都必须失败。

## 1. Class 命名

CSS class 必须使用小写 kebab/BEM，并带明确命名空间。

允许前缀：

```text
ui, app, agent, studio, surface, task, message, session, workflow, audit,
adapter, resource, catalog, approval, artifact, canvas, composer, overview,
sidebar, brand, nav, capability, node, is, has, el, vue-flow, muted
```

格式：

```text
block
block-name
block__element
block--modifier
is-active
has-error
```

规则：

- `packages/ui` 组件必须使用 `ui-*`。
- 应用壳和全局页面使用 `app-*`、`agent-*` 或明确业务前缀。
- Feature 样式使用 feature 或对象前缀，例如 `studio-*`、`workflow-*`、`approval-*`。
- 状态类只能使用 `is-*` 或 `has-*`。
- 第三方覆盖只允许 `.el-*` 和 `.vue-flow-*`。
- 禁止 `box`、`content`、`left`、`right`、`card1`、`item2`、`red-text` 这类无语义或表现型命名。

## 2. 函数命名

函数必须使用 `camelCase`，并以动作或判断前缀开始。

允许动作前缀：

```text
use, fetch, list, get, find, create, update, delete, remove, submit, cancel,
request, map, format, normalize, parse, resolve, build, read, write, sync,
handle, is, has, can, should, load, run, mount, apply, render, validate,
assert, set, clear, toggle, start, stop, open, close, matches
```

规则：

- Vue composable 使用 `useXxx`。
- 事件处理函数使用 `handleXxx`。
- 布尔判断使用 `isXxx`、`hasXxx`、`canXxx`、`shouldXxx`。
- 数据转换使用 `mapXxx`、`formatXxx`、`normalizeXxx`、`parseXxx`。
- API 请求使用 `fetchXxx`、`requestXxx`、`submitXxx`。
- 禁止 `doSomething`、`processData`、`handleData`、`temp`、`foo`、`test1`。

## 3. 类型与变量命名

- 类型、接口、class、Vue 组件使用 `PascalCase`。
- 变量、参数、函数使用 `camelCase`。
- 常量可使用 `UPPER_CASE`，仅限真正的不可变常量。
- API 原始字段可在对象字面量中保留后端命名，但进入前端模型后必须转换为前端命名。

## 4. 注释格式

导出的公共 API 必须使用 TSDoc：

```ts
/**
 * Converts transport, validation, and runtime errors into AppApiError.
 */
export function normalizeApiError(error: unknown): AppApiError {
  // ...
}
```

内部复杂逻辑允许使用意图型行注释：

```ts
// Reason: SSE parse failure must close the stream to avoid duplicate callbacks.
```

TODO 必须带 scope：

```ts
// TODO(runtime): Replace mock auth after the SSO contract is finalized.
```

禁止：

- 翻译代码的机械注释。
- 注释掉的旧代码。
- 没有 scope 的 TODO。
- 用注释掩盖不清晰的命名。

## 5. 注释率

基础层 TypeScript 文件需要保持合理注释密度：

- 最低：2%。
- 最高：25%。
- 统计范围：`apps/web/src/shared`、`apps/web/src/stores`、`apps/mock-api/src/runtime.ts`、`packages/contracts/src/index.ts`。

业务 Vue 组件不强制注释率；优先通过命名、组件拆分和类型表达意图。

## 6. 单文件大小

源码文件必须保持可审查、可拆分、可测试。`pnpm lint:standards` 会强制检查以下硬上限：

| 文件类型          | 行数上限 | 字节上限 |
| ----------------- | -------: | -------: |
| Vue SFC           |   420 行 |     80KB |
| TypeScript source |   320 行 |     80KB |
| CSS source        |   700 行 |     80KB |

拆分优先级：

- Vue SFC 超限：拆出子组件、组合函数、feature API、query 或 store。
- TypeScript 超限：按模型、校验、转换、请求、状态或运行适配边界拆分。
- CSS 超限：按 token、layout、feature、third-party override 或组件层拆分。
- 测试或 fixture 超限：优先拆场景，不把多个无关用例堆在一个文件。

禁止通过无意义缩短命名、压缩格式、合并行或把逻辑挪到注释中规避大小门禁。如确需临时豁免，必须在 PR 中说明原因、风险、负责人和拆分计划。

## 7. 门禁命令

```powershell
pnpm lint:style
pnpm lint:standards
pnpm lint
pnpm verify
```

`pnpm lint:standards` 会检查：

- Vue template 和 CSS class 命名。
- 函数动作前缀。
- 导出公共 API 的 TSDoc。
- 注释密度。
- 单文件行数和字节大小。
- TODO 格式。
- 注释掉的代码。

## 8. 合并要求

合并前必须同时满足：

- `CI / verify` 通过。
- `Codex Review / codex_review` 通过。
- PR 模板中的 Codex review 记录已填写。
- 没有命名、注释和单文件大小规范豁免；如确需豁免，必须在 PR 中说明原因和后续整改计划。
