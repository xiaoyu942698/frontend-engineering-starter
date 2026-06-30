import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
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
});
