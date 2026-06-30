import { defineStore } from 'pinia';
import { z } from 'zod';
import { appEnv } from '@/shared/config/env';
import { hasRequiredPermissions, type PermissionMode } from '@/shared/auth/permissions';

/**
 * Permission code in domain:action form.
 */
export type AppPermission = string;

/**
 * Authenticated user state shared across route guards and action controls.
 */
export interface AppUser {
  id: string;
  name: string;
  role: string;
  permissions: AppPermission[];
}

/**
 * Persisted auth session loaded from local storage or an auth provider.
 */
export interface AuthSession {
  accessToken: string | null;
  user: AppUser;
  expiresAt?: string;
}

interface AuthState {
  accessToken: string | null;
  currentUser: AppUser | null;
  hydrated: boolean;
}

const AppUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  permissions: z.array(z.string())
});

const AuthSessionSchema = z.object({
  accessToken: z.string().nullable(),
  user: AppUserSchema,
  expiresAt: z.string().optional()
});

const mockUser: AppUser = {
  id: 'local-demo-user',
  name: '本地模板账号',
  role: 'starter-admin',
  permissions: ['*']
};

function readStoredSession() {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(appEnv.authStorageKey);
  if (!raw) return null;

  try {
    const parsed = AuthSessionSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session: AuthSession | null) {
  if (typeof window === 'undefined') return;

  if (!session) {
    window.localStorage.removeItem(appEnv.authStorageKey);
    return;
  }

  window.localStorage.setItem(appEnv.authStorageKey, JSON.stringify(session));
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    currentUser: null,
    hydrated: false
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.currentUser),
    permissions: (state) => state.currentUser?.permissions ?? [],
    token: (state) => state.accessToken
  },
  actions: {
    hydrate() {
      if (this.hydrated) return;

      const storedSession = readStoredSession();
      if (storedSession) {
        this.accessToken = storedSession.accessToken;
        this.currentUser = storedSession.user;
      } else if (appEnv.enableMockAuth) {
        this.accessToken = null;
        this.currentUser = mockUser;
      }

      this.hydrated = true;
    },
    setSession(session: AuthSession) {
      this.accessToken = session.accessToken;
      this.currentUser = session.user;
      this.hydrated = true;
      writeStoredSession(session);
    },
    clearSession() {
      this.accessToken = null;
      this.currentUser = null;
      this.hydrated = true;
      writeStoredSession(null);
    },
    hasPermission(permissions: readonly string[], mode: PermissionMode = 'all') {
      return hasRequiredPermissions(this.permissions, permissions, mode);
    }
  }
});
