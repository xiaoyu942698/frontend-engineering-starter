<template>
  <ElDescriptions class="ui-key-value-list" :column="1" size="small">
    <ElDescriptionsItem v-for="item in items" :key="item.label" :label="item.label">
      <span :data-tone="item.tone || 'neutral'">{{ item.value }}</span>
    </ElDescriptionsItem>
  </ElDescriptions>
</template>

<script setup lang="ts">
import { ElDescriptions, ElDescriptionsItem } from 'element-plus';
import type { UiKeyValueItem } from '../types';

defineProps<{
  items: UiKeyValueItem[];
}>();
</script>
