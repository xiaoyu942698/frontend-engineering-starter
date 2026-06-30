<template>
  <ElMenu class="ui-surface-nav" :default-active="activeId" @select="handleSelectItem">
    <ElMenuItem v-for="item in items" :key="item.id" class="ui-surface-tab" :index="item.id">
      <span>
        <strong>{{ item.label }}</strong>
        <small v-if="item.description">{{ item.description }}</small>
      </span>
      <em v-if="item.meta">{{ item.meta }}</em>
    </ElMenuItem>
  </ElMenu>
</template>

<script setup lang="ts">
import { ElMenu, ElMenuItem } from 'element-plus';
import type { UiSurfaceNavItem } from '../types';

defineProps<{
  items: UiSurfaceNavItem[];
  activeId: string;
}>();

const emit = defineEmits<{
  'update:activeId': [id: string];
}>();

function handleSelectItem(index: string) {
  emit('update:activeId', index);
}
</script>
