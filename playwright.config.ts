import { defineConfig, devices } from '@playwright/test';
import { config } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 2,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright', {
      resultsDir: 'allure-results',
      detail: true,
      suiteTitle: false
    }]
  ],
  use: {
    baseURL: config.webBaseURL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on',
    screenshot: 'on',
    video: 'on'
  },
  projects: [
    {
      name: 'api',
      testMatch: '**/tests/api/**/*.spec.{ts,js,tsx,jsx}',
    },
    {
      name: 'chromium',
      testIgnore: /tests[\\/]api[\\/].*\\.spec\\.ts$/,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      testIgnore: /tests[\\/]api[\\/].*\\.spec\\.ts$/,
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      testIgnore: /tests[\\/]api[\\/].*\\.spec\\.ts$/,
      use: { ...devices['Desktop Safari'] }
    }
  ]
});
