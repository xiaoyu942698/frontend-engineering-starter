# 组件规范

本文档定义 feature 组件和 `packages/ui` 通用组件的边界、API 和质量要求。

## 分层

- Element Plus：基础控件，优先直接使用。
- `packages/ui`：token、布局、状态、导航、KV、timeline 等跨项目薄封装。
- Feature components：表达业务对象和业务交互。
- Page components：只做路由入口、布局和数据编排。

## Props / Emits

- Props 必须有明确 TypeScript 类型。
- 可选 props 必须有清晰默认策略，复杂默认值使用 `withDefaults`。
- Emits 必须显式声明事件名和载荷类型。
- `v-model` 只用于真实双向状态，不用于普通命令。
- 不把 raw API response 作为 props 传入组件。

## 状态

组件需要根据场景支持：

- loading。
- empty。
- error。
- disabled。
- permission hidden 或 permission disabled。
- readonly。

复杂页面优先使用 `UiStateBlock`，表格和表单优先用 Element Plus 原生状态。

## 插槽

- 插槽用于扩展布局，不用于绕过组件职责。
- 插槽名必须表达位置或语义，例如 `actions`、`footer`、`detail`。
- 通用组件不得要求业务方传入大量结构化 slot 才能工作。

## 样式

- 使用 token，不写硬编码品牌色。
- 不使用卡片套卡片。
- 不为单个 feature 新建一套视觉语言。
- 图标优先使用 Element Plus icon。
- 移动端必须保证文字不溢出、不重叠。

## 进入 packages/ui 的条件

同时满足才进入 `packages/ui`：

- 跨至少两个业务场景可复用。
- 不依赖业务模型、权限码或 API 结构。
- 只封装布局、状态、token 或成熟组件组合。
- 有清晰 props/emits，且不泄露 feature 内部状态。

不满足时留在 feature 内。
