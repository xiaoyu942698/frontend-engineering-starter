# Codex 规则路由

本文档给 Codex 和 AI agent 使用。普通使用者只需要描述需求，不需要理解或复述这些规则。Codex 在动手前应根据任务类型内部选择规则，并在完成后按对应验证命令收口。

## 通用原则

- 不向普通使用者输出完整规则清单，除非用户要求解释。
- 需求不清、会影响架构边界、会改变门禁、会引入新依赖时，先简短确认。
- 默认复用 Element Plus、Vue Flow、Pinia、Vue Query、Axios、Zod 和 `packages/ui`。
- 不使用 `--no-verify`，不跳过 `pnpm verify`，不建议绕过 required checks。
- 代码结构和影响分析优先使用 CodeGraph。

## 任务类型路由

| 任务类型                | 必读规则                                                                                                                             | 必跑验证                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| 新页面 / 新模块         | `FRONTEND_ENGINEERING_STANDARD`、`FRONTEND_MODULE_TEMPLATE`、`ARCHITECTURE_BOUNDARY_STANDARD`、`TESTING_STANDARD`、`UI_DESIGN_AUDIT` | `pnpm lint`、相关测试、`pnpm build`                      |
| 新组件 / 通用组件       | `COMPONENT_STANDARD`、`UI_DESIGN_AUDIT`、`NAMING_AND_COMMENT_STANDARD`、`ACCESSIBILITY_STANDARD`                                     | `pnpm lint`、组件测试或相关页面测试                      |
| 接口 / 数据模型         | `API_CONTRACT_STANDARD`、`ARCHITECTURE_BOUNDARY_STANDARD`、`TESTING_STANDARD`                                                        | API/contract 测试、`pnpm lint`                           |
| 权限 / 鉴权             | `SECURITY_FRONTEND_STANDARD`、`ARCHITECTURE_BOUNDARY_STANDARD`、`FRONTEND_ENGINEERING_STANDARD`                                      | 权限测试、路由测试、`pnpm lint`                          |
| 智能体运行流            | `RUNTIME_ADAPTERS`、`API_CONTRACT_STANDARD`、`ARCHITECTURE_BOUNDARY_STANDARD`                                                        | runtime/mock-api 测试、web 运行流测试                    |
| 样式 / 主题             | `UI_DESIGN_AUDIT`、`COMPONENT_STANDARD`、`ARCHITECTURE_BOUNDARY_STANDARD`                                                            | `pnpm lint:style`、`pnpm lint:engineering`、截图或 smoke |
| 性能优化                | `PERFORMANCE_BUDGET`、`ARCHITECTURE_BOUNDARY_STANDARD`                                                                               | build、相关性能检查、必要时 bundle 分析                  |
| 安全修复                | `SECURITY_FRONTEND_STANDARD`、`API_CONTRACT_STANDARD`                                                                                | 安全相关测试、`pnpm verify`                              |
| 门禁 / CI / GitHub 配置 | `GIT_MERGE_GATES`、`GITHUB_BRANCH_PROTECTION`                                                                                        | `pnpm check:gates`、`pnpm verify`                        |

## 输出策略

对普通使用者：

- 开始时只简短说明会按当前规范处理。
- 结束时只说明做了什么、跑了哪些验证、还有什么未验证。
- 不输出内部路由、长计划和完整规则清单。

对 PR / Review：

- 必须提供验证证据。
- 修改门禁、依赖、架构边界时必须说明影响范围。
- Codex Review 必须检查是否绕过规则和 required checks。
