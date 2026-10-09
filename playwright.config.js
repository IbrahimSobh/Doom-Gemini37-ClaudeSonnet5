// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  // On GitHub Actions, failures are also shown as annotations on the PR.
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 900 },
    // CI installs Playwright's own Chromium; locally, reuse the installed Google Chrome.
    channel: process.env.CI ? undefined : 'chrome',
  },
});
