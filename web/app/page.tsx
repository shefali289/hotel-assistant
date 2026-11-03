// Home page: heading, intro and the hotel assistant journey (U1-U6, U11).
import { Hotel } from "lucide-react";

import { HotelAssistant } from "@/components/HotelAssistant";

/**
 * Home page route. A synchronous server component, so tests can render it in jsdom.
 * @returns The page with the interactive journey below the heading.
 */
export default function HomePage() {
  return (
    <main className="flex-1 bg-linear-to-br from-sky-50 via-indigo-50 to-violet-100 px-4 py-10 sm:px-6 md:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Hotel aria-hidden="true" className="h-6 w-6" />
            </span>
            Hotel Assistant
          </h1>
          <p className="mt-3 text-base text-slate-700 md:text-lg">
            Describe the stay you need and the assistant will suggest hotels.
          </p>
        </header>
        <HotelAssistant />
      </div>
    </main>
  );
}
