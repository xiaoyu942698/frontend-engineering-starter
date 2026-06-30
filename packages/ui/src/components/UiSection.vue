<template>
  <section class="ui-section">
    <div class="ui-section-heading">
      <div>
        <h2>{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>
      <span v-if="meta">{{ meta }}</span>
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  meta?: string;
}>();
</script>
