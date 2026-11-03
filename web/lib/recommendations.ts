// Typed client for POST /recommendations; types mirror openapi.yaml (U1, U4, U5; DEC-1).

/** Demo control that selects the API's fixture outcome; required, with no default (DEC-1). */
export type Scenario = "success" | "empty" | "error";

/** Request body of POST /recommendations (openapi.yaml `RecommendationRequest`). */
export interface RecommendationRequest {
  /** The traveller's request, sent as typed; 1 to 1000 characters with a non-whitespace one (DEC-3). */
  message: string;
  /** Demo outcome to return (DEC-1). */
  scenario: Scenario;
}

/** A recommended hotel (openapi.yaml `Hotel`). */
export interface Hotel {
  /** Stable identifier, for example "h1". */
  id: string;
  /** Hotel name shown to the traveller. */
  name: string;
  /** Price per night in `currency`; may arrive as a float such as 220.0. */
  nightlyPrice: number;
  /** ISO 4217 currency code, for example "NZD". */
  currency: string;
  /** Whether breakfast is included in the nightly price. */
  breakfastIncluded: boolean;
  /** Short reason the assistant recommends this hotel. */
  explanation: string;
}

/** 200 body of POST /recommendations (openapi.yaml `RecommendationResponse`). */
export interface RecommendationResponse {
  /** The assistant's message to the traveller. */
  message: string;
  /** Recommended hotels, in display order; empty in the empty scenario (DEC-2). */
  hotels: Hotel[];
  /** Marks the response as fixture data rather than live results. */
  source: "fixture";
}

/** The contract's `servers` URL, used when NEXT_PUBLIC_API_BASE_URL is unset (owner, 2026-11-03). */
const DEFAULT_API_BASE_URL = "http://localhost:8000";

/**
 * Requests hotel recommendations from the API.
 * @param request - The message and demo scenario to send.
 * @returns The parsed recommendation response.
 * @throws Error when the API answers with a non-2xx status, or the fetch rejection on a network failure.
 */
export async function fetchRecommendations(
  request: RecommendationRequest,
): Promise<RecommendationResponse> {
  // U1: read per call, not at module load, so tests can stub it; Next.js inlines the value at build time.
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // U1: the body is exactly {message, scenario}, with the message untrimmed.
    body: JSON.stringify({ message: request.message, scenario: request.scenario }),
  });
  // T2 scope: any non-2xx is thrown; T3 maps it to the failure state (U8).
  if (!response.ok) {
    throw new Error(`Recommendations request failed with status ${response.status}`);
  }
  return (await response.json()) as RecommendationResponse;
}
