import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs only against a production build (REQ-TST-04): the default webServer
 * command builds and starts Next. Never point this at `next dev`.
 *
 *   E2E_BASE_URL            override the base URL (default http://127.0.0.1:3100)
 *   E2E_WEB_SERVER_COMMAND  override the server command
 *   E2E_NO_WEBSERVER=1      do not start a server (test an already running one)
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;
const shouldStartWebServer = process.env.E2E_NO_WEBSERVER !== "1";
const webServerCommand =
  process.env.E2E_WEB_SERVER_COMMAND ??
  `npm run build && npx next start -p ${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  outputDir: "test-results",
  use: {
    baseURL,
    headless: true,
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile-webkit",
      use: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 } },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: shouldStartWebServer
    ? {
        command: webServerCommand,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
        stdout: "ignore",
        stderr: "pipe",
        env: { PUBLIC_ENVIRONMENT_LABEL: "development" },
      }
    : undefined,
});
