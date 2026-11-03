// Failure and recovery end to end: a real 503 shows the failure card, and Retry re-sends the same request to a real 200 (Q4; U8).
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

// The brief's example input, typed exactly as a traveller would.
const EXAMPLE_MESSAGE =
  "Find a Wellington hotel for two nights, up to NZD 250 per night; breakfast preferred.";

// DEC-4: the API's user-safe 503 detail, shown verbatim by the UI.
const ERROR_DETAIL = "Recommendations are temporarily unavailable. Please try again.";

/**
 * Saves a full-page screenshot to docs/evidence, only when E2E_SCREENSHOTS=1 (owner, T4 question 5),
 * so routine runs leave the tracked PNGs alone.
 * @param page - The page to capture.
 * @param state - The journey state, used in the file name.
 * @param project - The Playwright project name (desktop or mobile-375).
 */
async function saveEvidence(page: Page, state: string, project: string): Promise<void> {
  if (process.env.E2E_SCREENSHOTS !== "1") return;
  await page.screenshot({
    path: path.join(__dirname, "..", "..", "docs", "evidence", `T4-e2e-${state}-${project}.png`),
    fullPage: true,
  });
}

/**
 * Matches the real POST /recommendations call; the CORS preflight (OPTIONS) is skipped.
 * @param method - The request method.
 * @param url - The request URL.
 * @returns True for the recommendations POST.
 */
function isRecommendationsPost(method: string, url: string): boolean {
  return method === "POST" && url.endsWith("/recommendations");
}

test("Q4: a real 503 shows the failure state and Retry re-sends the same request, then recovers with three hotels", async ({
  page,
}, testInfo) => {
  // Arrange: the UI stays on Success; Retry re-sends the last request (U8), so a request sent as "error"
  // would fail every time. Only the first request's scenario is rewritten in transit, and the real API
  // answers both requests: no response is faked.
  const sentBodies: unknown[] = [];
  await page.route("**/recommendations", async (route) => {
    const request = route.request();
    if (!isRecommendationsPost(request.method(), request.url())) {
      await route.continue();
      return;
    }
    // Recorded before any rewrite, so the bodies are exactly what the UI sent.
    const body = request.postDataJSON() as Record<string, unknown>;
    sentBodies.push(body);
    if (sentBodies.length === 1) {
      await route.continue({ postData: JSON.stringify({ ...body, scenario: "error" }) });
    } else {
      await route.continue();
    }
  });

  await page.goto("/");
  await page.getByLabel("What are you looking for?").fill(EXAMPLE_MESSAGE);
  await expect(page.getByLabel("Demo scenario (test control)")).toHaveValue("success");

  // Listener set before the click so the 503 cannot be missed.
  const failedPromise = page.waitForResponse((response) =>
    isRecommendationsPost(response.request().method(), response.url()),
  );
  await page.getByRole("button", { name: "Find hotels" }).click();
  const failed = await failedPromise;
  expect(failed.status()).toBe(503);

  // U8: the failure card shows the heading, the API's detail and Retry, with no hotels.
  const failureHeading = page.getByRole("heading", { name: "We could not get recommendations" });
  await expect(failureHeading).toBeVisible();
  await expect(page.getByText(ERROR_DETAIL)).toBeVisible();
  const retry = page.getByRole("button", { name: "Retry" });
  await expect(retry).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(0);

  await saveEvidence(page, "failure", testInfo.project.name);

  // Listener set before Retry so the second response cannot be missed.
  const recoveredPromise = page.waitForResponse((response) =>
    isRecommendationsPost(response.request().method(), response.url()),
  );
  await retry.click();
  const recovered = await recoveredPromise;
  expect(recovered.status()).toBe(200);

  // U8: the failure card is gone and the three hotels show.
  await expect(failureHeading).toBeHidden();
  await expect(page.getByRole("radio")).toHaveCount(3);
  for (const name of ["Harbour House", "City Garden", "Quay Rooms"]) {
    await expect(page.getByRole("radio", { name, exact: true })).toBeVisible();
  }

  // U8: exactly one more request was sent, and the UI re-sent the first body unchanged.
  expect(sentBodies).toHaveLength(2);
  expect(sentBodies[0]).toEqual({ message: EXAMPLE_MESSAGE, scenario: "success" });
  expect(sentBodies[1]).toEqual(sentBodies[0]);

  await saveEvidence(page, "retry-recovered", testInfo.project.name);
});
