import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  timeout: 60_000,
  use: {},
  projects: [
    {
      name: "react-wizards",
      testDir: "./examples/react-wizards/__tests__",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:5173" },
    },
    {
      name: "react-wizards-i18n",
      testDir: "./examples/react-wizards-i18n/__tests__",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:5174" },
    },
  ],
  webServer: [
    {
      command: "npm run dev",
      cwd: "./examples/react-wizards",
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "npm run dev -- --port 5174",
      cwd: "./examples/react-wizards-i18n",
      port: 5174,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
