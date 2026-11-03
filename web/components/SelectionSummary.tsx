// "Your selection" panel naming the chosen hotel, its nightly price and breakfast status (U6).
"use client";

import { motion } from "framer-motion";
import { CircleCheck } from "lucide-react";

import { formatPrice } from "@/lib/formatPrice";
import type { Hotel } from "@/lib/recommendations";

/** Props for {@link SelectionSummary}. */
export interface SelectionSummaryProps {
  /** The selected hotel. */
  hotel: Hotel;
}

/**
 * Summary of the selected hotel, with a note that no booking is made (booking is out of scope).
 * @param props - See {@link SelectionSummaryProps}.
 * @returns An accent panel that slides in; it is in the DOM as soon as it renders.
 */
export function SelectionSummary({ hotel }: SelectionSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-linear-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-lg"
    >
      <h2 id="summary-heading" className="flex items-center gap-2 text-lg font-bold">
        <CircleCheck aria-hidden="true" className="h-5 w-5" />
        Your selection
      </h2>
      <p className="mt-3">
        You selected {hotel.name}: {formatPrice(hotel.nightlyPrice, hotel.currency)} per night, breakfast{" "}
        {hotel.breakfastIncluded ? "included" : "not included"}.
      </p>
      <p className="mt-3 text-sm text-indigo-50">This is a demo. No booking has been made.</p>
    </motion.div>
  );
}
