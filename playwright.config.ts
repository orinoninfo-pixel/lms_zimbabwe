import { defineConfig, devices } from "@playwright/test"
import dotenv from "dotenv"

dotenv.config()

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000"
// Reuse an already-running `npm run dev` locally; always start fresh in CI.
const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // these specs share DB rows (test users, one seeded course) — keep them sequential
  workers: 1,
  retries: isCI ? 1 : 0,
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Starts the app for you if it isn't already running on baseURL.
  // Requires `npm run seed:e2e` to have been run at least once against the
  // same database before these tests can log in / find the seeded course.
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
})
