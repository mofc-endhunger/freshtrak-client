import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
  'http://localhost:5000';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // 4 workers per shard. ubuntu-latest has 4 vCPUs and e2e tests are largely
  // I/O-bound (network, navigation waits), so 4 concurrent workers saturates
  // the runner without CPU contention.
  workers: process.env.CI ? 4 : undefined,
  // In CI emit a blob report so the merge job can combine shards into one
  // HTML report. Locally keep the interactive HTML report.
  reporter: process.env.CI ? [['blob'], ['list']] : [['html', { open: 'never' }], ['list']],

  expect: {
    timeout: 10_000,
  },

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 60_000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: process.env.CI ? 'npx vite preview' : 'npm start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
