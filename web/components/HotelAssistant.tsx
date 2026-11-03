// Owns the journey state (loading, response, selected hotel) and lays out form, status and results (U1, U3-U6).
"use client";

import { MotionConfig } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { RequestForm } from "@/components/RequestForm";
import { Results } from "@/components/Results";
import { StatusRegion } from "@/components/StatusRegion";
import {
  fetchRecommendations,
  type RecommendationRequest,
  type RecommendationResponse,
} from "@/lib/recommendations";

/**
 * Focuses the results section and scrolls it to the top of the view, smoothly unless the traveller prefers reduced motion (U5).
 * @param section - The results section, or null before it mounts.
 */
function focusResults(section: HTMLElement | null) {
  if (!section) return;
  section.focus({ preventScroll: true });
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? true;
  // jsdom has no scrollIntoView, so the call is guarded.
  section.scrollIntoView?.({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

/**
 * The interactive hotel assistant: ask, wait, review hotels and select one.
 * @returns The search card with its status region, followed by the results once a response arrives.
 */
export function HotelAssistant() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<RecommendationResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const resultsSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // U5: the disabled submit button drops focus, so focus moves to the whole results section to keep keyboard users' place.
    if (response) focusResults(resultsSectionRef.current);
  }, [response]);

  async function handleSubmit(request: RecommendationRequest) {
    // U6: a new request clears the previous results, selection and summary until its response arrives.
    setResponse(null);
    setSelectedId(null);
    setLoading(true);
    try {
      setResponse(await fetchRecommendations(request));
    } catch {
      // TODO(T3): show the failure state with Retry (U8); until then the page only leaves loading.
    } finally {
      // U3: loading always ends, so the form never stays disabled.
      setLoading(false);
    }
  }

  return (
    // Animations follow the traveller's reduced-motion setting.
    <MotionConfig reducedMotion="user">
      <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-900/5 sm:p-8">
        <RequestForm loading={loading} onSubmit={handleSubmit} />
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
    </MotionConfig>
  );
}
