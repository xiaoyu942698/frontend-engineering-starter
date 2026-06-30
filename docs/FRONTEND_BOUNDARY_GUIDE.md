# 前端工程边界说明

这份文档给人看，不是给机器看。它解释这个模板为什么要分目录、为什么有些写法会被拦、遇到需求时应该把代码放在哪里。

如果你只记一件事：页面负责组织，feature 负责业务，shared 负责基础能力，packages 负责跨项目复用。

## 1. 这个模板想解决什么

这个模板不是只做中后台，也不是只做智能体工作台。它想提供一套通用前端架构，让后台系统、智能体系统、审批系统、运行审计、流程编排、工具调用页面都能按同一种方式开发。

它的目标是：

- 新人能看懂代码放在哪里。
- Codex 能按规则生成代码，不靠临场发挥。
- Review 能快速判断有没有越界。
- 项目长大后还能拆得动、测得动、改得动。

所以这里的规则不是为了“形式正确”，而是为了避免三类常见问题：

- 所有东西都写在页面里，最后页面变成几千行。
- 每个模块都自己封装请求、权限、样式、状态，项目越写越散。
- AI 或新人为了快，绕过已有基础能力，短期能跑，长期难维护。

## 2. 一句话看懂目录边界

```text
apps/web/src/app        应用壳，放全局布局和入口
apps/web/src/router     路由和路由权限
apps/web/src/stores     全局客户端状态
apps/web/src/shared     请求、鉴权、配置、运行适配等基础能力
apps/web/src/features   具体业务模块
packages/ui             可跨项目复用的 UI 基础组件和设计 token
packages/contracts      前后端共享的数据结构和校验
apps/mock-api           本地 mock 后端和运行时示例
```

简单判断：

- 和某个业务强相关，放 `features/<feature>`。
- 多个业务都要用，但不是视觉组件，放 `shared`。
- 多个项目都能用的视觉和布局能力，放 `packages/ui`。
- 前后端都要认同的数据结构，放 `packages/contracts`。
- 只是本地演示接口，放 `apps/mock-api`。

## 3. 页面应该做什么

页面是入口，不是垃圾桶。

页面可以做：

- 组织页面布局。
- 调用 query 或 store。
- 组合 feature 组件。
- 处理路由参数。
- 决定 loading、empty、error 展示。

页面不应该做：

- 直接写 `axios.get()`。
- 直接解析后端 raw response。
- 写一堆权限判断。
- 写复杂数据转换。
- 写大量业务组件模板。
- 写一大段样式定义全新视觉风格。

如果页面开始变长，优先拆这些东西：

- 请求逻辑拆到 `api.ts` 或 `queries/`。
- 复杂展示拆到 `components/`。
- 跨组件状态拆到 store。
- 数据转换拆到 mapper 或 schema。
- 共享能力上移到 `shared` 或 `packages`。

## 4. Feature 应该做什么

Feature 是业务模块，例如 `studio`、`workflow`、`approval`、`artifact`、`user`、`role`。

Feature 内部可以有：

```text
pages/       页面入口
components/ 只服务这个 feature 的组件
queries/    Vue Query 查询
stores/     这个 feature 内共享的客户端状态
schema.ts   这个 feature 私有的数据校验
api.ts      这个 feature 的接口封装
routes.ts   这个 feature 的路由
```

Feature 的规则很简单：

- 不能直接引用另一个 feature 的私有文件。
- 不能自己重新造请求、权限、主题、状态框架。
- 如果某段代码两个 feature 都要用，就不要互相 import，应该上移。

例子：

- `workflow` 想用 `approval/components/ApprovalDrawer.vue`：不建议。
- 如果它真的是通用审批抽屉，放到 `packages/ui` 或 `shared`。
- 如果它只适合 approval 业务，就让 workflow 自己写业务组件。

## 5. Shared 应该做什么

`shared` 放的是应用基础能力，不是业务代码。

适合放进 shared：

- 请求封装。
- 错误归一。
- 鉴权和权限判断。
- 环境变量解析。
- RuntimeAdapter 抽象。
- 通用工具函数。

不适合放进 shared：

- 某个页面的表格列配置。
- 某个业务的状态枚举。
- 某个接口的临时 mapper。
- 某个模块自己的弹窗状态。

判断方式：如果换一个项目也大概率需要它，它可能属于 shared。如果只有一个业务模块需要它，它应该留在 feature。

## 6. packages/ui 应该做什么

`packages/ui` 是跨项目 UI 基础层，不是业务组件仓库。

适合放：

- 设计 token。
- 页面标题。
- 状态块。
- 通用布局壳。
- 时间线。
- KV 列表。
- 通用导航结构。

不适合放：

- 带业务字段的组件，例如 `AgentRunCard`、`UserRoleTable`。
- 依赖权限码的按钮。
- 依赖接口模型的表格。
- 只在一个业务页面出现的组件。

`packages/ui` 的标准是：它不知道你的业务是什么，但能帮你把界面组织好。

## 7. packages/contracts 应该做什么

`packages/contracts` 放前后端都必须认同的数据结构。

适合放：

- Agent。
- Tool。
- Workflow。
- Run。
- RunEvent。
- HumanApproval。
- Artifact。
- 跨端共享的 enum。
- Zod schema。

不适合放：

- 页面展示专用字段。
- UI 状态。
- 表格筛选状态。
- 某个组件的 props 类型。

contracts 的变化影响大。改它时要想到：mock API、真实后端、前端页面、测试都会受影响。

## 8. 请求为什么必须走 shared/api

