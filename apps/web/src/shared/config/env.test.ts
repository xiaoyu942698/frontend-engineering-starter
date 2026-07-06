import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadAppEnv() {
  vi.resetModules();
  return import('./env');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('app env', () => {
  it('defaults mock auth off when the flag is omitted', async () => {
    const { appEnv } = await loadAppEnv();

    expect(appEnv.enableMockAuth).toBe(false);
  });

  it('rejects mock auth in production builds', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_ENABLE_MOCK_AUTH', 'true');

    await expect(loadAppEnv()).rejects.toThrow('VITE_ENABLE_MOCK_AUTH must be disabled');
  });
});
