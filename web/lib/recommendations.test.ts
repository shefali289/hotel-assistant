// Unit tests for the POST /recommendations API client: base URL from env and response parsing (U1).
import { describe, expect, it, vi } from "vitest";

import { fetchRecommendations } from "@/lib/recommendations";
import { mockFetchSuccess, SUCCESS_BODY } from "@/test/mockFetch";

const REQUEST = { message: "Wellington hotel", scenario: "success" } as const;

/** Returns the URL passed to the first stubbed fetch call as a string. */
const firstFetchUrl = () => String(vi.mocked(fetch).mock.calls[0][0]);

describe("fetchRecommendations", () => {
  it("U1: fetchRecommendations posts to NEXT_PUBLIC_API_BASE_URL + /recommendations", async () => {
    // Arrange: a custom base URL is set and the API returns the success body.
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://api.test");
    mockFetchSuccess();

    await fetchRecommendations(REQUEST);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(firstFetchUrl()).toBe("http://api.test/recommendations");
  });

  it("U1: fetchRecommendations falls back to http://localhost:8000 when the env var is unset", async () => {
    // Arrange: the base URL env var is removed for this test and the API returns the success body.
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", undefined);
    mockFetchSuccess();

    await fetchRecommendations(REQUEST);

    expect(firstFetchUrl()).toBe("http://localhost:8000/recommendations");
  });

  it("U1: fetchRecommendations returns the parsed success body", async () => {
    // Arrange: the API returns the openapi.yaml success example.
    mockFetchSuccess();

    const response = await fetchRecommendations(REQUEST);

    expect(response).toEqual(SUCCESS_BODY);
  });
});
