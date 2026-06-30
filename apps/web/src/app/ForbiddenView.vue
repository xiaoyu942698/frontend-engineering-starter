<template>
  <section class="app-state-page">
    <UiStateBlock
      state="error"
      title="没有访问权限"
      description="当前账号缺少访问该页面所需的权限，请切换账号或联系系统管理员。"
      action-label="返回首页"
      @action="$router.replace('/')"
    />
  </section>
</template>

<script setup lang="ts">
import { UiStateBlock } from '@agent-flow/ui';
</script>
