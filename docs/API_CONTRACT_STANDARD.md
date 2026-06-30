# API 与数据契约规范

目标是让页面、mock API、真实后端和智能体运行框架之间的边界稳定可测。

## 基本规则

- 所有 HTTP 请求必须通过 `request<T>()` 或基于它封装的 feature API。
- 组件不能直接调用 Axios，不能直接解析 raw response。
- API 返回进入页面前必须经过 Zod schema、contract schema 或 mapper。
- 跨前后端共享模型必须进入 `packages/contracts`。
- Feature 私有模型可以放在 `features/<feature>/schema.ts`。
- 枚举值、状态值、事件类型不要散落在组件中。

## Response 策略

新项目推荐统一 response envelope：

```ts
type ApiResponse<T> = {
  data: T;
  traceId?: string;
};
```

分页推荐：

```ts
type PageResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
```

如果后端已有既定格式，前端必须在 feature API 层转换为页面模型，组件不感知后端差异。

## 错误策略

- HTTP、校验、运行时错误统一转换为 `AppApiError`。
- `401` 由请求层清理会话。
- 页面只决定展示错误、重试或跳转。
- 不把 raw Axios error、堆栈或后端敏感字段直接展示给用户。

## 智能体事件流

- `RunEvent`、`TraceSpan`、`HumanApproval`、`Artifact` 等结构优先放入 contracts。
- SSE 或 WebSocket message 必须在边界解析。
- 事件顺序、取消、审批、失败和 artifact 输出必须有测试。
- 页面只消费解析后的事件模型，不直接依赖具体运行框架事件。

## 验证要求

- 新增 contract 必须有 Zod schema 测试。
- 新增 feature API 必须覆盖成功、校验失败和错误归一。
- 新增运行流必须覆盖事件顺序和终态。
