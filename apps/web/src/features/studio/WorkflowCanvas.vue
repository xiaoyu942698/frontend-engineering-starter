<template>
  <div class="canvas-frame" aria-label="流程编排画布">
    <VueFlow :nodes="flowNodes" :edges="flowEdges" fit-view-on-init class="workflow-flow" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VueFlow } from '@vue-flow/core';
import type { WorkflowDefinition } from '@agent-flow/contracts';

const props = defineProps<{
  workflow: WorkflowDefinition;
  activeNodeId?: string | null;
}>();

const flowNodes = computed(() =>
  props.workflow.nodes.map((node) => ({
    id: node.id,
    label: node.label,
    position: node.position,
    class: node.id === props.activeNodeId ? 'is-active-node' : `node-${node.type}`,
    data: { type: node.type }
  }))
);

const flowEdges = computed(() =>
  props.workflow.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: edge.source === props.activeNodeId,
    style: {
      stroke: edge.source === props.activeNodeId ? 'var(--ui-color-accent-primary)' : 'var(--ui-color-border-strong)'
    }
  }))
);
</script>
