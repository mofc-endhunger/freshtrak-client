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
  // One worker per shard. The runner could handle more (ubuntu-latest has 4
  // vCPUs and these tests are I/O-bound), but the shared beta API — not the
  // runner — is the binding constraint: it effectively serializes requests, so
  // latency on api/agencies scales with total in-flight requests across ALL
  // shards, measured against the beta host as:
  //
  //   1 concurrent  →  2.3-3.4s      4 concurrent  →  8.9s
  //   2 concurrent  →  4.4s          6 concurrent  →  11.0s
  //   3 concurrent  →  5.4s         12 concurrent  →  ~22s+
  //
  // At the previous `4` this ran 3 shards x 4 workers = 12 in flight, pushing
  // responses past the 15s budget in search-results.spec.ts. The page has no
  // request timeout, so tests saw a permanently "Searching..." page rather than
  // an error — 20 identical failures. With 1 worker the 3 shards put 3 requests
  // in flight (~5.4s), leaving ~3x headroom. Raise this only alongside a
  // measurement showing the API keeps up, or after these specs stop depending
  // on live data.
  workers: process.env.CI ? 1 : undefined,
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
