<template>
  <UiStateBlock
    v-if="events.length === 0"
    state="empty"
    title="暂无运行事件"
    description="运行开始后会按顺序展示节点、工具、审批和产物事件。"
    compact
  />
  <UiTimeline v-else :items="timelineItems" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RunEvent } from '@agent-flow/contracts';
import { UiStateBlock, UiTimeline, type UiTimelineItem } from '@agent-flow/ui';

const props = defineProps<{
  events: RunEvent[];
}>();

const timelineItems = computed<UiTimelineItem[]>(() =>
  props.events.map((event) => ({
    id: event.id,
    title: event.message,
    meta: `${event.type} · ${event.status}`,
    description: event.nodeId ? `节点：${event.nodeId}` : undefined,
    code: event.toolCall ? JSON.stringify(event.toolCall.input, null, 2) : undefined,
    tone: event.status === 'completed' ? 'success' : event.status === 'failed' ? 'danger' : 'neutral'
  }))
);
</script>
