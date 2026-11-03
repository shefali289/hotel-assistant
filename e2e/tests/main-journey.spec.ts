// Main journey end to end against the real API and web app: ask, wait, review three fixture hotels, select one (Q3; U1-U6).
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

// The brief's example input, typed exactly as a traveller would.
const EXAMPLE_MESSAGE =
  "Find a Wellington hotel for two nights, up to NZD 250 per night; breakfast preferred.";

// Fixture hotels h1 to h3 from openapi.yaml; prices may contain a no-break space after "NZD", which \s matches.
const HOTELS = [
  {
    name: "Harbour House",
    price: /NZD\s*220 per night/,
    breakfast: "Breakfast included",
    explanation: "Within budget; breakfast included.",
  },
  {
    name: "City Garden",
    price: /NZD\s*245 per night/,
    breakfast: "Breakfast included",
    explanation: "Near the meeting district.",
  },
  {
    name: "Quay Rooms",
    price: /NZD\s*195 per night/,
    breakfast: "Breakfast not included",
    explanation: "Lower price; breakfast costs extra.",
  },
];

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

test("Q3: the brief's example request shows progress, three fixture hotels and the selection summary", async ({
  page,
}, testInfo) => {
  // Arrange: no route is set, so the real web app calls the real API with its real 800 ms delay.
  await page.goto("/");
  await page.getByLabel("What are you looking for?").fill(EXAMPLE_MESSAGE);
  // U2: the scenario stays on its default, Success.
  await expect(page.getByLabel("Demo scenario (test control)")).toHaveValue("success");

  // Listeners are set before the click so the request and response cannot be missed.
  const requestPromise = page.waitForRequest((request) =>
    isRecommendationsPost(request.method(), request.url()),
  );
  const responsePromise = page.waitForResponse((response) =>
    isRecommendationsPost(response.request().method(), response.url()),
  );
  const findHotels = page.getByRole("button", { name: "Find hotels" });
  await findHotels.click();

  // U1: the body is exactly the message as typed and the chosen scenario.
  const request = await requestPromise;
  expect(request.postDataJSON()).toEqual({ message: EXAMPLE_MESSAGE, scenario: "success" });

  // U3: while the real 800 ms delay runs, progress shows and submit is disabled.
  await expect(page.getByRole("status")).toContainText("Finding hotels...");
  await expect(findHotels).toBeDisabled();

  const response = await responsePromise;
  expect(response.status()).toBe(200);

  // U4, U5: assistant message, fixture label and exactly three hotel options.
  await expect(page.getByText("Here are three Wellington hotels for your stay.")).toBeVisible();
  await expect(page.getByText("Demo data (fixture)")).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(3);
  for (const hotel of HOTELS) {
    await expect(page.getByRole("radio", { name: hotel.name, exact: true })).toBeVisible();
    const card = page.getByRole("listitem").filter({ hasText: hotel.name });
    await expect(card).toContainText(hotel.price);
    await expect(card).toContainText(hotel.breakfast);
    await expect(card).toContainText(hotel.explanation);
  }

  // U6: selecting Harbour House shows its summary and says no booking was made.
  // The label's overlay covers the card and takes the pointer, so the traveller clicks the card, not the small radio.
  await page.getByRole("listitem").filter({ hasText: "Harbour House" }).click();
  await expect(page.getByRole("radio", { name: "Harbour House", exact: true })).toBeChecked();
  const summary = page.getByRole("complementary", { name: "Your selection" });
  await expect(summary).toContainText("You selected Harbour House");
  await expect(summary).toContainText(/NZD\s*220 per night/);
  await expect(summary).toContainText("breakfast included");
  await expect(summary).toContainText("No booking has been made");

  await saveEvidence(page, "journey-selected", testInfo.project.name);
});
