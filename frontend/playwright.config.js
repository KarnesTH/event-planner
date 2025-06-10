import { defineConfig, devices } from '@playwright/test'
import { env } from 'node:process'; 

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !env.CI,
  retries: env.CI ? 2 : 0,
  workers: env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 15000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !env.CI,
    timeout: 120000,
  },
}) 