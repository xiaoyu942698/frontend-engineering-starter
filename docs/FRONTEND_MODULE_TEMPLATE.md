# 新前端模块模板

复制本文档中的片段创建新页面或新业务模块。真实代码放在 `apps/web/src/features/<feature>`，通用能力优先复用 `shared`、`packages/ui` 和 `packages/contracts`。

## 目录模板

```text
apps/web/src/features/example/
  pages/ExamplePage.vue
  components/ExampleTable.vue
  queries/example-queries.ts
  stores/example-store.ts
  schema.ts
  api.ts
  routes.ts
  index.ts
```

## Route

```ts
import type { RouteRecordRaw } from 'vue-router';
import ExamplePage from './pages/ExamplePage.vue';

export const exampleRoutes: RouteRecordRaw[] = [
  {
    path: '/examples',
    name: 'examples',
    component: ExamplePage,
    meta: {
      title: '示例模块',
      requiresAuth: true,
      permissions: ['example:read']
    }
  }
];
```

接入方式：在 `apps/web/src/router/index.ts` 导入模块 routes，并展开到主路由表。

## API

```ts
import { z } from 'zod';
import { request } from '@/shared/api/client';

const ExampleItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['enabled', 'disabled'])
});

export type ExampleItem = z.infer<typeof ExampleItemSchema>;

const ExampleListSchema = z.array(ExampleItemSchema);

export async function listExamples() {
  const data = await request<unknown>({
    method: 'GET',
    url: '/api/examples'
  });

  return ExampleListSchema.parse(data);
}
```

## Query

```ts
import { useQuery } from '@tanstack/vue-query';
import { listExamples } from '../api';

export function useExampleListQuery() {
  return useQuery({
    queryKey: ['examples', 'list'],
    queryFn: listExamples
  });
}
```

## Store

```ts
import { defineStore } from 'pinia';

export const useExampleStore = defineStore('example', {
  state: () => ({
    selectedId: null as string | null
  }),
  actions: {
    select(id: string | null) {
      this.selectedId = id;
    }
  }
});
```

## Page

```vue
<template>
  <section class="example-page">
    <UiPageHeader eyebrow="Example" title="示例模块" description="页面描述只说明业务对象和主要动作。">
      <template #actions>
        <el-button v-permission="'example:create'" type="primary">新建</el-button>
      </template>
    </UiPageHeader>

    <UiStateBlock v-if="query.isLoading.value" state="loading" />
    <UiStateBlock
      v-else-if="query.isError.value"
      state="error"
      title="加载失败"
      :description="getApiErrorMessage(query.error.value)"
      action-label="重试"
      @action="query.refetch()"
    />
    <UiStateBlock
      v-else-if="!query.data.value?.length"
      state="empty"
      title="暂无示例"
      description="创建后将在这里展示。"
    />
    <ExampleTable v-else :items="query.data.value" />
  </section>
</template>

<script setup lang="ts">
import { UiPageHeader, UiStateBlock } from '@agent-flow/ui';
import { getApiErrorMessage } from '@/shared/api/errors';
import ExampleTable from '../components/ExampleTable.vue';
import { useExampleListQuery } from '../queries/example-queries';

const query = useExampleListQuery();
</script>
```

## Component

```vue
<template>
  <el-table :data="items" row-key="id">
    <el-table-column prop="name" label="名称" min-width="180" />
    <el-table-column prop="status" label="状态" width="120" />
    <el-table-column label="操作" width="160" fixed="right">
      <template #default="{ row }">
        <el-button v-permission="'example:update'" link type="primary">编辑</el-button>
        <el-button v-permission="'example:delete'" link type="danger">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import type { ExampleItem } from '../api';

defineProps<{
  items: ExampleItem[];
}>();
</script>
```

## 新模块检查项

- 先确认 Element Plus、TanStack Vue Query、Pinia、Zod、Vue Flow 或 `packages/ui` 是否已有能力。
- 新增环境变量时同步更新 `apps/web/.env.example`、`env.d.ts` 和 `shared/config/env.ts`。
- 新增权限码时使用 `domain:action`，并在 route meta 和按钮入口处同时处理。
- 新增 API 时必须走 `request<T>()`，并在边界用 Zod 校验。
- 新增 UI 时先复用 token，不新增孤立色值和组件风格。
