import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { AuthSession, useAuthStore as useAuthStoreType } from './auth-store';

let useAuthStore: typeof useAuthStoreType;

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

async function loadAuthStore(mockAuth: 'true' | 'false' = 'true') {
  vi.unstubAllEnvs();
  vi.stubEnv('VITE_ENABLE_MOCK_AUTH', mockAuth);
  vi.resetModules();
  const authStoreModule = await import('./auth-store');
  useAuthStore = authStoreModule.useAuthStore;
  setActivePinia(createPinia());
  window.localStorage.clear();
}

beforeEach(async () => {
  await loadAuthStore();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
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

  it('does not hydrate mock auth when mock auth is disabled', async () => {
    await loadAuthStore('false');

    const authStore = useAuthStore();
    authStore.hydrate();

    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.permissions).toEqual([]);
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
