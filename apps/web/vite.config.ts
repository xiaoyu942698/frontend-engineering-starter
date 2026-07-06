import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

const appRoot = fileURLToPath(new URL('.', import.meta.url));

function isTruthyEnvValue(value: unknown) {
  return ['1', 'true', 'yes', 'on'].includes(
    String(value ?? '')
      .trim()
      .toLowerCase()
  );
}

function assertMockAuthDisabledForBuild(command: string, mode: string) {
  if (command !== 'build') return;

  const env = loadEnv(mode, appRoot, 'VITE_');
  const mockAuthValue = process.env.VITE_ENABLE_MOCK_AUTH ?? env.VITE_ENABLE_MOCK_AUTH;
  if (isTruthyEnvValue(mockAuthValue)) {
    throw new Error('VITE_ENABLE_MOCK_AUTH must be disabled before building production assets.');
  }
}

export default defineConfig(({ command, mode }) => {
  assertMockAuthDisabledForBuild(command, mode);

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: '127.0.0.1',
      port: 5178,
      proxy: {
        '/api': 'http://127.0.0.1:8787'
      }
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['tests/setup.ts'],
      include: ['tests/**/*.spec.ts', 'src/**/*.test.ts'],
      exclude: ['e2e/**'],
      coverage: {
        provider: 'v8',
        all: true,
        include: [
          'src/shared/api/**/*.ts',
          'src/shared/auth/**/*.ts',
          'src/shared/config/**/*.ts',
          'src/shared/runtime/**/*.ts',
          'src/stores/**/*.ts',
          'src/features/studio/queries/**/*.ts'
        ],
        thresholds: {
          statements: 80,
          branches: 70,
          functions: 80,
          lines: 80
        }
      }
    }
  };
});
