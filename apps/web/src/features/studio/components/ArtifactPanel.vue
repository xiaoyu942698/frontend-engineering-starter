<template>
  <section class="artifact-panel">
    <div class="surface-section-heading is-compact">
      <h2>结果面板</h2>
      <span>{{ artifacts.length }} 个产物</span>
    </div>
    <article v-if="artifacts[0]" class="artifact-block">
      <strong>{{ artifacts[0].title }}</strong>
      <pre>{{ artifacts[0].content }}</pre>
    </article>
    <UiStateBlock
      v-else
      state="empty"
      title="暂无结果产物"
      description="运行完成后在这里展示 Markdown、JSON 或表格产物。"
      compact
    />
  </section>
</template>

<script setup lang="ts">
import type { Artifact } from '@agent-flow/contracts';
import { UiStateBlock } from '@agent-flow/ui';

defineProps<{
  artifacts: Artifact[];
}>();
</script>
