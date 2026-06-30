<template>
  <ElTag class="ui-status-badge" :type="tagType" size="small" effect="plain">{{ label }}</ElTag>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElTag } from 'element-plus';
import type { UiTone } from '../types';

const props = withDefaults(
  defineProps<{
    label: string;
    tone?: UiTone;
  }>(),
  {
    tone: 'neutral'
  }
);

const tagType = computed(() => {
  if (props.tone === 'success') return 'success';
  if (props.tone === 'warning') return 'warning';
  if (props.tone === 'danger') return 'danger';
  if (props.tone === 'primary') return 'primary';
  return 'info';
});
</script>
