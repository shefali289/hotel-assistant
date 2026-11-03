// Message input, scenario demo control and submit, with the empty-message guard (U1, U2, U3, U11; DEC-1, DEC-3).
"use client";

import { CircleAlert, Search, Sparkles } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import type { RecommendationRequest, Scenario } from "@/lib/recommendations";

/** Props for {@link RequestForm}. */
export interface RequestFormProps {
  /** True while a request is pending; disables submit (U3). */
  loading: boolean;
  /** Called with the request to send once the message passes the guard. */
  onSubmit: (request: RecommendationRequest) => void;
}

const HELP_ID = "message-help";
const ERROR_ID = "message-error";

// U2: the submitted values match the contract's scenario enum (DEC-1).
const SCENARIO_OPTIONS: ReadonlyArray<{ value: Scenario; label: string }> = [
  { value: "success", label: "Success" },
  { value: "empty", label: "Empty results" },
  { value: "error", label: "Service error" },
];

const CONTROL_CLASSES =
  "w-full rounded-xl border border-slate-300 bg-white py-3 text-base text-slate-900 shadow-inner transition focus-visible:border-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";

/**
 * The request form. Blocks blank messages and sends the message exactly as typed.
 * @param props - See {@link RequestFormProps}.
 * @returns A `noValidate` form, so the U11 guard runs in React rather than as a browser tooltip.
 */
export function RequestForm({ loading, onSubmit }: RequestFormProps) {
  const [message, setMessage] = useState("");
  const [scenario, setScenario] = useState<Scenario>("success");
  const [invalid, setInvalid] = useState(false);
  const messageRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // U3: one request at a time, even if Enter is pressed while pending.
    if (loading) return;
    // U11, DEC-3: block empty or whitespace-only messages, but send valid ones untrimmed.
    if (message.trim() === "") {
      setInvalid(true);
      messageRef.current?.focus();
      return;
    }
    setInvalid(false);
    onSubmit({ message, scenario });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-slate-800">
          What are you looking for?
        </label>
        <div className="relative mt-2">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-500"
          />
          <input
            ref={messageRef}
            id="message"
            name="message"
            type="text"
            // U11, DEC-3: the browser caps typed and pasted text, so the API's length 422 cannot be triggered.
            maxLength={1000}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            aria-invalid={invalid || undefined}
            // U11: the validation message joins the always-present helper text in the description.
            aria-describedby={invalid ? `${HELP_ID} ${ERROR_ID}` : HELP_ID}
            className={`${CONTROL_CLASSES} pr-4 pl-10 aria-invalid:border-red-600`}
          />
        </div>
        <p id={HELP_ID} className="mt-2 text-sm text-slate-600">
          Example: Find a Wellington hotel for two nights, up to NZD 250 per night; breakfast preferred. Up
          to 1000 characters.
        </p>
        {invalid && (
          <p
            id={ERROR_ID}
            role="alert"
            className="mt-2 flex items-center gap-1.5 text-sm font-medium text-red-700"
          >
            <CircleAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
            Enter a message describing the hotel you need.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="md:w-72">
          <label htmlFor="scenario" className="block text-sm font-semibold text-slate-800">
            Demo scenario (test control)
          </label>
          <select
            id="scenario"
            name="scenario"
            value={scenario}
            // U2: the options come from SCENARIO_OPTIONS, so the value is always a Scenario.
            onChange={(event) => setScenario(event.target.value as Scenario)}
            className={`${CONTROL_CLASSES} mt-2 px-3`}
          >
            {SCENARIO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          // U3: disabled while pending; the text stays the same so the accessible name is stable.
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98] active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-indigo-600 disabled:hover:shadow-md"
        >
          <Sparkles aria-hidden="true" className="h-5 w-5" />
          Find hotels
        </button>
      </div>
    </form>
  );
}
