// Recoverable failure card with Retry, shown in the results slot after a failed request (U8, U9, U10).
"use client";

import { RotateCw, TriangleAlert } from "lucide-react";
import type { RefObject } from "react";

/** Props for {@link FailureState}. */
export interface FailureStateProps {
  /** User-safe failure text: the 503 `detail`, or the fixed copy for the failure kind (section 8). */
  message: string;
  /** Called when the traveller activates Retry. */
  onRetry: () => void;
  /** Ref for the section, which receives focus when the failure is shown (U8). */
  sectionRef: RefObject<HTMLElement | null>;
}

/**
 * The failure section. Its heading names the region and its body describes it, so the
 * focus move announces both without a second live region or `role="alert"` (U8).
 * @param props - See {@link FailureStateProps}.
 * @returns A white card with an amber accent, the failure text, a demo note and Retry.
 */
export function FailureState({ message, onRetry, sectionRef }: FailureStateProps) {
  return (
    <section
      ref={sectionRef}
      aria-labelledby="failure-heading"
      aria-describedby="failure-body"
      // U10: a script-focus target only, not a tab stop; no outline, following the T2 owner rule (section 7 deviation).
      tabIndex={-1}
      className="mt-10 scroll-mt-4 rounded-2xl border-l-4 border-amber-500 bg-white p-5 shadow-md ring-1 ring-slate-900/5 focus:outline-none sm:p-6"
    >
      <div className="flex items-start gap-3">
        <TriangleAlert aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-amber-600" />
        <div className="min-w-0 max-w-prose flex-1">
          <h2 id="failure-heading" className="text-xl font-bold text-slate-900">
            We could not get recommendations
          </h2>
          <p id="failure-body" className="mt-2 text-slate-800 wrap-anywhere">
            {message}
          </p>
          {/* U8, section 7: the note names the demo way to recover and does not promise that Retry works. */}
          <p className="mt-2 text-sm text-slate-600">
            Demo note: the Service error scenario always fails. To see hotels, choose another scenario and
            select Find hotels.
          </p>
          <button
            type="button"
            onClick={onRetry}
            // U9: full width and at least 44 px tall at 375px; U10: visible focus ring on white.
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:bg-indigo-800 md:w-auto"
          >
            <RotateCw aria-hidden="true" className="h-5 w-5" />
            Retry
          </button>
        </div>
      </div>
    </section>
  );
}
