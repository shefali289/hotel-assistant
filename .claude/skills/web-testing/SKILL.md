---
name: web-testing
description: Use when writing, running or reviewing web/ tests with Vitest and React Testing Library, or e2e/ tests with Playwright, including test setup, the fetch mock boundary and screenshot evidence.
---

# Web testing

## Vitest setup
`web/vitest.config.ts`: jsdom environment, setup file, React plugin, path alias.
```ts
// Vitest config for component and state tests (Q1).
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"] },
});
```
`web/vitest.setup.ts`:
```ts
// Registers jest-dom matchers and resets DOM and mocks between tests (Q1).
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
```
Add `"test": "vitest run"` to `package.json` scripts so `npm test` exits.

## RTL patterns
- Query with `screen` by role, then label, then text. Use test IDs only as a last resort.
- Use `const user = userEvent.setup()` and await every interaction.
- Use `findBy*` for anything that appears asynchronously.
- No snapshot tests. No implementation-detail queries (class names, state, internal functions).
- One behaviour per test. Names start with the requirement ID.

```tsx
it("U4: shows the assistant message after a response", async () => {
  // Arrange: the API returns the three-hotel success body.
  mockFetchSuccess();
  const user = userEvent.setup();
  render(<HomePage />);

  await user.type(screen.getByLabelText(/what are you looking for/i), "Wellington hotel");
  await user.click(screen.getByRole("button", { name: /find hotels/i }));

  expect(await screen.findByText(/three wellington hotels/i)).toBeInTheDocument();
});
```

## What jsdom cannot test
jsdom has no layout or CSS. Test tab order with `user.tab()`, but plan U9 (375px) and U10's visible focus as manual checks with a screenshot.

## Mock boundary: global fetch only
Never mock components, hooks or the API client. Keep these helpers in `web/test/mockFetch.ts`:
```ts
// Stubs global fetch, the only mock boundary in web tests (Q6).
import { vi } from "vitest";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const mockFetchSuccess = (body: unknown = SUCCESS_BODY) =>
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(200, body)));
export const mockFetchEmpty = () =>
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(200, EMPTY_BODY)));
export const mockFetch503 = () =>
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(503, { detail: "Try again." })));
export const mockFetchNetworkError = () =>
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

// Never settles until resolve() is called, so loading state can be asserted (U3).
export const mockFetchPending = () => {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((r) => (resolve = r));
  vi.stubGlobal("fetch", vi.fn().mockReturnValue(promise));
  return { resolve: () => resolve(json(200, SUCCESS_BODY)) };
};
```
Define `SUCCESS_BODY` and `EMPTY_BODY` in the same file, copied from the `openapi.yaml` examples. A `Response` body can be read only once, so re-stub with `mockResolvedValueOnce` for retry tests.

## Right-reason failures in red
Acceptable: an assertion fails, or an import fails for a module this task will create. Not acceptable: syntax errors, a broken config, or a mistyped selector.

## Playwright
Run against the real API and web app. Do not mock responses with `route.fulfill`.
- Base URL from env: `baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"`.
- Use `webServer` entries for uvicorn and `npm run dev`, with `reuseExistingServer: true`.
- Write exactly two specs: one main journey (Q3) and one 503→retry (Q4).
- Use the brief's example as the message in the main journey: "Find a Wellington hotel for two nights, up to NZD 250 per night; breakfast preferred."
- Save screenshots to `docs/evidence/` at 375px and desktop:
```ts
await page.setViewportSize({ width: 375, height: 812 });
await page.screenshot({ path: "../docs/evidence/journey-375.png", fullPage: true });
```

### Making 503→retry recover against the real API
U8 says Retry re-sends the last request, so a request with `scenario: "error"` fails every time. To show recovery, choose **success** in the UI and rewrite only the first request's body in transit. The real API returns a real 503, then a real 200 for the unchanged retry:
```ts
// Q4: only the first request is rewritten; both responses come from the real API.
let first = true;
await page.route("**/recommendations", async (route) => {
  const body = route.request().postDataJSON();
  await route.continue(first ? { postData: JSON.stringify({ ...body, scenario: "error" }) } : {});
  first = false;
});
```
Assert that the UI sent the same body both times by reading `route.request().postDataJSON()` before any rewrite.

## Commands
```
cd web && npm test              # add -- --watch while working
cd web && npm run lint
cd web && npx tsc --noEmit
cd e2e && npx playwright install chromium
cd e2e && npx playwright test
```
