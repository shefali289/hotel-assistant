// Unit tests for the POST /recommendations API client: base URL from env, response parsing (U1) and typed failures (U8).
import { describe, expect, it, vi } from "vitest";

import { fetchRecommendations } from "@/lib/recommendations";
import {
  ERROR_BODY,
  mockFetch503,
  mockFetchNetworkError,
  mockFetchSuccess,
  SUCCESS_BODY,
} from "@/test/mockFetch";

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

  it("U8: fetchRecommendations rejects on a 503 response", async () => {
    // Arrange: the API returns the openapi.yaml 503 example with a user-safe detail.
    mockFetch503();

    // U8 (section 8): the rejection is the typed error with kind "unavailable" and the API's detail.
    await expect(fetchRecommendations(REQUEST)).rejects.toMatchObject({
      kind: "unavailable",
      detail: ERROR_BODY.detail,
    });
  });

  it("U8: fetchRecommendations rejects when fetch fails with a network error", async () => {
    // Arrange: fetch rejects with TypeError("Failed to fetch"), as browsers do when no response arrives.
    mockFetchNetworkError();

    // U8 (section 8): the rejection is the typed error with kind "network", not the raw TypeError.
    await expect(fetchRecommendations(REQUEST)).rejects.toMatchObject({ kind: "network" });
  });
});
