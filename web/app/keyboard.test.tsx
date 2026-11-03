// Keyboard-only tests: tab order, radio keys and Retry from the keyboard (U10; Q1). Visible focus is a manual check.
import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import HomePage from "@/app/page";
import {
  ERROR_BODY,
  jsonResponse,
  mockFetch503,
  mockFetchPending,
  mockFetchSuccess,
  neverSettles,
} from "@/test/mockFetch";

const messageField = () => screen.getByLabelText(/what are you looking for/i);
const scenarioSelect = () => screen.getByLabelText(/demo scenario/i);
const submitButton = () => screen.getByRole("button", { name: /find hotels/i });
const resultsRegion = () => screen.findByRole("region", { name: /recommended hotels/i });
// U8: the failure section is found by its region name, not role="alert" (U11 owns that role).
const failureRegion = () => screen.findByRole("region", { name: /could not get recommendations/i });

/** Renders the page, types a message and submits it with the submit button. */
const renderAndSubmit = async (): Promise<UserEvent> => {
  const user = userEvent.setup();
  render(<HomePage />);
  await user.type(messageField(), "Wellington hotel");
  await user.click(submitButton());
  return user;
};

describe("U10 keyboard-only operation", () => {
  it("U10: Tab moves through the message field, the scenario select and Find hotels in order", async () => {
    // Arrange: fetch is stubbed defensively; nothing is submitted.
    mockFetchSuccess();
    const user = userEvent.setup();
    render(<HomePage />);

    await user.tab();
    expect(messageField()).toHaveFocus();
    await user.tab();
    expect(scenarioSelect()).toHaveFocus();
    await user.tab();
    expect(submitButton()).toHaveFocus();
  });

  it("U10: the disabled Find hotels button is skipped by Tab while a request is pending", async () => {
    // Arrange: the request never settles, so submit stays disabled.
    mockFetchPending();
    const user = await renderAndSubmit();
    await waitFor(() => expect(submitButton()).toBeDisabled());
    // Arrange: focus starts on the scenario select, the stop just before the submit button.
    await user.click(scenarioSelect());

    await user.tab();

    expect(submitButton()).not.toHaveFocus();
    expect(scenarioSelect()).not.toHaveFocus();
  });

  it("U10: Tab from the focused results section reaches the hotel radio group", async () => {
    // Arrange: the API returns the three fixture hotels and focus has moved to the results section (U5).
    mockFetchSuccess();
    const user = await renderAndSubmit();
    const region = await resultsRegion();
    await waitFor(() => expect(region).toHaveFocus());

    await user.tab();

    // None is checked, so the group's tab stop is the first radio.
    expect(screen.getByRole("radio", { name: "Harbour House" })).toHaveFocus();
  });

  it("U10: Space selects the focused hotel and arrow keys move the selection, with the summary following", async () => {
    // Arrange: results are shown and Tab has put focus on the first hotel radio.
    mockFetchSuccess();
    const user = await renderAndSubmit();
    const region = await resultsRegion();
    await waitFor(() => expect(region).toHaveFocus());
    await user.tab();

    await user.keyboard(" ");
    expect(screen.getByRole("radio", { name: "Harbour House" })).toBeChecked();
    expect(screen.getByText(/you selected harbour house/i)).toBeInTheDocument();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "City Garden" })).toBeChecked();
    expect(screen.getByText(/you selected city garden/i)).toBeInTheDocument();

    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("radio", { name: "Harbour House" })).toBeChecked();
    expect(screen.getByText(/you selected harbour house/i)).toBeInTheDocument();
  });

  it("U10: Tab from the focused failure section reaches Retry", async () => {
    // Arrange: the API returns the 503 example and focus has moved to the failure section (U8).
    mockFetch503();
    const user = await renderAndSubmit();
    const failure = await failureRegion();
    await waitFor(() => expect(failure).toHaveFocus());

    await user.tab();

    expect(screen.getByRole("button", { name: /retry/i })).toHaveFocus();
  });

  it.each([
    // Native button activation keys.
    ["Enter", "{Enter}"],
    ["Space", " "],
  ])("U10: Retry activates from the keyboard [%s]", async (_label, key) => {
    // Arrange: the first request fails with a 503, the retry stays pending.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse(503, ERROR_BODY)).mockReturnValueOnce(neverSettles()),
    );
    const user = await renderAndSubmit();
    const failure = await failureRegion();
    await waitFor(() => expect(failure).toHaveFocus());
    // Arrange: Tab moves focus from the failure section to Retry.
    await user.tab();

    await user.keyboard(key);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });

  it("U10: the journey works without a mouse: type, Enter to submit, Tab to the hotels, arrow to select", async () => {
    // Arrange: the API returns the three fixture hotels; only keyboard input is used from here on.
    mockFetchSuccess();
    const user = userEvent.setup();
    render(<HomePage />);

    await user.tab();
    await user.keyboard("Wellington hotel{Enter}");
    const region = await resultsRegion();
    await waitFor(() => expect(region).toHaveFocus());
    await user.tab();
    await user.keyboard(" ");
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("radio", { name: "City Garden" })).toBeChecked();
    expect(screen.getByText(/you selected city garden/i)).toBeInTheDocument();
  });
});
