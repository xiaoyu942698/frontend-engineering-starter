<template>
  <div class="ui-empty-state">
    <ElEmpty :description="description || title" :image-size="72">
      <template v-if="description" #default>
        <strong>{{ title }}</strong>
      </template>
    </ElEmpty>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ElEmpty } from 'element-plus';

defineProps<{
  title: string;
  description?: string;
}>();
</script>
