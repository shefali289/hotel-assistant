// Owns the journey state (loading, response, failure, last request, selected hotel) and lays out form, status and outcome (U1, U3-U8).
"use client";

import { MotionConfig } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { FailureState } from "@/components/FailureState";
import { RequestForm } from "@/components/RequestForm";
import { Results } from "@/components/Results";
import { StatusRegion } from "@/components/StatusRegion";
import {
  fetchRecommendations,
  RecommendationError,
  type RecommendationRequest,
  type RecommendationResponse,
} from "@/lib/recommendations";

// U8: fixed client copy (section 8, owner-approved) for failures without a usable 503 detail.
const UNAVAILABLE_COPY = "The hotel service is not available right now. Please try again.";
const NETWORK_COPY = "We could not reach the hotel service. Check your connection, then try again.";

/**
 * Chooses the user-safe failure text for an error (U8).
 * @param error - What the request threw.
 * @returns The 503 `detail` when there is one, else the fixed copy for the failure kind.
 */
function failureMessage(error: unknown): string {
  if (error instanceof RecommendationError) {
    if (error.kind === "network") return NETWORK_COPY;
    if (error.detail) return error.detail;
  }
  // U8: any other failure, such as a 500 or an unreadable 200 body, gets the fixed copy (owner, section 6).
  return UNAVAILABLE_COPY;
}

/**
 * Focuses an outcome section (results, empty or failure) and scrolls it to the top of the view,
 * smoothly unless the traveller prefers reduced motion (U5, U7, U8).
 * @param section - The outcome section, or null before it mounts.
 */
function focusOutcome(section: HTMLElement | null) {
  if (!section) return;
  section.focus({ preventScroll: true });
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? true;
  // jsdom has no scrollIntoView, so the call is guarded.
  section.scrollIntoView?.({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

/**
 * The interactive hotel assistant: ask, wait, review hotels and select one, or retry after a failure.
 * @returns The search card with its status region, followed by the results or the failure state.
 */
export function HotelAssistant() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<RecommendationResponse | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // U8: the request as sent, so Retry re-sends it even if the fields were edited since.
  const lastRequestRef = useRef<RecommendationRequest | null>(null);
  const resultsSectionRef = useRef<HTMLElement>(null);
  const failureSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // U5, U7, U8: the disabled submit button drops focus, so focus moves to whichever outcome arrived to keep keyboard users' place.
    if (response) focusOutcome(resultsSectionRef.current);
    else if (failure) focusOutcome(failureSectionRef.current);
  }, [response, failure]);

  async function send(request: RecommendationRequest) {
    lastRequestRef.current = request;
    // U6, U7, U8: a new request or a retry clears the previous outcome, selection and summary until it settles.
    setResponse(null);
    setFailure(null);
    setSelectedId(null);
    setLoading(true);
    try {
      setResponse(await fetchRecommendations(request));
    } catch (error) {
      setFailure(failureMessage(error));
    } finally {
      // U3: loading always ends, so the form never stays disabled.
      setLoading(false);
    }
  }

  function handleRetry() {
    // U8: Retry re-sends the last request as sent; the failure (and Retry) unmount at once, so it cannot be sent twice.
    if (lastRequestRef.current) void send(lastRequestRef.current);
  }

  return (
    // Animations follow the traveller's reduced-motion setting.
    <MotionConfig reducedMotion="user">
      <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-900/5 sm:p-8">
        <RequestForm loading={loading} onSubmit={send} />
        <StatusRegion loading={loading} />
      </div>
      {response && (
        <Results
          response={response}
          selectedId={selectedId}
          onSelect={setSelectedId}
          sectionRef={resultsSectionRef}
        />
      )}
      {failure && (
        <FailureState message={failure} onRetry={handleRetry} sectionRef={failureSectionRef} />
      )}
    </MotionConfig>
  );
}
