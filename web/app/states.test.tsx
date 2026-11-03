// Component tests for the empty state (U7) and the recoverable failure state with Retry (U8); Option A copy (Q1).
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import HomePage from "@/app/page";
import {
  EMPTY_BODY,
  ERROR_BODY,
  jsonResponse,
  mockFetch503,
  mockFetchEmpty,
  mockFetchNetworkError,
  networkError,
  neverSettles,
  SUCCESS_BODY,
} from "@/test/mockFetch";

const messageField = () => screen.getByLabelText(/what are you looking for/i);
const scenarioSelect = () => screen.getByLabelText(/demo scenario/i);
const submitButton = () => screen.getByRole("button", { name: /find hotels/i });
const statusRegion = () => screen.getByRole("status");
const resultsRegion = () => screen.findByRole("region", { name: /recommended hotels/i });
// U8: the failure section is found by its region name, not role="alert" (U11 owns that role).
const failureRegion = () => screen.findByRole("region", { name: /could not get recommendations/i });
const queryFailureRegion = () =>
  screen.queryByRole("region", { name: /could not get recommendations/i });
const retryButton = () => screen.getByRole("button", { name: /retry/i });

// Section 8 copy (Option A), matched case-insensitively.
const EMPTY_GUIDANCE =
  /try changing your request, for example a higher nightly budget or a different area, then select find hotels again\./i;
const FIXED_FAILURE_COPY = /the hotel service is not available right now\. please try again\./i;
const NETWORK_FAILURE_COPY =
  /we could not reach the hotel service\. check your connection, then try again\./i;

/** Returns the parsed JSON body of the stubbed fetch call at `index`. */
const requestBody = (index: number) =>
  JSON.parse(String(vi.mocked(fetch).mock.calls[index][1]?.body));

/** Stubs fetch with one result per call, in order; a `Response` body can be read only once. */
const stubFetchSequence = (...results: Array<Response | Error | Promise<Response>>) => {
  const fetchMock = vi.fn();
  for (const result of results) {
    if (result instanceof Error) fetchMock.mockRejectedValueOnce(result);
    else if (result instanceof Response) fetchMock.mockResolvedValueOnce(result);
    else fetchMock.mockReturnValueOnce(result);
  }
  vi.stubGlobal("fetch", fetchMock);
};

/** Renders the page, optionally picks a scenario, types a message and submits it with the submit button. */
const renderAndSubmit = async (
  message = "Wellington hotel",
  scenario?: "success" | "empty" | "error",
): Promise<UserEvent> => {
  const user = userEvent.setup();
  render(<HomePage />);
  if (scenario) await user.selectOptions(scenarioSelect(), scenario);
  await user.type(messageField(), message);
  await user.click(submitButton());
  return user;
};

describe("U7 empty-result state", () => {
  it("U7: an empty response shows the assistant message and the empty-state copy, with no hotel radios and no summary", async () => {
    // Arrange: the API returns the openapi.yaml empty example (DEC-2).
    mockFetchEmpty();
    await renderAndSubmit("Wellington hotel", "empty");

    expect(await screen.findByText(/no hotels matched your request\./i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /no hotels to show/i })).toBeInTheDocument();
    expect(screen.getByText(EMPTY_GUIDANCE)).toBeInTheDocument();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.queryByRole("group", { name: /choose a hotel/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /your selection/i })).not.toBeInTheDocument();
  });

  it("U7: the empty state keeps the fixture label", async () => {
    // Arrange: the API returns the empty body, which has source "fixture".
    mockFetchEmpty();
    await renderAndSubmit("Wellington hotel", "empty");

    // Wait for the empty-state panel, then check the badge sits in the same region.
    await screen.findByRole("heading", { name: /no hotels to show/i });
    expect(within(await resultsRegion()).getByText(/demo data \(fixture\)/i)).toBeInTheDocument();
  });

  it("U7: focus moves to the results section when an empty response arrives", async () => {
    // Arrange: the API returns the empty body.
    mockFetchEmpty();
    await renderAndSubmit("Wellington hotel", "empty");

    // Wait for the empty-state panel, so the focus check is about the empty state.
    await screen.findByRole("heading", { name: /no hotels to show/i });
    const region = await resultsRegion();
    await waitFor(() => expect(region).toHaveFocus());
  });

  it("U7: a new submit from the empty state clears it and shows the new results", async () => {
    // Arrange: the first request returns the empty body, the second the success body.
    stubFetchSequence(jsonResponse(200, EMPTY_BODY), jsonResponse(200, SUCCESS_BODY));
    const user = await renderAndSubmit("Wellington hotel", "empty");
    await screen.findByText(EMPTY_GUIDANCE);
    expect(submitButton()).toBeEnabled();
    expect(messageField()).toHaveValue("Wellington hotel");

    // Arrange: the traveller switches to Success before resubmitting.
    await user.selectOptions(scenarioSelect(), "success");
    await user.click(submitButton());

    expect(await screen.findAllByRole("radio")).toHaveLength(3);
    expect(screen.queryByText(EMPTY_GUIDANCE)).not.toBeInTheDocument();
    expect(screen.queryByText(/no hotels matched your request/i)).not.toBeInTheDocument();
  });
});

