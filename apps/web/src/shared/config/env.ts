import { z } from 'zod';

function readBoolean(value: unknown, fallback: boolean) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

const EnvSchema = z.object({
  apiBaseUrl: z.string(),
  authStorageKey: z.string().min(1),
  requestTimeoutMs: z.number().int().positive(),
  enableMockAuth: z.boolean()
});

const parsedEnv = EnvSchema.parse({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  authStorageKey: import.meta.env.VITE_AUTH_STORAGE_KEY ?? 'agent-flow.auth',
  requestTimeoutMs: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS ?? 10_000),
  enableMockAuth: readBoolean(import.meta.env.VITE_ENABLE_MOCK_AUTH, false)
});

if (import.meta.env.PROD && parsedEnv.enableMockAuth) {
  throw new Error('VITE_ENABLE_MOCK_AUTH must be disabled in production builds.');
}

/**
 * Validated browser runtime configuration consumed by API, auth, and runtime adapters.
 */
export const appEnv = parsedEnv;
