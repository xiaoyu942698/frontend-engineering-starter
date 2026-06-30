<template>
  <div class="ui-surface-frame">
    <aside v-if="$slots.sidebar" class="ui-surface-sidebar">
      <slot name="sidebar" />
    </aside>
    <main class="ui-surface-main">
      <slot />
    </main>
    <aside v-if="$slots.inspector" class="ui-surface-inspector">
      <slot name="inspector" />
    </aside>
  </div>
</template>
