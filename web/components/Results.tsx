// Results: heading, fixture badge, assistant message, and either the hotel radio group with summary or the empty state (U4-U7, U9).
"use client";

import { motion } from "framer-motion";
import { Bot, Database } from "lucide-react";
import type { RefObject } from "react";

import { EMPTY_GUIDANCE_ID, EmptyState } from "@/components/EmptyState";
import { HotelCard } from "@/components/HotelCard";
import { SelectionSummary } from "@/components/SelectionSummary";
import type { RecommendationResponse } from "@/lib/recommendations";

const ASSISTANT_MESSAGE_ID = "assistant-message";

/** Props for {@link Results}. */
export interface ResultsProps {
  /** The 200 response to show. */
  response: RecommendationResponse;
  /** Id of the selected hotel, or null when none is selected. */
  selectedId: string | null;
  /** Called with a hotel id when the traveller selects it. */
  onSelect: (hotelId: string) => void;
  /** Ref for the results section, which receives focus when results arrive, empty or not (U5, U7). */
  sectionRef: RefObject<HTMLElement | null>;
}

/**
 * The results section. Cards take two thirds and the summary one third on desktop; they stack at 375px (Option B).
 * With no hotels it shows the empty state at full width instead of the grid (U7).
 * @param props - See {@link ResultsProps}.
 * @returns The results section.
 */
export function Results({ response, selectedId, onSelect, sectionRef }: ResultsProps) {
  const selectedHotel = response.hotels.find((hotel) => hotel.id === selectedId);
  const isEmpty = response.hotels.length === 0;

  return (
    <section
      aria-labelledby="results-heading"
      // U7: when focus lands on an empty result, the assistant message and the guidance are read with the heading.
      aria-describedby={isEmpty ? `${ASSISTANT_MESSAGE_ID} ${EMPTY_GUIDANCE_ID}` : undefined}
      ref={sectionRef}
      // U5: a script-focus target only, not a tab stop; no outline at the owner's request (G3 browser review).
      tabIndex={-1}
      className="mt-10 scroll-mt-4 focus:outline-none"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="results-heading" className="text-2xl font-bold text-slate-900">
          Recommended hotels
        </h2>
        {/* U5: the fixture label tells the traveller these are demo results. */}
        {response.source === "fixture" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 ring-1 ring-violet-200">
            <Database aria-hidden="true" className="h-3.5 w-3.5" />
            Demo data (fixture)
          </span>
        )}
      </div>
      <motion.p
        id={ASSISTANT_MESSAGE_ID}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-4 flex items-start gap-3 rounded-2xl bg-white/80 p-4 text-slate-800 shadow-sm ring-1 ring-slate-900/5"
      >
        <Bot aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
        {/* U9: long messages wrap instead of widening the page at 375px. */}
        <span className="min-w-0 wrap-anywhere">
          <span className="font-semibold">Assistant:</span> <span>{response.message}</span>
        </span>
      </motion.p>
      {/* U7: no grid when empty, so the desktop layout leaves no empty right-hand column. */}
      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-3 md:items-start">
          {/* U6: a native radio group gives single selection and arrow keys without extra code. */}
          <fieldset className="min-w-0 md:col-span-2">
            <legend className="mb-3 text-lg font-semibold text-slate-900">Choose a hotel</legend>
            <ul className="space-y-4">
              {response.hotels.map((hotel, index) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  index={index}
                  checked={hotel.id === selectedId}
                  onSelect={onSelect}
                />
              ))}
            </ul>
          </fieldset>
          {selectedHotel && (
            <aside aria-labelledby="summary-heading" className="md:sticky md:top-4 md:mt-10">
              {/* Keyed by hotel, so the panel re-animates on each change; no exit animation keeps the old one out of the DOM. */}
              <SelectionSummary key={selectedHotel.id} hotel={selectedHotel} />
            </aside>
          )}
        </div>
      )}
    </section>
  );
}