describe("U8 recoverable failure", () => {
  it.each([
    // 503: the API's detail is shown; network error: fixed copy, as there is no body (section 8).
    ["503", () => mockFetch503(), ERROR_BODY.detail],
    ["network error", () => mockFetchNetworkError(), NETWORK_FAILURE_COPY],
  ] as const)(
    "U8: a failure shows the failure message and a Retry button [%s]",
    async (_label, stubFetch, bodyCopy) => {
      // Arrange: fetch fails in the way named by the case.
      stubFetch();
      await renderAndSubmit();

      const failure = within(await failureRegion());
      expect(failure.getByRole("heading", { name: /we could not get recommendations/i })).toBeInTheDocument();
      expect(failure.getByText(bodyCopy)).toBeInTheDocument();
      expect(failure.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    },
  );

  it("U8: a 503 shows the API's detail message", async () => {
    // Arrange: a 503 whose detail differs from the default, proving the text comes from the response.
    mockFetch503({ detail: "The hotel finder is busy. Please try again shortly." });
    await renderAndSubmit();

    const failure = within(await failureRegion());
    expect(
      failure.getByText(/the hotel finder is busy\. please try again shortly\./i),
    ).toBeInTheDocument();
  });

  it("U8: a 503 without a usable detail shows the fixed failure copy", async () => {
    // Arrange: a 503 whose body has no string detail, so the page must fall back to the fixed copy.
    mockFetch503({});
    await renderAndSubmit();

    const failure = within(await failureRegion());
    expect(failure.getByText(FIXED_FAILURE_COPY)).toBeInTheDocument();
    expect(failure.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("U8: after a failure the loading state ends and no hotels, fixture label or summary are shown", async () => {
    // Arrange: the API returns the 503 example.
    mockFetch503();
    await renderAndSubmit();

    await failureRegion();
    expect(submitButton()).toBeEnabled();
    expect(statusRegion()).not.toHaveTextContent(/finding hotels/i);
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.queryByText(/demo data \(fixture\)/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /your selection/i })).not.toBeInTheDocument();
  });

  it("U8: focus moves to the failure section when a request fails", async () => {
    // Arrange: the API returns the 503 example.
    mockFetch503();
    await renderAndSubmit();

    const failure = await failureRegion();
    await waitFor(() => expect(failure).toHaveFocus());
  });

  it.each([
    // The first call fails as named; the retry never settles so only the request itself is checked.
    ["503", () => jsonResponse(503, ERROR_BODY)],
    ["network error", () => networkError()],
  ] as const)(
    "U8: Retry re-sends the last request with the same URL, method and body [%s]",
    async (_label, firstResult) => {
      // Arrange: the first request fails, the retry stays pending.
      stubFetchSequence(firstResult(), neverSettles());
      const user = await renderAndSubmit("Wellington hotel", "error");
      await failureRegion();

      await user.click(retryButton());

      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
      const [firstUrl, firstInit] = vi.mocked(fetch).mock.calls[0];
      const [retryUrl, retryInit] = vi.mocked(fetch).mock.calls[1];
      expect(String(retryUrl)).toBe(String(firstUrl));
      expect(retryInit?.method).toBe(firstInit?.method);
      expect(new Headers(retryInit?.headers).get("Content-Type")).toBe("application/json");
      expect(requestBody(1)).toEqual(requestBody(0));
    },
  );

  it("U8: Retry sends the request that failed even after the message and scenario were edited", async () => {
    // Arrange: the first request fails with a 503, the retry stays pending.
    stubFetchSequence(jsonResponse(503, ERROR_BODY), neverSettles());
    const user = await renderAndSubmit("Wellington hotel", "error");
    await failureRegion();
    // Arrange: the traveller edits both fields after the failure, without submitting.
    await user.clear(messageField());
    await user.type(messageField(), "Auckland hotel");
    await user.selectOptions(scenarioSelect(), "empty");

    await user.click(retryButton());

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(requestBody(1)).toEqual({ message: "Wellington hotel", scenario: "error" });
  });

  it("U8: while a retry is pending the failure is cleared, progress shows and no second retry can be sent", async () => {
    // Arrange: the first request fails with a 503, the retry stays pending.
    stubFetchSequence(jsonResponse(503, ERROR_BODY), neverSettles());
    const user = await renderAndSubmit();
    await failureRegion();

    await user.click(retryButton());

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(queryFailureRegion()).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
    expect(statusRegion()).toHaveTextContent(/finding hotels/i);
    expect(submitButton()).toBeDisabled();
    // A click on the disabled submit must not send a third request.
    await user.click(submitButton());
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("U8: a successful retry replaces the failure with results", async () => {
    // Arrange: the first request fails with a 503, the retry returns the success body.
    stubFetchSequence(jsonResponse(503, ERROR_BODY), jsonResponse(200, SUCCESS_BODY));
    const user = await renderAndSubmit();
    await failureRegion();

    await user.click(retryButton());

    expect(await screen.findAllByRole("radio")).toHaveLength(3);
    expect(queryFailureRegion()).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });

  it("U8: a retry that fails again shows the failure state again with focus on it", async () => {
    // Arrange: both requests fail with a 503; two separate Responses, as a body can be read once.
    stubFetchSequence(jsonResponse(503, ERROR_BODY), jsonResponse(503, ERROR_BODY));
    const user = await renderAndSubmit("Wellington hotel", "error");
    await failureRegion();

    await user.click(retryButton());

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(submitButton()).toBeEnabled());
    const failure = await failureRegion();
    await waitFor(() => expect(failure).toHaveFocus());
    expect(retryButton()).toBeInTheDocument();
  });

  it("U8: the form stays usable in the failure state; changing the scenario and submitting sends the new body and shows its results", async () => {
    // Arrange: the first request (scenario error) fails with a 503, the resubmit returns the success body.
    stubFetchSequence(jsonResponse(503, ERROR_BODY), jsonResponse(200, SUCCESS_BODY));
    const user = await renderAndSubmit("Wellington hotel", "error");
    await failureRegion();
    expect(messageField()).toBeEnabled();
    expect(messageField()).toHaveValue("Wellington hotel");
    expect(scenarioSelect()).toBeEnabled();
    expect(submitButton()).toBeEnabled();

    await user.selectOptions(scenarioSelect(), "success");
    await user.click(submitButton());

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(requestBody(1)).toEqual({ message: "Wellington hotel", scenario: "success" });
    expect(await screen.findAllByRole("radio")).toHaveLength(3);
    expect(queryFailureRegion()).not.toBeInTheDocument();
  });

  it("U8: any other non-2xx status (500) shows the same failure state with the fixed copy", async () => {
    // Arrange: the API answers 500 with a body that has no usable detail.
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(500, {})));
    await renderAndSubmit();

    const failure = within(await failureRegion());
    expect(failure.getByText(FIXED_FAILURE_COPY)).toBeInTheDocument();
    expect(failure.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });
});
