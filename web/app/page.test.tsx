// Component tests for the home page journey: ask, wait, review hotels, select one (U1-U6, U11; Q1).
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import HomePage from "@/app/page";
import {
  jsonResponse,
  mockFetchEmpty,
  mockFetchPending,
  mockFetchSuccess,
  SUCCESS_BODY,
} from "@/test/mockFetch";

const messageField = () => screen.getByLabelText(/what are you looking for/i);
const scenarioSelect = () => screen.getByLabelText(/demo scenario/i);
const submitButton = () => screen.getByRole("button", { name: /find hotels/i });

/** Returns the parsed JSON body of the first stubbed fetch call. */
const firstRequestBody = () => {
  const init = vi.mocked(fetch).mock.calls[0][1];
  return JSON.parse(String(init?.body));
};

/**
 * Returns the always-mounted live status region (U3 allows role="status" or aria-live="polite").
 * Falls back to the aria-live attribute because a polite live region has no ARIA role.
 */
const statusRegion = (): HTMLElement => {
  const region =
    screen.queryByRole("status") ?? document.querySelector<HTMLElement>('[aria-live="polite"]');
  if (!region) throw new Error("No role=status or aria-live=polite region found");
  return region;
};

/**
 * Returns the card for a hotel: the nearest ancestor of its radio that also holds its explanation.
 * Avoids depending on the card's element type or class names.
 */
const hotelCard = (name: string, explanation: string): HTMLElement => {
  let element = screen.getByRole("radio", { name }).parentElement;
  while (element && !element.textContent?.includes(explanation)) {
    element = element.parentElement;
  }
  if (!element) throw new Error(`No card containing "${explanation}" for ${name}`);
  return element;
};

/** Renders the page, types a message and submits it with the submit button. */
const renderAndSubmit = async (message = "Wellington hotel"): Promise<UserEvent> => {
  const user = userEvent.setup();
  render(<HomePage />);
  await user.type(messageField(), message);
  await user.click(submitButton());
  return user;
};

describe("U1 message input and submit", () => {
  it("U1: renders a labelled message field and a submit button", () => {
    // Arrange: fetch is stubbed defensively; nothing is submitted.
    mockFetchSuccess();
    render(<HomePage />);

    expect(messageField()).toHaveAttribute("type", "text");
    expect(submitButton()).toBeInTheDocument();
  });

  it("U1: pressing Enter in the message input submits the form (Option B)", async () => {
    // Arrange: the API returns the success body.
    mockFetchSuccess();
    const user = userEvent.setup();
    render(<HomePage />);

    await user.type(messageField(), "Wellington hotel{Enter}");

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  });

  it("U1: submit sends one POST to /recommendations with a JSON body of message and scenario", async () => {
    // Arrange: the API returns the success body; the message has surrounding spaces to prove it is sent untrimmed.
    mockFetchSuccess();
    await renderAndSubmit("  Wellington hotel  ");

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toMatch(/\/recommendations$/);
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
    expect(firstRequestBody()).toEqual({ message: "  Wellington hotel  ", scenario: "success" });
  });
});

describe("U2 scenario demo control", () => {
  it("U2: renders a labelled scenario select with success, empty and error options", () => {
    // Arrange: fetch is stubbed defensively; nothing is submitted.
    mockFetchSuccess();
    render(<HomePage />);

    const select = scenarioSelect();
    expect(select).toBe(screen.getByRole("combobox", { name: /demo scenario/i }));
    const options = within(select).getAllByRole<HTMLOptionElement>("option");
    expect(options.map((option) => option.value)).toEqual(["success", "empty", "error"]);
    expect(within(select).getByRole("option", { name: /^success$/i })).toHaveValue("success");
    expect(within(select).getByRole("option", { name: /empty results/i })).toHaveValue("empty");
    expect(within(select).getByRole("option", { name: /service error/i })).toHaveValue("error");
  });

  it("U2: success is selected by default", () => {
    // Arrange: fetch is stubbed defensively; the page is freshly rendered.
    mockFetchSuccess();
    render(<HomePage />);

    expect(scenarioSelect()).toHaveValue("success");
  });

  it.each([
    // empty: the API's empty body; error: a pending fetch so no 503 handling (T3) is exercised.
    ["empty", mockFetchEmpty],
    ["error", mockFetchPending],
  ] as const)("U2: sends the chosen scenario in the request body [%s]", async (scenario, stubFetch) => {
    // Arrange: fetch is stubbed for the scenario and the traveller picks it in the select.
    stubFetch();
    const user = userEvent.setup();
    render(<HomePage />);
    await user.selectOptions(scenarioSelect(), scenario);

    await user.type(messageField(), "Wellington hotel");
    await user.click(submitButton());

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(firstRequestBody().scenario).toBe(scenario);
  });
});

