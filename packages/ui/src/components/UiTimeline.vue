<template>
  <ElTimeline class="ui-timeline">
    <ElTimelineItem v-for="item in items" :key="item.id" :color="resolveToneColor(item.tone)" placement="top">
      <div class="ui-timeline-body">
        <div class="ui-timeline-meta">
          <strong>{{ item.title }}</strong>
          <span v-if="item.meta">{{ item.meta }}</span>
        </div>
        <p v-if="item.description">{{ item.description }}</p>
        <pre v-if="item.code">{{ item.code }}</pre>
      </div>
    </ElTimelineItem>
  </ElTimeline>
</template>

<script setup lang="ts">
import { ElTimeline, ElTimelineItem } from 'element-plus';
import type { UiTimelineItem } from '../types';

defineProps<{
  items: UiTimelineItem[];
}>();

function resolveToneColor(tone: UiTimelineItem['tone']) {
  if (tone === 'success') return 'var(--ui-color-success)';
  if (tone === 'warning') return 'var(--ui-color-warning)';
  if (tone === 'danger') return 'var(--ui-color-danger)';
  if (tone === 'primary') return 'var(--ui-color-accent-primary)';
  return 'var(--ui-color-border-strong)';
}
</script>
