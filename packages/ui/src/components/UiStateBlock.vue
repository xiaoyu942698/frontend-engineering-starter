<template>
  <div class="ui-state-block" :data-state="state" :data-compact="compact">
    <ElSkeleton v-if="state === 'loading'" :rows="rows" animated />

    <ElResult
      v-else-if="state === 'error'"
      icon="error"
      :title="title || '加载失败'"
      :sub-title="description || '请稍后重试，或检查接口与权限配置。'"
    >
      <template v-if="actionLabel || $slots.action" #extra>
        <slot name="action">
          <ElButton type="primary" @click="$emit('action')">{{ actionLabel }}</ElButton>
        </slot>
      </template>
    </ElResult>

    <ElEmpty v-else :description="description || title || '暂无数据'" :image-size="compact ? 56 : 72">
      <template v-if="title || actionLabel || $slots.action" #default>
        <strong v-if="title">{{ title }}</strong>
        <slot name="action">
          <ElButton v-if="actionLabel" type="primary" @click="$emit('action')">{{ actionLabel }}</ElButton>
        </slot>
      </template>
    </ElEmpty>
  </div>
</template>

<script setup lang="ts">
import { ElButton, ElEmpty, ElResult, ElSkeleton } from 'element-plus';

withDefaults(
  defineProps<{
    state: 'loading' | 'empty' | 'error';
    title?: string;
    description?: string;
    actionLabel?: string;
    rows?: number;
    compact?: boolean;
  }>(),
  {
    title: undefined,
    description: undefined,
    actionLabel: undefined,
    rows: 3,
    compact: false
  }
);

defineEmits<{
  action: [];
}>();
</script>