不是因为 Axios 不能用，而是因为直接用 Axios 会绕过统一能力。

统一请求层负责：

- baseURL。
- timeout。
- token 注入。
- 401 会话清理。
- 错误归一。
- response 校验。

如果每个组件都自己 `axios.get()`，项目很快会出现：

- 有的请求带 token，有的不带。
- 有的错误能显示，有的直接爆 raw error。
- 有的接口做了校验，有的没有。
- 后端换格式时全项目到处改。

所以规则是：组件不要直接请求接口，先封装到 feature API，再给 query 或页面使用。

## 9. 权限为什么不能散着写

权限分两层：

- 路由权限：这个页面能不能进。
- 操作权限：这个按钮或动作能不能用。

路由权限放在 route meta，按钮权限用 `v-permission` 或 auth store。

不要在页面里到处写零散判断，例如：

```ts
if (user.role === 'admin') {
  // ...
}
```

这样以后权限模型一变，全项目都会散着改。

## 10. 样式为什么必须用 token

样式 token 是项目的视觉合同。

颜色、文字、间距、圆角、阴影都应该来自 token。这样换主题、换品牌、做暗色、做部门统一规范时，不需要逐个页面找色值。

不要在 feature 里直接写：

```css
color: #3366ff;
margin: 17px;
border-radius: 13px;
```

应该优先用：

```css
color: var(--ui-color-accent-primary);
margin: var(--ui-space-4);
border-radius: var(--ui-radius-2);
```

如果 token 不够，先判断它是不是通用设计变量。是的话加到 `packages/ui/src/styles/tokens.css`；不是的话留在局部，但要有明确理由。

## 11. 智能体运行框架为什么要隔离

前端模板不绑定 LangGraph、CrewAI、Mastra、OpenAI Agents SDK 或 Google ADK。

这些框架可以接，但要接在 RuntimeAdapter 后面。页面只认共同概念：

- workflow。
- run。
- event。
- approval。
- artifact。
- tool call。
- trace span。

这样后端从 MockRuntime 换成 LangGraph，或从 LangGraph 换成其他运行框架，前端页面不需要大改。

## 12. 什么时候该新增依赖

先问三个问题：

- Element Plus、Vue Flow、Pinia、Vue Query、Axios、Zod 能不能解决？
- 这个依赖是不是多个项目都会用？
- 它带来的体积、维护成本和学习成本是否值得？

不要为了一两个效果引入新库。尤其不要新增第二套 UI 框架、第二套状态库、第二套请求库。

## 13. 新需求应该怎么落

拿到一个新页面需求，推荐按这个顺序想：

1. 这是哪个 feature？
2. 需要哪些接口？接口模型是否要进 contracts？
3. 路由是否需要登录和权限？
4. 页面有哪些 loading、empty、error 状态？
5. 组件哪些是业务私有，哪些可能通用？
6. 是否需要 store，还是 Vue Query 就够了？
7. 样式是否能用现有 token？
8. 需要哪些测试？

如果让 Codex 写代码，普通说法就够：

```text
在现有前端工程规范下新增一个运行审计页面，包含列表、详情、权限控制、loading/empty/error 状态和测试。
```

Codex 应该自己按规则找位置、拆文件、跑验证。

## 14. 常见错误

| 错误写法                     | 为什么不行                       | 应该怎么做              |
| ---------------------------- | -------------------------------- | ----------------------- |
| 组件里直接 axios             | 绕过 token、错误、校验、401 处理 | 封装到 feature API      |
| 页面里写很多转换逻辑         | 页面变重，难测                   | 拆 mapper/schema        |
| feature 互相 import 私有组件 | 模块耦合                         | 上移 shared 或 packages |
| packages/ui 放业务组件       | 通用层被污染                     | 留在 feature            |
| feature 里硬编码颜色         | 主题不可控                       | 使用 token              |
| 直接 import Agent SDK        | 前端绑定后端框架                 | 走 RuntimeAdapter       |
| 新增第二套 UI 库             | 风格和体积失控                   | 使用 Element Plus       |
| 跳过验证提交                 | 合并风险不可控                   | 跑 `pnpm verify`        |

## 15. 不确定时怎么判断

可以用这几个问题判断边界：

- 这段代码只服务一个业务吗？是的话放 feature。
- 两个以上 feature 都要用吗？考虑 shared 或 packages。
- 它是视觉基础能力吗？考虑 packages/ui。
- 它是前后端共同语言吗？考虑 packages/contracts。
- 它依赖具体后端运行框架吗？隔离到 adapter。
- 它会影响鉴权、请求、路由、构建、CI 吗？需要更谨慎，必须跑完整验证。

如果还是不确定，先放在更窄的地方。代码可以从 feature 上移到 shared，但从 shared 拆回 feature 往往更麻烦。

## 16. 提交为什么会被拦

被拦通常不是坏事，说明规则在保护项目。

常见拦截原因：

- 格式不统一。
- class 或函数命名不符合规范。
- 文件太大。
- 注释不符合格式。
- 组件直接请求接口。
- 样式硬编码颜色。
- 新增了重复依赖。
- 测试失败。
- build 失败。
- Codex Review 认为绕过了架构边界或验证不足。

本地先跑：

```powershell
pnpm verify
```

如果是门禁配置相关改动，再跑：

```powershell
pnpm check:gates
```

## 17. 最后的原则

这套边界不是为了限制开发速度，而是为了让开发速度可持续。

短期最快的写法通常是“直接写在页面里”。长期最快的写法是“放在正确的边界里”。这个模板选择后者。
