<template>
  <div class="agent-shell">
    <aside class="agent-sidebar" aria-label="主导航">
      <div class="brand-block">
        <span class="brand-mark">AF</span>
        <div>
          <strong>Agent Flow</strong>
          <span>智能体编排模板</span>
        </div>
      </div>
      <nav class="nav-stack">
        <a
          v-for="item in navItems"
          :key="item.href"
          class="nav-link"
          :class="{ 'is-active': isActive(item.href) }"
          :href="item.href"
        >
          <strong>{{ item.label }}</strong>
          <span>{{ item.description }}</span>
        </a>
      </nav>
      <div class="sidebar-note">
        <span>Frontend stack</span>
        <strong>Vue 3 / Element Plus</strong>
      </div>
    </aside>
    <main class="agent-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const navItems = [
  { href: '#studio', label: 'Agent Studio', description: '任务会话与流程视图' },
  { href: '#runtime', label: 'Runtime', description: '运行事件与审计' },
  { href: '#adapters', label: 'Adapters', description: '框架接入边界' }
];

const currentHash = ref(window.location.hash || '#studio');

function syncHash() {
  currentHash.value = window.location.hash || '#studio';
}

function isActive(href: string) {
  if (href === '#studio') return currentHash.value === '#studio' || currentHash.value === '#workflow';
  return currentHash.value === href;
}

onMounted(() => {
  syncHash();
  window.addEventListener('hashchange', syncHash);
});

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', syncHash);
});
</script>