describe("U3 progress while waiting", () => {
  it("U3: status region is mounted and empty before any submit", () => {
    // Arrange: fetch is stubbed defensively; nothing is submitted.
    mockFetchSuccess();
    render(<HomePage />);

    expect(statusRegion()).toHaveTextContent(/^\s*$/);
  });

  it("U3: while the request is pending, submit is disabled and the status region shows progress", async () => {
    // Arrange: the request never settles, so the loading state stays visible.
    mockFetchPending();
    await renderAndSubmit();

    await waitFor(() => expect(submitButton()).toBeDisabled());
    expect(statusRegion()).toHaveTextContent(/finding hotels/i);
  });

  it("U3: a second click while pending sends no second request", async () => {
    // Arrange: the first request never settles.
    mockFetchPending();
    const user = await renderAndSubmit();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    await user.click(submitButton());

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("U3: after the response, submit is enabled again and the progress text is gone", async () => {
    // Arrange: the request stays pending until resolve() is called.
    const pending = mockFetchPending();
    await renderAndSubmit();
    await waitFor(() => expect(submitButton()).toBeDisabled());

    pending.resolve();

    await waitFor(() => expect(submitButton()).toBeEnabled());
    expect(statusRegion()).not.toHaveTextContent(/finding hotels/i);
  });
});

describe("U4 assistant message", () => {
  it("U4: shows the assistant message from the response", async () => {
    // Arrange: the API returns the success body.
    mockFetchSuccess();
    await renderAndSubmit();

    expect(
      await screen.findByText(/here are three wellington hotels for your stay\./i),
    ).toBeInTheDocument();
  });

  it("U4: shows whatever message the response carries", async () => {
    // Arrange: the response carries a custom message, proving the text is not hard-coded.
    mockFetchSuccess({ ...SUCCESS_BODY, message: "Two quiet options near the waterfront." });
    await renderAndSubmit();

    expect(await screen.findByText(/two quiet options near the waterfront\./i)).toBeInTheDocument();
  });
});

describe("U5 hotel cards", () => {
  it("U5: renders three hotel cards in response order", async () => {
    // Arrange: the API returns the three fixture hotels.
    mockFetchSuccess();
    await renderAndSubmit();

    const radios = await screen.findAllByRole("radio");
    expect(radios).toHaveLength(3);
    expect(radios[0]).toHaveAccessibleName("Harbour House");
    expect(radios[1]).toHaveAccessibleName("City Garden");
    expect(radios[2]).toHaveAccessibleName("Quay Rooms");
  });

  it.each([
    // Expected price and breakfast copy per fixture hotel (section 8).
    ["Harbour House", /NZD\s*220 per night/i, /^breakfast included$/i, "Within budget; breakfast included."],
    ["City Garden", /NZD\s*245 per night/i, /^breakfast included$/i, "Near the meeting district."],
    ["Quay Rooms", /NZD\s*195 per night/i, /^breakfast not included$/i, "Lower price; breakfast costs extra."],
  ])(
    "U5: each card shows name, nightly price with currency code, breakfast text and explanation [%s]",
    async (name, price, breakfast, explanation) => {
      // Arrange: the API returns the three fixture hotels.
      mockFetchSuccess();
      await renderAndSubmit();
      await screen.findByRole("radio", { name });

      const card = within(hotelCard(name, explanation));
      expect(card.getByText(name)).toBeInTheDocument();
      expect(card.getByText(price)).toBeInTheDocument();
      expect(card.getByText(breakfast)).toBeInTheDocument();
      expect(card.getByText(explanation)).toBeInTheDocument();
    },
  );

  it("U5: shows the fixture label on the results", async () => {
    // Arrange: the API returns a body with source "fixture".
    mockFetchSuccess();
    await renderAndSubmit();

    expect(await screen.findByText(/demo data \(fixture\)/i)).toBeInTheDocument();
  });

  it("U5: focus moves to the Recommended hotels section when results arrive", async () => {
    // Arrange: the API returns the success body.
    mockFetchSuccess();
    await renderAndSubmit();

    // The results <section> is labelled by its heading (aria-labelledby), so it has role region.
    const region = await screen.findByRole("region", { name: /recommended hotels/i });
    await waitFor(() => expect(region).toHaveFocus());
  });
});

describe("U6 select one hotel", () => {
  it("U6: hotels are a radio group with none selected and no summary", async () => {
    // Arrange: the API returns the three fixture hotels.
    mockFetchSuccess();
    await renderAndSubmit();

    const group = await screen.findByRole("group", { name: /choose a hotel/i });
    const radios = within(group).getAllByRole("radio");
    expect(radios).toHaveLength(3);
    radios.forEach((radio) => expect(radio).not.toBeChecked());
    expect(screen.queryByRole("heading", { name: /your selection/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/you selected/i)).not.toBeInTheDocument();
  });

  it("U6: selecting a hotel shows a summary with its name, price and breakfast", async () => {
    // Arrange: results are shown.
    mockFetchSuccess();
    const user = await renderAndSubmit();
    const radio = await screen.findByRole("radio", { name: "Harbour House" });

    await user.click(radio);

    expect(radio).toBeChecked();
    expect(screen.getByRole("heading", { name: /your selection/i })).toBeInTheDocument();
    expect(
      screen.getByText(/you selected harbour house: NZD\s*220 per night, breakfast included\./i),
    ).toBeInTheDocument();
  });

  it("U6: selecting another hotel keeps exactly one selected and updates the summary", async () => {
    // Arrange: results are shown and Harbour House is already selected.
    mockFetchSuccess();
    const user = await renderAndSubmit();
    const first = await screen.findByRole("radio", { name: "Harbour House" });
    await user.click(first);
    const second = screen.getByRole("radio", { name: "Quay Rooms" });

    await user.click(second);

    expect(second).toBeChecked();
    expect(first).not.toBeChecked();
    expect(
      screen.getByText(/you selected quay rooms: NZD\s*195 per night, breakfast not included\./i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/you selected harbour house/i)).not.toBeInTheDocument();
  });

  it("U6: a new submit clears the previous results, selection and summary", async () => {
    // Arrange: the first request returns the success body; the second never settles, so the cleared state can be seen.
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(200, SUCCESS_BODY))
        .mockReturnValueOnce(new Promise<Response>(() => {})),
    );
    const user = await renderAndSubmit();
    // Arrange: a hotel is selected so a summary is showing.
    await user.click(await screen.findByRole("radio", { name: "Harbour House" }));
    expect(screen.getByText(/you selected harbour house/i)).toBeInTheDocument();

    await user.click(submitButton());

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryAllByRole("radio")).toHaveLength(0));
    expect(screen.queryByText(/you selected/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/here are three wellington hotels/i)).not.toBeInTheDocument();
  });
});

