# 测试规范

测试策略按风险和边界分层，不追求无意义覆盖率。

## 分层要求

| 改动类型                    | 最低测试要求                                       |
| --------------------------- | -------------------------------------------------- |
| contracts / schema          | Zod parse 成功、失败、默认值和枚举测试             |
| mapper / formatter / helper | 单元测试                                           |
| shared/api                  | 成功响应、错误归一、校验失败测试                   |
| shared/auth / router guard  | 登录、无权限、有权限测试                           |
| RuntimeAdapter / mock-api   | start、stream、cancel、approval、artifact 流程测试 |
| store / composable          | 状态变化、派生状态和错误路径测试                   |
| feature 页面                | loading、empty、error、权限入口和主流程测试        |
| UI 变更                     | 组件测试或 Playwright smoke，必要时截图验收        |

## 覆盖率策略

新项目建议逐步启用覆盖率门禁：

- `packages/contracts`：80% 起。
- `apps/web/src/shared`：80% 起。
- `apps/mock-api/src/runtime.ts`：80% 起。
- Feature 首版不强制全量覆盖，但核心权限、请求、审批和运行流必须覆盖。

老项目迁移时先用 report 模式跑覆盖率，再分模块提高。

本模板已提供本地覆盖率入口：

```powershell
pnpm test:coverage
```

该命令默认生成 coverage report，不进入默认 `pnpm verify`。真实项目稳定后，可以先对 `packages/contracts`、`shared/api`、`shared/auth`、`shared/runtime` 设置阈值，再进入 required checks。

## TDD / 回归

- 新增硬门禁脚本必须先写失败用例。
- Bug fix 应先用测试复现失败，再修复。
- 修改共享 contract、auth、api、runtime 时必须补回归测试。
- 不能只靠浏览器手测证明逻辑正确。

## 验证命令

```powershell
pnpm test
pnpm --filter @agent-flow/contracts test
pnpm --filter @agent-flow/mock-api test
pnpm --filter @agent-flow/web test
pnpm --filter @agent-flow/web test:e2e
pnpm verify:e2e
```
