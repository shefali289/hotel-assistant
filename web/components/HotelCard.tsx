// One hotel as a selectable card: radio named by the hotel, with price, breakfast and explanation (U5, U6, U9).
"use client";

import { motion } from "framer-motion";
import { CircleCheck, Coffee } from "lucide-react";

import { formatPrice } from "@/lib/formatPrice";
import type { Hotel } from "@/lib/recommendations";

/** Props for {@link HotelCard}. */
export interface HotelCardProps {
  /** The hotel to show. */
  hotel: Hotel;
  /** Position in the list, used to stagger the entrance animation. */
  index: number;
  /** Whether this hotel's radio is checked. */
  checked: boolean;
  /** Called with the hotel id when its radio is chosen. */
  onSelect: (hotelId: string) => void;
}

/**
 * A hotel card in the "Choose a hotel" radio group.
 * @param props - See {@link HotelCardProps}.
 * @returns A list item holding one radio and the hotel's details.
 */
export function HotelCard({ hotel, index, checked, onSelect }: HotelCardProps) {
  const radioId = `hotel-${hotel.id}`;
  const priceId = `${radioId}-price`;
  const breakfastId = `${radioId}-breakfast`;
  const explanationId = `${radioId}-explanation`;

  return (
    <motion.li
      // Entrance only: the card is in the DOM at once, the animation just fades it in.
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="group relative rounded-2xl border-2 border-transparent bg-white p-5 shadow-md ring-1 ring-slate-900/5 transition motion-safe:hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50"
    >
      <div className="flex items-start gap-3">
        <input
          id={radioId}
          type="radio"
          name="hotel"
          value={hotel.id}
          checked={checked}
          onChange={() => onSelect(hotel.id)}
          // U6: the accessible name is the hotel name only; the details are read as its description.
          aria-describedby={`${priceId} ${breakfastId} ${explanationId}`}
          className="mt-1.5 h-4 w-4 shrink-0 accent-indigo-600"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            {/* The label's overlay stretches over the card, so a click anywhere on it selects the hotel. U9: long names wrap. */}
            <label
              htmlFor={radioId}
              className="min-w-0 cursor-pointer text-lg font-semibold text-slate-900 wrap-anywhere after:absolute after:inset-0 after:rounded-2xl"
            >
              {hotel.name}
            </label>
            <p id={priceId} className="text-lg font-bold text-indigo-700">
              {formatPrice(hotel.nightlyPrice, hotel.currency)} per night
            </p>
          </div>
          <p id={breakfastId} className="mt-2">
            {/* U5: breakfast is stated in text, never by colour or icon alone. */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                hotel.breakfastIncluded
                  ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                  : "bg-amber-50 text-amber-900 ring-amber-200"
              }`}
            >
              <Coffee aria-hidden="true" className="h-3.5 w-3.5" />
              {hotel.breakfastIncluded ? "Breakfast included" : "Breakfast not included"}
            </span>
          </p>
          <p id={explanationId} className="mt-2 text-slate-700 wrap-anywhere">
            {hotel.explanation}
          </p>
        </div>
        <CircleCheck
          aria-hidden="true"
          className="hidden h-6 w-6 shrink-0 text-indigo-600 group-has-[:checked]:block"
        />
      </div>
    </motion.li>
  );
}
