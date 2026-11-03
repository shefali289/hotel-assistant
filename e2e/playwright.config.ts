// Playwright config: real API and web app on localhost, Chromium at desktop and 375px widths (Q3, Q4).
import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

// The venv's python runs uvicorn, so no activation step is needed; its path differs by platform.
const venvPython =
  process.platform === "win32" ? ".venv\\Scripts\\python" : ".venv/bin/python";

export default defineConfig({
  testDir: "./tests",
  // One shared dev server and a real 800 ms fixture delay (DEC-5), so tests run one at a time.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    // The API's CORS list allows only localhost:3000 and 127.0.0.1:3000 (T1), so the default must stay on it.
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
    {
      // U9: the small-screen width from the requirements.
      name: "mobile-375",
      use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } },
    },
  ],
  webServer: [
    {
      // FIXTURE_DELAY_MS is left unset, so the default 800 ms applies and Q3 can see progress (DEC-5).
      command: `${venvPython} -m uvicorn app.main:app --port 8000`,
      cwd: path.join(__dirname, "..", "api"),
      // The API has no GET route and POST /recommendations answers GET with 405, so the schema URL is the health check.
      url: "http://localhost:8000/openapi.json",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "npm run dev",
      cwd: path.join(__dirname, "..", "web"),
      url: "http://localhost:3000",
      env: { NEXT_PUBLIC_API_BASE_URL: "http://localhost:8000" },
      reuseExistingServer: true,
      // The first Next.js dev compile is slow.
      timeout: 120_000,
    },
  ],
});
