import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: [
    {
      command: 'pnpm --filter @agent-flow/mock-api dev',
      url: 'http://127.0.0.1:8787/api/runtime/snapshot',
      reuseExistingServer: true,
      timeout: 30_000
    },
    {
      command: 'pnpm --filter @agent-flow/web dev',
      url: 'http://127.0.0.1:5178',
      reuseExistingServer: true,
      timeout: 30_000
    }
  ],
  use: {
    baseURL: 'http://127.0.0.1:5178',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 5'], viewport: { width: 393, height: 851 } } }
  ]
});
