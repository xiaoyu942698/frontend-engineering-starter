import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import AgentStudio from '../src/features/studio/AgentStudio.vue';

function mountStudio() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return mount(AgentStudio, {
    global: {
      plugins: [createPinia(), [VueQueryPlugin, { queryClient }]]
    }
  });
}

describe('AgentStudio', () => {
  it('renders the orchestration shell with workflow, timeline, and approval regions', () => {
    const wrapper = mountStudio();

    expect(wrapper.text()).toContain('Agent Studio');
    expect(wrapper.text()).toContain('流程编排');
    expect(wrapper.text()).toContain('运行事件');
    expect(wrapper.text()).toContain('人工审批');
  });
});
