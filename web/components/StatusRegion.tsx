// Always-mounted live status region that announces progress while a request is pending (U3).
import { LoaderCircle } from "lucide-react";

/** Props for {@link StatusRegion}. */
export interface StatusRegionProps {
  /** True while a request is pending. */
  loading: boolean;
}

/**
 * Polite status region. It stays mounted and empty when idle, because screen readers
 * only announce changes to a live region that already exists (U3).
 * @param props - See {@link StatusRegionProps}.
 * @returns A `role="status"` element holding the progress text while loading.
 */
export function StatusRegion({ loading }: StatusRegionProps) {
  return (
    <div role="status" className="mt-4 min-h-6 text-sm font-medium text-indigo-800">
      {loading && (
        <span className="inline-flex items-center gap-2">
          <LoaderCircle aria-hidden="true" className="h-4 w-4 motion-safe:animate-spin" />
          Finding hotels...
        </span>
      )}
    </div>
  );
}
