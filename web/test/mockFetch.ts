// Stubs global fetch, the only mock boundary in web tests (Q1, Q6); bodies copied from openapi.yaml examples.
import { vi } from "vitest";

/** The `success` example of the 200 response in openapi.yaml: three fixture hotels (A4). */
export const SUCCESS_BODY = {
  message: "Here are three Wellington hotels for your stay.",
  hotels: [
    {
      id: "h1",
      name: "Harbour House",
      nightlyPrice: 220,
      currency: "NZD",
      breakfastIncluded: true,
      explanation: "Within budget; breakfast included.",
    },
    {
      id: "h2",
      name: "City Garden",
      nightlyPrice: 245,
      currency: "NZD",
      breakfastIncluded: true,
      explanation: "Near the meeting district.",
    },
    {
      id: "h3",
      name: "Quay Rooms",
      nightlyPrice: 195,
      currency: "NZD",
      breakfastIncluded: false,
      explanation: "Lower price; breakfast costs extra.",
    },
  ],
  source: "fixture",
};

/** The `empty` example of the 200 response in openapi.yaml: no hotels (DEC-2). */
export const EMPTY_BODY = {
  message: "No hotels matched your request.",
  hotels: [],
  source: "fixture",
};

/**
 * Builds a JSON `Response` like the API sends.
 * @param status - HTTP status code.
 * @param body - Value serialised as the JSON body.
 * @returns A fresh `Response`; its body can be read only once.
 */
export const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * Stubs fetch to resolve with a 200 and the given body.
 * @param body - Response body; defaults to `SUCCESS_BODY`.
 */
export const mockFetchSuccess = (body: unknown = SUCCESS_BODY) =>
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, body)));

/** Stubs fetch to resolve with a 200 and `EMPTY_BODY`. */
export const mockFetchEmpty = () =>
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, EMPTY_BODY)));

/**
 * Stubs fetch with a promise that never settles until `resolve()` is called,
 * so the loading state can be asserted (U3).
 * @returns An object whose `resolve()` settles the request with a 200 and `SUCCESS_BODY`.
 */
export const mockFetchPending = () => {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((r) => (resolve = r));
  vi.stubGlobal("fetch", vi.fn().mockReturnValue(promise));
  return { resolve: () => resolve(jsonResponse(200, SUCCESS_BODY)) };
};