describe("U11 empty-message guard", () => {
  it("U11: an empty submit sends no request and shows an accessible validation message", async () => {
    // Arrange: fetch is stubbed so any request would be recorded.
    mockFetchSuccess();
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(submitButton());

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/enter a message describing the hotel you need\./i);
    expect(fetch).not.toHaveBeenCalled();
    const field = messageField();
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field.getAttribute("aria-describedby")?.split(/\s+/)).toContain(alert.id);
    expect(field).toHaveFocus();
  });

  it.each([
    // Whitespace-only inputs the guard blocks (trim() is empty).
    ["spaces", "   "],
    ["tabs", "\t\t"],
  ])("U11: a whitespace-only submit sends no request [%s]", async (_label, whitespace) => {
    // Arrange: fetch is stubbed so any request would be recorded; paste puts the raw characters in the field.
    mockFetchSuccess();
    const user = userEvent.setup();
    render(<HomePage />);
    await user.click(messageField());
    await user.paste(whitespace);

    await user.click(submitButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(/enter a message describing/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("U11: the validation message clears and the request is sent after a valid message", async () => {
    // Arrange: an empty submit has already shown the validation message.
    mockFetchSuccess();
    const user = userEvent.setup();
    render(<HomePage />);
    await user.click(submitButton());
    await screen.findByRole("alert");

    await user.type(messageField(), "Wellington hotel");
    await user.click(submitButton());

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(messageField()).not.toHaveAttribute("aria-invalid", "true");
  });

  it("U11: the message field has maxLength 1000", () => {
    // Arrange: fetch is stubbed defensively; nothing is submitted.
    mockFetchSuccess();
    render(<HomePage />);

    expect(messageField()).toHaveAttribute("maxLength", "1000");
  });

  it("U11: pasting 1001 characters keeps 1000 and sends a 1000-character message", async () => {
    // Arrange: the API returns the success body; 1001 characters are pasted into the field.
    mockFetchSuccess();
    const user = userEvent.setup();
    render(<HomePage />);
    await user.click(messageField());
    await user.paste("a".repeat(1001));

    expect(messageField()).toHaveValue("a".repeat(1000));
    await user.click(submitButton());

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(firstRequestBody().message).toHaveLength(1000);
  });
});
