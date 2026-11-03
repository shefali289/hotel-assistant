// Typed client for POST /recommendations; types mirror openapi.yaml and failures become a typed error (U1, U4, U5, U8; DEC-1, DEC-4).

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
 * Why a recommendations request failed (U8): a 503 (`unavailable`), any other non-2xx
 * (`unexpected`), or no response at all (`network`).
 */
export type RecommendationErrorKind = "unavailable" | "unexpected" | "network";

/** Error thrown by {@link fetchRecommendations}; the UI picks its failure copy from `kind` (U8). */
export class RecommendationError extends Error {
  /** Why the request failed. */
  readonly kind: RecommendationErrorKind;
  /** User-safe text from a 503 body's `detail` (DEC-4); undefined for every other failure. */
  readonly detail?: string;

  /**
   * @param kind - Why the request failed.
   * @param detail - The 503 body's string `detail`, when there is one.
   */
  constructor(kind: RecommendationErrorKind, detail?: string) {
    super(`Recommendations request failed: ${kind}`);
    this.name = "RecommendationError";
    this.kind = kind;
    this.detail = detail;
  }
}

/**
 * Reads the user-safe `detail` of a 503 body (DEC-4).
 * @param response - The 503 response.
 * @returns The `detail` string, or undefined when the body is not JSON or has no string `detail`.
 */
async function readDetail(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.json();
    // U8: only a string `detail` is shown; no other part of a failure body reaches the traveller.
    if (typeof body === "object" && body !== null && "detail" in body && typeof body.detail === "string") {
      return body.detail;
    }
  } catch {
    // A body that is not JSON falls back to the fixed copy (owner, section 6).
  }
  return undefined;
}

/**
 * Requests hotel recommendations from the API.
 * @param request - The message and demo scenario to send.
 * @returns The parsed recommendation response.
 * @throws RecommendationError on any non-2xx status or when fetch rejects (network failure).
 */
export async function fetchRecommendations(
  request: RecommendationRequest,
): Promise<RecommendationResponse> {
  // U1: read per call, not at module load, so tests can stub it; Next.js inlines the value at build time.
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // U1: the body is exactly {message, scenario}, with the message untrimmed.
      body: JSON.stringify({ message: request.message, scenario: request.scenario }),
    });
  } catch {
    // U8: fetch rejects when no response arrives, so it is shown as a network failure rather than a raw TypeError.
    throw new RecommendationError("network");
  }
  // U8: a 503 carries a user-safe detail (DEC-4); any other non-2xx gets the fixed copy (owner, section 6).
  if (response.status === 503) {
    throw new RecommendationError("unavailable", await readDetail(response));
  }
  if (!response.ok) {
    throw new RecommendationError("unexpected");
  }
  return (await response.json()) as RecommendationResponse;
}
