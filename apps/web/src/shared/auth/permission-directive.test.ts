import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';
import { permissionDirective } from './permission-directive';

function mountActions(permissions: string[]) {
  window.localStorage.clear();

  const pinia = createPinia();
  setActivePinia(pinia);

  const authStore = useAuthStore();
  authStore.setSession({
    accessToken: null,
    user: {
      id: 'operator',
      name: 'Operator',
      role: 'ops',
      permissions
    }
  });

  return mount(
    {
      template: `
        <div>
          <button v-permission="'run:approve'">批准</button>
          <button v-permission="{ permissions: ['tool:manage', 'run:approve'], mode: 'any' }">工具管理</button>
          <button v-permission="'admin:write'">管理</button>
        </div>
      `
    },
    {
      global: {
        plugins: [pinia],
        directives: {
          permission: permissionDirective
        }
      }
    }
  );
}

describe('permissionDirective', () => {
  it('shows allowed actions and hides disallowed actions', () => {
    const wrapper = mountActions(['run:approve']);
    const buttons = wrapper.findAll('button');

    expect(buttons[0]!.attributes('hidden')).toBeUndefined();
    expect(buttons[1]!.attributes('hidden')).toBeUndefined();
    expect(buttons[2]!.attributes('hidden')).toBe('');
  });
});
