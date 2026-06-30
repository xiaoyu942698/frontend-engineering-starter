<template>
  <div class="resource-catalog">
    <section class="catalog-group">
      <div class="surface-section-heading is-compact">
        <h2>Agent 资源</h2>
        <span>{{ agents.length }}</span>
      </div>
      <button v-for="agent in agents" :key="agent.id" class="resource-row" type="button">
        <span>
          <strong>{{ agent.name }}</strong>
          <small>{{ agent.role }} / {{ agent.model }}</small>
        </span>
      </button>
    </section>

    <section class="catalog-group">
      <div class="surface-section-heading is-compact">
        <h2>工具能力</h2>
        <span>{{ tools.length }}</span>
      </div>
      <button v-for="tool in tools" :key="tool.id" class="resource-row" type="button">
        <span>
          <strong>{{ tool.name }}</strong>
          <small>{{ tool.kind }} · {{ tool.risk }}</small>
        </span>
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { AgentDefinition, ToolDefinition } from '@agent-flow/contracts';

defineProps<{
  agents: AgentDefinition[];
  tools: ToolDefinition[];
}>();
</script>
