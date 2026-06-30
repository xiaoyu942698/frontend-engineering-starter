<template>
  <section class="approval-gate">
    <div class="surface-section-heading is-compact">
      <h2>人工审批</h2>
      <span>{{ approval?.status || 'none' }}</span>
    </div>
    <p>{{ approval?.description || '当前没有待处理审批。' }}</p>
    <div class="approval-actions">
      <el-button :disabled="!approval || approval.status !== 'pending'" @click="$emit('decision', 'rejected')"
        >拒绝</el-button
      >
      <el-button
        type="primary"
        :disabled="!approval || approval.status !== 'pending'"
        @click="$emit('decision', 'approved')"
      >
        批准继续
      </el-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HumanApproval } from '@agent-flow/contracts';

defineProps<{
  approval: HumanApproval | null;
}>();

defineEmits<{
  decision: [decision: 'approved' | 'rejected'];
}>();
</script>
