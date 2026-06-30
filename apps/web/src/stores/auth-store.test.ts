import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore, type AuthSession } from './auth-store';

const session: AuthSession = {
  accessToken: 'token-1',
  user: {
    id: 'user-1',
    name: '平台管理员',
    role: 'admin',
    permissions: ['workflow:read', 'run:approve']
  },
  expiresAt: '2026-06-30T00:00:00.000Z'
};

beforeEach(() => {
  setActivePinia(createPinia());
  window.localStorage.clear();
});

describe('auth store', () => {
  it('hydrates mock auth when no stored session exists', () => {
    const authStore = useAuthStore();

    authStore.hydrate();
    authStore.hydrate();

    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.permissions).toContain('*');
    expect(authStore.token).toBeNull();
    expect(authStore.hasPermission(['workflow:admin'])).toBe(true);
  });

  it('persists and clears a stored session', () => {
    const authStore = useAuthStore();

    authStore.setSession(session);
    expect(authStore.token).toBe('token-1');
    expect(authStore.hasPermission(['run:approve'])).toBe(true);
    expect(authStore.hasPermission(['workflow:write'])).toBe(false);

    const rehydratedStore = useAuthStore();
    rehydratedStore.$reset();
    rehydratedStore.hydrate();
    expect(rehydratedStore.currentUser?.id).toBe('user-1');

    rehydratedStore.clearSession();
    expect(rehydratedStore.isAuthenticated).toBe(false);
    expect(window.localStorage.getItem('agent-flow.auth')).toBeNull();
  });

  it('ignores invalid stored sessions', () => {
    window.localStorage.setItem('agent-flow.auth', '{bad-json');

    const authStore = useAuthStore();
    authStore.hydrate();

    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.permissions).toEqual(['*']);
  });
});
