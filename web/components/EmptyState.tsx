// Empty-result panel shown in the results section when the API returns no hotels (U7; DEC-2).
import { SearchX } from "lucide-react";

/** Id of the guidance text, so the results section can include it in its description (U7). */
export const EMPTY_GUIDANCE_ID = "empty-guidance";

/**
 * Tells the traveller no hotels matched and what to do next (Option A, section 8 copy).
 * @returns A neutral panel with a heading, the guidance and a demo note.
 */
export function EmptyState() {
  return (
    <div className="mt-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-900/5">
      <h3 className="flex max-w-prose items-center gap-2 text-lg font-semibold text-slate-900">
        <SearchX aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-500" />
        No hotels to show
      </h3>
      <p id={EMPTY_GUIDANCE_ID} className="mt-2 max-w-prose text-slate-700">
        Try changing your request, for example a higher nightly budget or a different area, then select
        Find hotels again.
      </p>
      {/* DEC-1: the note names the demo control by its visible label, so it does not read as a traveller preference. */}
      <p className="mt-2 max-w-prose text-sm text-slate-600">
        Demo note: the Empty results scenario always returns no hotels.
      </p>
    </div>
  );
}
