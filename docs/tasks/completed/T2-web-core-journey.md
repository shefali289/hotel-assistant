# T2: Web core journey

> Single source of truth for this task. Every agent reads it first and appends to it.

## 1. Header
| Field | Value |
|---|---|
| ID | T2 |
| Title | Web core journey |
| Branch | task/T2-web-core-journey |
| Status | Done |
| Phase | closed |
| Current agent | none |
| Last updated | 2026-11-03 |
| Location | completed |
| Skills used | accessible-ui, web-testing, code-comments, gate-check |

## 2. Goal
Let a traveller submit a request, see progress, read the assistant's message and hotel cards, select one hotel, and see a clear summary.

## 3. In scope / Out of scope
**In scope:** Next.js + Tailwind scaffold, Vitest/RTL setup, API client, form, loading, result cards, selection summary. UI co-creation.

**Out of scope:** empty and error states, e2e.

## 4. Requirements
Acceptance criteria are written by the planner.
| ID | Requirement | Acceptance criteria (Given/When/Then) | Status |
|---|---|---|---|
| U1 | Labelled message input + submit | **Given** the home page has loaded, **then** a message field is reachable by its visible label (`getByLabelText`) and a real submit `<button>` is reachable by role and name. **Given** a non-blank message and a scenario, **when** the traveller activates submit, **then** exactly one `fetch` is made: `POST` to `<API base URL>/recommendations` with header `Content-Type: application/json` and a JSON body of exactly `{message, scenario}`, where `message` is the text as typed (not trimmed; the API accepts surrounding whitespace, A2) and `scenario` is the control's value. The base URL comes from `NEXT_PUBLIC_API_BASE_URL`, falling back to `http://localhost:8000` when unset (owner, 2026-11-03). With Option B the message field is a single-line `<input type="text">`, so Enter in it submits the form natively. | Done |
| U2 | Labelled scenario demo control | **Given** the home page, **then** a native `<select>` (role `combobox`, Option B) is reachable by its visible label and offers exactly three options whose submitted values are `success`, `empty` and `error` (DEC-1; it is a demo control, not a traveller preference, and the label says so). **Given** the page has just loaded, **then** `success` is preselected (owner, 2026-11-03). **When** the traveller chooses `empty` or `error` and submits, **then** the request body's `scenario` equals that value. T2 only checks the request for `empty` and `error`; their result states belong to T3. | Done |
| U3 | Progress while waiting (submit disabled, aria-live status) | **Given** the page has loaded, **then** one status region (`role="status"` or `aria-live="polite"`) is already in the DOM and empty. **Given** a valid submit, **while** the request is pending, **then** the submit button is disabled and the status region contains the progress text (copy from section 8). **When** the traveller clicks submit again while pending, **then** no second request is sent. **When** the response arrives, **then** the button is enabled again and the progress text is gone from the status region. | Done |
| U4 | Assistant message shown | **Given** a 200 response, **when** it arrives, **then** the response's `message` is shown as text on the page (for the success fixture, "Here are three Wellington hotels for your stay."). **Given** a response whose `message` is a different string, **then** that string is shown, proving the text comes from the response and is not hard-coded. | Done |
| U5 | Hotel cards show name, nightly price, currency, breakfast, explanation, plus fixture label | **Given** the success response, **then** exactly three hotel cards appear in response order (Harbour House, City Garden, Quay Rooms), and focus moves to the whole "Recommended hotels" results section (a `<section>` labelled by its heading via `aria-labelledby`, so role `region`, with `tabIndex={-1}`; owner change at the G3 browser review, 2026-11-03) so keyboard users keep their place after the disabled submit button loses focus (owner, 2026-11-03). Each card shows its `name`; its nightly price together with the visible currency code (for example "NZD 220", formatted with `Intl.NumberFormat` and `currencyDisplay: "code"`, so "NZD" appears rather than "$"); breakfast as text, "included" for h1 and h2 and "not included" for h3 (exact copy from section 8; never colour or icon alone); and its `explanation` verbatim. **Given** `source: "fixture"`, **then** a visible label on the results says they are fixture (demo) data. | Done |
| U6 | Select exactly one hotel → clear summary | **Given** results are shown, **then** the hotels are a native radio group (a `fieldset` with a `legend`, one radio per hotel, each labelled by the hotel name), no radio is checked, and no summary is shown. **When** the traveller selects a hotel, **then** that radio is checked and a "Your selection" summary names the hotel, its nightly price with currency, and breakfast status (beside the cards on desktop, below them at 375px; Option B). **When** the traveller then selects another hotel, **then** only the new radio is checked and the summary shows only the new hotel. **When** the traveller submits a new request, **then** the previous results, selection and summary are cleared until the new response arrives (planner default, assumption below). | Done |
| U11 | Client-side empty-message guard | **Given** the message is empty or whitespace only (spaces, tabs; owner chose block-when-trim-empty and send as typed, 2026-11-03, matching DEC-3), **when** the traveller submits, **then** no `fetch` is made, a validation message (copy from section 8) is shown and announced, the field gets `aria-invalid="true"` and `aria-describedby` pointing to that message, and focus is on the message field. **When** the traveller then enters a non-blank message and submits, **then** the validation message and `aria-invalid` are cleared and the request is sent. **Given** the owner's decision (sections 6 and 7), **then** the message field has `maxLength={1000}` (DEC-3). **When** the traveller pastes 1001 characters, **then** the field holds 1000 characters and the request body's `message` is 1000 characters long, so the UI cannot trigger the API's length 422. | Done |
| Q1 | Component/state tests with Vitest + RTL (journey part) | **Given** `web/` with dependencies installed, **when** `npm test` runs, **then** Vitest runs every U1–U6 and U11 test in jsdom with React Testing Library and user-event, with global `fetch` as the only mock (web-testing skill), and all pass; `npm run lint` and `npx tsc --noEmit` pass. Every test name starts with its requirement ID. No snapshot tests and no implementation-detail queries. T3 adds the states part and closes Q1. | In progress (journey done; T3 closes) |
| Q8 | Code meets the commenting standard (status closed by T4) | **Given** the `web/` source and test files written or hand-edited in T2, **when** the gate-check comment greps run and the reviewer inspects, **then** every file has a header comment with its purpose and IDs (above `"use client"` where present); exported components, functions and types have TSDoc; requirement-driven behaviour cites its ID (`// U3:`, `// U11:`); each test file has a header and a comment on each mock or arrange step; and there is no commented-out code, no TODO without a task ID and no `console.log` or `console.debug`. Unmodified `create-next-app` files are exempt until hand-edited; `next-env.d.ts` is always exempt. | In progress (T2 done; T4 closes) |

## 5. Assumptions & dependencies
**Assumptions:**
- The red phase needs a runnable project, so the unmodified `create-next-app` scaffold counts as test config for G2. Use `npx create-next-app@latest web --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --disable-git`. Do not keep any nested `AGENTS.md` or `CLAUDE.md` it generates.
- Scaffold files hand-edited in green must meet the comment standard.
- The API from T1 runs on `http://localhost:8000` and already allows the web origins `http://localhost:3000` and `http://127.0.0.1:3000` through CORS (A10, done). T2 needs no `api/` change.
- The root `.env.example` already lists `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`. The API client reads `process.env.NEXT_PUBLIC_API_BASE_URL` when each request is made, not at module load, so tests can set it with `vi.stubEnv`. It falls back to `http://localhost:8000` when unset (owner, 2026-11-03). Next.js only reads `web/.env.local`, and the T4 README explains the mapping.
- Seams the tests rely on, which the implementer must provide: the default export of `web/app/page.tsx` renders the whole journey and can be rendered in jsdom (a synchronous component, or one that wraps a client component). The API client is `fetchRecommendations(request)` exported from `web/lib/recommendations.ts`. Shared response types match `openapi.yaml`. Test helpers live in `web/test/mockFetch.ts` as in the web-testing skill, with `SUCCESS_BODY` and `EMPTY_BODY` copied from the `openapi.yaml` examples.
- A new submit clears the previous results, selection and summary until the new response arrives (planner default for U6; the owner confirms it with the G1 approval).
- Non-200 responses and network failures are out of T2's scope (U7 and U8 are T3). In T2 the client throws on a non-2xx status or a rejected `fetch`, and the page always leaves the loading state (`finally`), so the form never stays stuck (owner, 2026-11-03). T2 does not test or render error or empty copy; T3 adds it. Any placeholder the implementer needs uses `TODO(T3)`.
- Prices: `nightlyPrice` may arrive as `220.0` (T1 review nit 1). `Intl.NumberFormat` with `currencyDisplay: "code"` renders it the same as `220`. The en-NZ default `currencyDisplay` shows "$", which would hide the currency U5 requires. Tests match the code and amount with a regex that allows a no-break space (`/NZD\s*220/`).
- Exact copy (labels, button text, progress text, validation message, fixture label, breakfast wording, summary wording) comes from the ui-designer's section 8. The tester takes the strings from there, using case-insensitive regexes.
- Exact dependency pins (`npm install --save-exact`), as T1 did for Python, (owner approved, 2026-11-03). The Node version is recorded in the README (T4).

**Builds on (completed task docs):** [T1](T1-api-recommendations.md) (contract behaviour, fixture wording, CORS origins).

**New packages and owner approval:** named in the brief, except the Vite React plugin named in the web-testing skill and `@testing-library/dom`. `@testing-library/react` 16 and later declares `@testing-library/dom` as a peer dependency that must be installed explicitly. All approved by the owner on 2026-11-03 with exact pins.
| Package | Why | Approved by owner |
|---|---|---|
| next, react, react-dom, tailwindcss, typescript, eslint | Stack from create-next-app (plus the types, PostCSS and ESLint config packages it installs) | Yes, exact pins (2026-11-03) |
| vitest, jsdom, @vitejs/plugin-react | Test runner, DOM environment, JSX transform for Vitest (web-testing skill config) | Yes, exact pins (2026-11-03) |
| @testing-library/react, @testing-library/user-event, @testing-library/jest-dom | Component tests and matchers | Yes, exact pins (2026-11-03) |
| @testing-library/dom | Required peer dependency of @testing-library/react 16+ | Yes, exact pins (2026-11-03) |
| lucide-react | Icons for the visual direction (search, hotel, coffee, check), decorative with `aria-hidden` | Yes, exact pins (2026-11-03) |
| framer-motion | Entrance animations for cards and the selection summary; respects reduced motion (`MotionConfig reducedMotion="user"`) | Yes, exact pins (2026-11-03) |

Not used: component kits such as shadcn/ui or Radix, because U2 and U6 rely on native `<select>` and `<input type="radio">` (owner chose icons and animation only, 2026-11-03). Not needed: msw (the mock boundary is `vi.stubGlobal("fetch")`), vite-tsconfig-paths (the alias is set in `vitest.config.ts`), dotenv (Next.js loads env files itself), any state or data-fetching library.

## 6. Clarifications
**Open**
| Question | Asked by | Why it matters |
|---|---|---|

**Resolved**
| Question | Owner's answer | Date |
|---|---|---|
| Should the message input set `maxLength={1000}`? U11 only guards empty input, and a longer message would return a 422 that no UI state handles. | Yes | 2026-11-03 |
| (planner 1) How does the web reach the API? | `NEXT_PUBLIC_API_BASE_URL`, falling back to `http://localhost:8000` | 2026-11-03 |
| (planner 2) Default for the scenario control? | `success` preselected | 2026-11-03 |
| (planner 3) Block whitespace-only messages; send as typed? | Block when `trim()` is empty; send the text untrimmed (asked again with examples first) | 2026-11-03 |
| (planner 4) Behaviour on non-200 or network failure before T3? | Client throws; page always leaves loading and shows nothing; untested until T3 (asked again with examples first) | 2026-11-03 |
| (planner 5) Approve the dependency table? | Approved as listed, exact pins (`--save-exact`) | 2026-11-03 |
| (ui-designer 1) Which UI option? | Option B, search bar with side summary | 2026-11-03 |
| (ui-designer 2) Focus after a successful response? | Move focus to the "Recommended hotels" heading in T2, with one extra test under U5 | 2026-11-03 |
| (ui-designer 3) Approve the section 8 copy? | Approved as written | 2026-11-03 |
| (owner, unprompted) Visual style? | "UI should look good and fancy": polished visual direction recorded in section 8 | 2026-11-03 |
| Which UI libraries (owner allowed "appropriate ui libraries if required")? | lucide-react + framer-motion; native form controls kept | 2026-11-03 |

## 7. Decisions & deviations
Includes overrides and gate waivers.
| Agent proposed | Owner chose | Why | Impact |
|---|---|---|---|
| Set `maxLength={1000}` on the message input | Yes | Matches DEC-3, so the UI cannot send a message the API rejects for length | The planner adds it to U11's criteria, with a test; browsers cut pasted text at the limit |
| Option A, single column (ui-designer recommendation) | Option B, search bar with side summary | Owner preference: compact form; summary stays in view beside the cards on desktop | Two layouts (grid on desktop, stacked at 375px) to build and check at G3 and in T3 U9; scenario is a `<select>` (U2 tests use `getByLabelText`, `toHaveValue`, `user.selectOptions`); message is a single-line input (Enter submits) |
| Move focus to the results heading after a response | Yes, in T2 | Keyboard users keep their place when the disabled submit button drops focus | One extra U5 test; heading gets `tabIndex={-1}` |
| `@vitejs/plugin-react` latest (6.2.1) (tester found it needs vite 8) | Accept 5.2.0 | On Node v23.1.0 npm installs vitest 3.2.7 (vite 7); plugin-react 6 broke `tsc` with a vite 8 plugin type | Same approved package, earlier version; one vite 7.3.7 after `npm dedupe` |
| Leave create-next-app caret ranges (tester) | Pin to installed versions | Owner approved exact pins | Main session pinned @tailwindcss/turbopack 4.3.4, @types/node 20.19.43, @types/react 19.3.0, @types/react-dom 19.3.0, eslint 9.39.5, tailwindcss 4.3.4, typescript 5.9.3 |
| Fix npm audit findings (needs vitest 4+, excludes Node 23.1) | Accept, record as risk | Dev and test tooling only, not shipped | Listed in section 16; revisit if Node is upgraded |
| Focus the "Recommended hotels" heading after a response (G1 plan) | Focus the whole results section instead (G3 browser review) | Owner: "Once find hotels is clicked, focus should go on the recommended hotels part"; the heading focus was invisible after a mouse click | Behaviour change: tester updates the U5 focus test (owner approved editing the fingerprinted test), G2 fingerprint re-saved, implementer makes the results `<section>` focusable (`tabIndex={-1}`, labelled by the heading) with no visible outline (owner follow-up: "dont want the outline") |
| Keep unused create-next-app files and Google-fetched Geist font (implementer left them) | Delete unused files; use a system font stack | Leave no unused code; an offline fresh clone must build (G5) | Implementer removes `web/public` SVGs, the default `web/README.md` and the `next/font/google` import |
| Delete the regenerated `web/AGENTS.md` each time | Delete it and add `/AGENTS.md` to `web/.gitignore` | Next.js recreates it on every build and dev start; section 5 says not to keep it | `web/.gitignore` gains one ignore line; the repo-root `AGENTS.md` is unaffected |
| Plain functional styling (implied by section 8) | Polished, "good and fancy" visual design | Owner request | Tailwind plus lucide-react and framer-motion (owner-approved); checked at the G3 browser review, not by tests; must keep WCAG AA contrast and visible focus |

## 8. UI co-creation
**Options:**

Both options use the same semantics wherever U1–U6 and U11 require them, so most planned tests work with either option. The one test-relevant difference is the scenario control (radio group in A, `<select>` in B; see "Test impact" under each option).
- `<main>` holds one `<h1>`, a `<form>` (`noValidate`, so the U11 guard runs in React and not as the browser's `required` tooltip), one always-mounted status region, and a results `<section>`.
- Hotels are always a native radio group (`fieldset` + `legend`, one `<input type="radio" name="hotel">` per card), as U6 requires. A "Select" button per card with `aria-pressed` was considered and rejected, because U6's criteria name a radio group, and buttons would need custom single-select and arrow-key code.
- Each hotel radio's accessible name is the hotel name only: `<label htmlFor>` wraps just the name. The price, breakfast and explanation lines are linked with `aria-describedby`, so screen readers read them after the name. The whole card shows the checked state (`has-[:checked]:` border and background) and a `focus-within` ring, and clicking anywhere on the name selects it.
- The submit button keeps its text while loading (only `disabled` changes), so its accessible name is stable for tests.
- Room is left for T3: the empty message (U7) and the error message with Retry (U8) both render in the results `<section>` in place of the cards, under the same heading slot. Nothing for them is built in T2.

**Option A: "Single column conversation"** (recommended)
A narrow, centred single column at every width (`max-w-2xl mx-auto`). Multi-line `<textarea>` for the message, the scenario as a native radio group, hotel cards stacked in a list, and the summary directly under the cards.
```
Desktop (>= 768px), column centred, ~672px wide
+------------------------------------------------------------------+
| Hotel Assistant                                          (h1)    |
| Describe the stay you need and the assistant will suggest hotels.|
|                                                                  |
| What are you looking for?                                        |
| +--------------------------------------------------------------+ |
| | Find a Wellington hotel for two nights, up to NZD 250 per    | |
| | night; breakfast preferred.                                  | |
| |                                                              | |
| +--------------------------------------------------------------+ |
| Example: Find a Wellington hotel for two nights, up to NZD 250   |
| per night; breakfast preferred. Up to 1000 characters.           |
| [! Enter a message describing the hotel you need.]  (U11 only)   |
|                                                                  |
| Demo scenario (test control)                        (legend)     |
| (o) Success   ( ) Empty results   ( ) Service error              |
|                                                                  |
| [ Find hotels ]                                                  |
|                                                                  |
| [status] Finding hotels...               (only while loading)    |
|------------------------------------------------------------------|
| Recommended hotels                          [Demo data (fixture)]|
| Assistant: Here are three Wellington hotels for your stay.       |
|                                                                  |
| Choose a hotel                                      (legend)     |
| +--------------------------------------------------------------+ |
| | (o) Harbour House                         NZD 220 per night  | |
| |     Breakfast included                                       | |
| |     Within budget; breakfast included.                       | |
| +--------------------------------------------------------------+ |
| | ( ) City Garden                           NZD 245 per night  | |
| |     Breakfast included                                       | |
| |     Near the meeting district.                               | |
| +--------------------------------------------------------------+ |
| | ( ) Quay Rooms                            NZD 195 per night  | |
| |     Breakfast not included                                   | |
| |     Lower price; breakfast costs extra.                      | |
| +--------------------------------------------------------------+ |
|                                                                  |
| +-- Your selection --------------------------------------------+ |
| | You selected Harbour House: NZD 220 per night, breakfast     | |
| | included.                                                    | |
| | This is a demo. No booking has been made.                    | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+

375px
+-----------------------------------+
| Hotel Assistant                   |
| Describe the stay you need and    |
| the assistant will suggest hotels.|
|                                   |
| What are you looking for?         |
| +-------------------------------+ |
| | Find a Wellington hotel for   | |
| | two nights, up to NZD 250 ... | |
| +-------------------------------+ |
| Example: Find a Wellington hotel  |
| for two nights, up to NZD 250 per |
| night; breakfast preferred. Up to |
| 1000 characters.                  |
|                                   |
| Demo scenario (test control)      |
| (o) Success                       |
| ( ) Empty results                 |
| ( ) Service error                 |
|                                   |
| [         Find hotels           ] |
| [status] Finding hotels...        |
|-----------------------------------|
| Recommended hotels                |
| [Demo data (fixture)]             |
| Assistant: Here are three         |
| Wellington hotels for your stay.  |
|                                   |
| Choose a hotel                    |
| +-------------------------------+ |
| | (o) Harbour House             | |
| |     NZD 220 per night         | |
| |     Breakfast included        | |
| |     Within budget; breakfast  | |
| |     included.                 | |
| +-------------------------------+ |
| | ( ) City Garden               | |
| |     NZD 245 per night  ...    | |
| +-------------------------------+ |
| | ( ) Quay Rooms                | |
| |     NZD 195 per night  ...    | |
| +-------------------------------+ |
| +-- Your selection -------------+ |
| | You selected Harbour House:   | |
| | NZD 220 per night, breakfast  | |
| | included.                     | |
| | This is a demo. No booking    | |
| | has been made.                | |
| +-------------------------------+ |
+-----------------------------------+
```
Components: `Page` (`app/page.tsx`, renders `HotelAssistant`), `HotelAssistant` (client; owns request, loading, response and selection state), `RequestForm` (textarea, helper text, validation message, scenario radio group, submit), `StatusRegion` (always-mounted `role="status"`), `Results` (heading, fixture badge, assistant message, hotel radio group), `HotelCard` (one radio and its details), `SelectionSummary`. Helpers: `fetchRecommendations` (`lib/recommendations.ts`), `formatPrice`.
Trade-offs:
- For: one reading order at every width, so the 375px layout needs no rearranging (less T3 U9 risk). The textarea fits a full sentence like the brief's example. Scenario radios show all three choices at once, so the demo control is obvious. The summary sits right under the cards, so it is near the last radio the traveller touched.
- Against: on desktop the page is long and the summary is below the third card, so it can need a scroll on short screens. The scenario radios take three rows at 375px. In a textarea, Enter adds a new line and does not submit, so keyboard users Tab to "Find hotels".
- Test impact: the scenario control is found with `getByRole("group", { name: /demo scenario/i })` and its choices with `within(group).getByRole("radio", { name: /success/i })`. Because the page then has two radio groups, hotel-radio queries must be scoped with `within(getByRole("group", { name: /choose a hotel/i }))`. `getByLabelText` still finds each scenario radio by its option label.

**Option B: "Search bar with side summary"**
A compact search bar: single-line `<input type="text">`, scenario as a native `<select>`, and the button on one row on desktop. Results sit in a two-column grid on desktop: cards on the left (2/3) and the selection summary in a sticky panel on the right (1/3), shown only after a selection. At 375px everything stacks into one column.
```
Desktop (>= 768px), max ~1024px wide
+------------------------------------------------------------------------------+
| Hotel Assistant                                                       (h1)   |
| Describe the stay you need and the assistant will suggest hotels.            |
|                                                                              |
| What are you looking for?                                                    |
| [ Find a Wellington hotel for two nights, up to NZD 250 per night; br... ]   |
| Example: ... Up to 1000 characters.                                          |
| [! Enter a message describing the hotel you need.]            (U11 only)     |
| Demo scenario (test control) [ Success          v]   [ Find hotels ]         |
| [status] Finding hotels...                            (only while loading)   |
|------------------------------------------------------------------------------|
| Recommended hotels                                     [Demo data (fixture)] |
| Assistant: Here are three Wellington hotels for your stay.                   |
|                                                                              |
| Choose a hotel                                  |                            |
| +---------------------------------------------+ | +-- Your selection ------+ |
| | (o) Harbour House          NZD 220 per night| | | You selected Harbour   | |
| |     Breakfast included                      | | | House: NZD 220 per     | |
| |     Within budget; breakfast included.      | | | night, breakfast       | |
| +---------------------------------------------+ | | included.              | |
| | ( ) City Garden            NZD 245 per night| | | This is a demo. No     | |
| |     Breakfast included                      | | | booking has been made. | |
| |     Near the meeting district.              | | +------------------------+ |
| +---------------------------------------------+ |   (sticky; appears only    |
| | ( ) Quay Rooms             NZD 195 per night| |    after a selection)      |
| |     Breakfast not included                  | |                            |
| |     Lower price; breakfast costs extra.     | |                            |
| +---------------------------------------------+ |                            |
+------------------------------------------------------------------------------+

375px
+-----------------------------------+
| Hotel Assistant                   |
| Describe the stay you need and    |
| the assistant will suggest hotels.|
|                                   |
| What are you looking for?         |
| [ Find a Wellington hotel fo... ] |
| Example: ... Up to 1000           |
| characters.                       |
|                                   |
| Demo scenario (test control)      |
| [ Success                     v ] |
| [         Find hotels           ] |
| [status] Finding hotels...        |
|-----------------------------------|
| Recommended hotels                |
| [Demo data (fixture)]             |
| Assistant: Here are three         |
| Wellington hotels for your stay.  |
|                                   |
| Choose a hotel                    |
| +-------------------------------+ |
| | (o) Harbour House             | |
| |     NZD 220 per night         | |
| |     Breakfast included        | |
| |     Within budget; ...        | |
| +-------------------------------+ |
| | ( ) City Garden    ...        | |
| +-------------------------------+ |
| | ( ) Quay Rooms     ...        | |
| +-------------------------------+ |
| +-- Your selection -------------+ |
| | You selected Harbour House:   | |
| | NZD 220 per night, breakfast  | |
| | included. ...                 | |
| +-------------------------------+ |
+-----------------------------------+
```
Components: the same as Option A, except `RequestForm` uses an `<input>` and a `<select>`, and `Results` adds a responsive grid wrapper (`md:grid md:grid-cols-3`, cards `md:col-span-2`, summary `md:sticky md:top-4`).
Trade-offs:
- For: compact form; on desktop the summary stays in view beside the cards while the traveller compares them. Enter in the single-line input submits the form natively. The `<select>` takes one row at 375px.
- Against: two layouts (one column vs grid) mean more Tailwind and more for the owner to check at G3 and in T3 U9. A single-line input hides most of a long message (it scrolls sideways inside the field). The `<select>` hides the other two scenarios until it is opened, so the demo control is less obvious. On desktop the reading order (cards, then summary on the right) differs from the visual order at 375px. The sticky panel needs care so the T3 empty and error states do not leave an empty right column.
- Test impact: the scenario control is found with `getByLabelText(/demo scenario/i)` (a `combobox`), checked with `toHaveValue("success")`, and changed with `user.selectOptions`. Only one radio group exists on the page, so hotel radios need no extra scoping.

**Recommendation:** Option A. It has one layout at every width (lower risk for T3's 375px and keyboard work), shows the full message and all three demo scenarios, and keeps the summary next to the cards in the same reading order. Option B's sticky summary helps only on wide screens.

**Choice and why:** Option B, "Search bar with side summary" (owner, 2026-11-03), chosen over the ui-designer's recommendation of A. The owner prefers the compact form and the summary staying in view beside the cards on desktop. Accepted costs: two layouts to check at G3 and in T3 U9, a single-line message field, and a `<select>` that hides two scenarios until opened. The textarea, scenario radio group and Option A tab order in this section do not apply. Copy approved as written; focus moves to the results heading after a response.

**Visual direction (owner: "UI should look good and fancy"):** Tailwind utilities, plus `lucide-react` icons (always `aria-hidden="true"`, never the only carrier of meaning) and `framer-motion` for entrance animations (cards fade and rise in with a short stagger; the selection summary slides in). The app is wrapped in `MotionConfig reducedMotion="user"`. Animations must never delay the DOM: cards and summary are in the DOM as soon as state changes, so tests do not wait on animation. A soft gradient page background (for example sky to indigo tints) with the search bar in a raised white card (`rounded-2xl`, `shadow-lg`, generous padding). A distinct accent colour for "Find hotels" with hover and active states. Hotel cards as rounded, shadowed cards with a hover lift (`transition`, `hover:shadow-md`), a clear checked style (accent border and tinted background via `has-[:checked]:`), the price as a prominent figure, and breakfast as a pill badge with text (never colour alone). "Demo data (fixture)" as a subtle pill badge. The "Your selection" panel as an accent-tinted card. A small animated spinner beside "Finding hotels..." (`aria-hidden`, `motion-safe:animate-spin`). Constraints: WCAG AA text contrast, visible focus rings on every control, motion only under `motion-safe`, nothing that breaks 375px. Judged by the owner at the G3 browser review; tests stay on semantics and copy only.

**Copy:**
Tests match these strings with case-insensitive regexes. The same copy applies to both options unless marked.
| Element | Exact copy | Notes |
|---|---|---|
| Page heading (`h1`) | Hotel Assistant | |
| Intro text | Describe the stay you need and the assistant will suggest hotels. | Plain paragraph under the `h1` |
| Message label | What are you looking for? | Visible `<label htmlFor>` on the textarea (A) or input (B) |
| Message helper text | Example: Find a Wellington hotel for two nights, up to NZD 250 per night; breakfast preferred. Up to 1000 characters. | Always visible; always in the field's `aria-describedby`. No placeholder is used as a label |
| Validation message (U11) | Enter a message describing the hotel you need. | Shown under the helper text with `role="alert"`; its id is added to the field's `aria-describedby` and the field gets `aria-invalid="true"` |
| Scenario label | Demo scenario (test control) | `legend` of the radio group (A) or `<label>` of the select (B) |
| Scenario option labels | Success / Empty results / Service error | Values `success` / `empty` / `error`; Success preselected (question 2) |
| Submit button | Find hotels | Text does not change while loading |
| Progress text (U3) | Finding hotels... | Three ASCII full stops. In the status region only while loading; a spinner beside it is decorative (`aria-hidden="true"`). Tests match `/finding hotels/i` |
| Results heading (`h2`) | Recommended hotels | Gets `tabIndex={-1}` for the focus move (question 2) |
| Fixture label (U5) | Demo data (fixture) | Visible badge next to the results heading, shown when `source` is `"fixture"` |
| Assistant message prefix | Assistant: | Visible prefix, then the response `message` verbatim in its own element (for example "Here are three Wellington hotels for your stay.") |
| Hotel group legend (U6) | Choose a hotel | `legend` of the hotel `fieldset` |
| Hotel radio label | `{name}` | Exactly the hotel name, for example "Harbour House" |
| Price line | `{price} per night` | `{price}` = `new Intl.NumberFormat("en-NZ", { style: "currency", currency, currencyDisplay: "code", minimumFractionDigits: 0 }).format(nightlyPrice)`, for example "NZD 220 per night" (may contain a no-break space after "NZD"; tests use `/NZD\s*220/`). `minimumFractionDigits: 0` keeps "220" rather than "220.00", also for `220.0` |
| Breakfast line (U5) | Breakfast included / Breakfast not included | Text, never colour or icon alone. Note "Breakfast included" is not a substring of "Breakfast not included", so `/breakfast included/i` and `/breakfast not included/i` are distinct |
| Explanation | `{explanation}` | Verbatim from the response |
| Summary heading (`h2`) | Your selection | Shown only after a selection |
| Summary sentence (U6) | You selected {name}: {price} per night, breakfast {included \| not included}. | Examples: "You selected Harbour House: NZD 220 per night, breakfast included." / "You selected Quay Rooms: NZD 195 per night, breakfast not included." |
| Summary note | This is a demo. No booking has been made. | Under the summary sentence; makes clear booking is out of scope |
| Empty and error copy | (none in T2) | T3 writes it (U7, U8) |

**States:**
| State | Trigger | What shows | Focus | Status region |
|---|---|---|---|---|
| Idle | Page load | Heading, intro, empty message field with helper text, scenario with Success selected, "Find hotels" enabled. No results section content, no summary | Browser default (top of page) | Mounted, empty |
| Validation error (U11) | Submit with an empty or whitespace-only message | "Enter a message describing the hotel you need." under the field (`role="alert"`); field `aria-invalid="true"` with the message id in `aria-describedby`; red border plus the text (never colour alone). No request sent. Any previous results stay as they were | Message field | Unchanged (empty) |
| Validation cleared | Submit again with a non-blank message | The message and `aria-invalid` are removed, then the Loading state starts | As in Loading | As in Loading |
| Loading (U3) | Valid submit | "Find hotels" `disabled` (visually dimmed, text unchanged); previous results, selection and summary cleared (U6 planner default); form fields stay editable | Stays where it was; see question 2 for what happens when the disabled button had focus | "Finding hotels..." |
| Results (U4, U5) | 200 response with hotels | "Recommended hotels" heading, "Demo data (fixture)" badge, "Assistant: {message}", "Choose a hotel" group with three cards in response order, none checked, no summary. "Find hotels" enabled again | Results heading (question 2 recommendation) | Emptied |
| Selected (U6) | Traveller checks a hotel radio (click, Space or arrow keys) | That card shows the checked style; "Your selection" summary appears under the cards (A) or in the side panel on desktop (B). Choosing another hotel replaces the summary | Stays on the radio (no focus move, so arrow keys keep working) | Unchanged; the radio's own checked announcement is enough |
| New request from Results or Selected | Valid submit | Same as Loading: results, selection and summary cleared until the new response | As in Loading | "Finding hotels..." |
| Empty (U7) | 200 with `hotels: []` | T3. In T2 the request is sent (U2) but no empty copy is designed or tested | T3 | T3 |
| Failure (U8) | 503 or network error | T3. In T2 the page only leaves the loading state (question 4 in section 6) | T3 | T3 |

**Keyboard map:**
Tab order (Option A): message textarea → scenario radio group (one tab stop on the checked radio) → "Find hotels" → (after results) hotel radio group (one tab stop: the checked radio, or the first radio when none is checked). The results heading and summary are not tab stops (the heading has `tabIndex={-1}`, so it takes focus only from script).
Tab order (Option B): message input → scenario select → "Find hotels" → (after results) hotel radio group, as above.
| Control | Keys | Result |
|---|---|---|
| Message textarea (A) | Typing; Enter | Enter inserts a new line; it does not submit. No extra shortcut is added |
| Message input (B) | Typing; Enter | Enter submits the form (native), with the same U11 guard |
| Scenario radios (A) | Arrow Up/Left, Arrow Down/Right; Space | Arrows move and select among Success, Empty results, Service error (native); Space selects the focused radio |
| Scenario select (B) | Arrow Up/Down; Alt+Arrow Down or Space to open; Enter to choose | Native select behaviour |
| "Find hotels" button | Enter or Space | Submits; while `disabled` it ignores input and is skipped by Tab |
| Hotel radios (U6) | Arrow Up/Left, Arrow Down/Right; Space | Arrows move focus and select the next or previous hotel, and the summary updates each time (native); Space selects the focused hotel when none is checked yet. Tab leaves the group |
| Summary | (none) | Static text; read in normal order after the hotel group |
Focus after submit: an invalid submit puts focus on the message field (U11). After a successful response, focus moves to the "Recommended hotels" heading (recommended, question 2), so the next Tab reaches the hotel radios. After a selection, focus stays on the selected radio. Visible focus rings (`focus-visible:ring-2 focus-visible:ring-offset-2`) on every control and a `focus-within` ring on each hotel card are built in T2, but they are verified by the owner at G3 and hardened in T3 (U10), since jsdom cannot show them.

**Browser-review changes:**
- G3 review 1 (owner, 2026-11-03, http://localhost:3000 with the real API): focus after Find hotels should go to the whole "Recommended hotels" section, not just the heading (behaviour change, back to tester). Cleanup: delete unused scaffold files; system font stack.
- Owner follow-up (2026-11-03): no visible outline or ring on the focused results section; focus still moves there and scrolls it into view.
- Re-check (owner, 2026-11-03): "fine". Asked about the service error showing nothing; accepted as planned (G1 answer), T3 U8 adds the message and Retry. G3 approved.
- `web/AGENTS.md` was regenerated by Next.js during the dev session; deleted again (section 5).

## 9. Contract impact
None. `openapi.yaml` stays unchanged, and the web uses it as it is:
- Request: `POST /recommendations` with `{message, scenario}`. Both are always sent. `scenario` is always one of the three enum values and the client never relies on an API default (DEC-1). `maxLength={1000}` and the whitespace guard keep the UI inside `minLength`, `maxLength` and `pattern` (DEC-3), so T2's UI never triggers a 422.
- Response: the web's TypeScript types mirror `RecommendationResponse` and `Hotel` field for field (`id, name, nightlyPrice, currency, breakfastIncluded, explanation`; `source: "fixture"`). Test bodies are copied from the `openapi.yaml` examples.
- 503 (`ServiceUnavailable`) and the empty `hotels` array are consumed in T3, not T2.
- How the web reaches the API: the base URL comes from `NEXT_PUBLIC_API_BASE_URL` (already in the root `.env.example`), falling back to `http://localhost:8000`, the contract's `servers` URL (question 1). CORS for `http://localhost:3000` and `http://127.0.0.1:3000` already exists from T1 (A10), so T2 needs no `api/` change. A browser cross-origin request has not been verified yet (T1 risks), and the owner's G3 browser review against the real API is its first check (manual row in section 10).

## 10. Test plan
Type: unit | contract | e2e | inspection | manual. Inspection and manual rows are for what a test cannot cover; they name the check and are not part of G2.

Mock boundary unless stated: global `fetch` stubbed with `vi.stubGlobal` through the helpers in `web/test/mockFetch.ts` (`mockFetchSuccess(body?)`, `mockFetchEmpty`, `mockFetchPending`), as in the web-testing skill. Real components, hooks and API client. `vi.stubEnv` only where stated. jsdom via `web/vitest.config.ts` and `web/vitest.setup.ts`. Page tests render the default export of `web/app/page.tsx`. Copy in assertions comes from section 8, matched with case-insensitive regexes. Each test name starts with its ID.
| Test or check (with ID) | Type | File | Mock boundary |
|---|---|---|---|
| U1: renders a labelled message field and a submit button | unit | web/app/page.test.tsx | none needed (no submit); fetch stubbed defensively |
| U1: pressing Enter in the message input submits the form (Option B) | unit | web/app/page.test.tsx | fetch (`mockFetchSuccess`); call count asserted |
| U1: submit sends one POST to /recommendations with a JSON body of message and scenario (asserts method, `Content-Type`, URL ends with `/recommendations`, body exactly `{message, scenario}`, message untrimmed) | unit | web/app/page.test.tsx | fetch (`mockFetchSuccess`); call args inspected |
| U1: fetchRecommendations posts to NEXT_PUBLIC_API_BASE_URL + /recommendations | unit | web/lib/recommendations.test.ts | fetch (`mockFetchSuccess`) + `vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://api.test")` |
| U1: fetchRecommendations falls back to http://localhost:8000 when the env var is unset | unit | web/lib/recommendations.test.ts | fetch + `vi.stubEnv(..., undefined)` or deleted var |
| U1: fetchRecommendations returns the parsed success body | unit | web/lib/recommendations.test.ts | fetch (`mockFetchSuccess`) |
| U2: renders a labelled scenario select with success, empty and error options (`getByLabelText(/demo scenario/i)`, role `combobox`) | unit | web/app/page.test.tsx | none needed; fetch stubbed defensively |
| U2: success is selected by default (`toHaveValue("success")`) | unit | web/app/page.test.tsx | none needed |
| U2: sends the chosen scenario in the request body [empty, error] (`user.selectOptions`; asserts the body only, not the result state) | unit | web/app/page.test.tsx | fetch (`mockFetchEmpty` for empty; `mockFetchPending` for error so no 503 handling is exercised) |
| U3: status region is mounted and empty before any submit | unit | web/app/page.test.tsx | none needed |
| U3: while the request is pending, submit is disabled and the status region shows progress | unit | web/app/page.test.tsx | fetch (`mockFetchPending`, not resolved before the asserts) |
| U3: a second click while pending sends no second request | unit | web/app/page.test.tsx | fetch (`mockFetchPending`); call count asserted |
| U3: after the response, submit is enabled again and the progress text is gone | unit | web/app/page.test.tsx | fetch (`mockFetchPending`, then `resolve()`) |
| U4: shows the assistant message from the response | unit | web/app/page.test.tsx | fetch (`mockFetchSuccess`) |
| U4: shows whatever message the response carries (custom message string) | unit | web/app/page.test.tsx | fetch (`mockFetchSuccess({...SUCCESS_BODY, message: "<custom>"})`) |
| U5: renders three hotel cards in response order | unit | web/app/page.test.tsx | fetch (`mockFetchSuccess`) |
| U5: each card shows name, nightly price with currency code, breakfast text and explanation [h1, h2, h3] (`within(card)`; `/NZD\s*220/`; included vs not included) | unit | web/app/page.test.tsx | fetch (`mockFetchSuccess`) |
| U5: shows the fixture label on the results | unit | web/app/page.test.tsx | fetch (`mockFetchSuccess`) |
| U5: focus moves to the "Recommended hotels" section when results arrive (owner decision; section changed from heading at the G3 browser review) | unit | web/app/page.test.tsx | fetch (`mockFetchSuccess`) |
| U6: hotels are a radio group with none selected and no summary | unit | web/app/page.test.tsx | fetch (`mockFetchSuccess`) |
| U6: selecting a hotel shows a summary with its name, price and breakfast | unit | web/app/page.test.tsx | fetch (`mockFetchSuccess`) |
| U6: selecting another hotel keeps exactly one selected and updates the summary | unit | web/app/page.test.tsx | fetch (`mockFetchSuccess`) |
| U6: a new submit clears the previous results, selection and summary | unit | web/app/page.test.tsx | fetch: `vi.fn()` with `mockResolvedValueOnce(success)` then a pending promise (a `Response` body is read once) |
| U11: an empty submit sends no request and shows an accessible validation message (`aria-invalid`, `aria-describedby`, focus on the field) | unit | web/app/page.test.tsx | fetch stubbed; asserted not called |
| U11: a whitespace-only submit sends no request [spaces, tabs] | unit | web/app/page.test.tsx | fetch stubbed; asserted not called |
| U11: the validation message clears and the request is sent after a valid message | unit | web/app/page.test.tsx | fetch (`mockFetchSuccess`) |
| U11: the message field has maxLength 1000 (DEC-3, owner decision) | unit | web/app/page.test.tsx | none needed |
| U11: pasting 1001 characters keeps 1000 and sends a 1000-character message (`user.paste`) | unit | web/app/page.test.tsx | fetch (`mockFetchSuccess`); body length asserted |
| Q1 suite check: `npm test`, `npm run lint`, `npx tsc --noEmit` from `web/` all pass; every test name starts with an ID; only `fetch` (and `vi.stubEnv`) is mocked; no snapshots | inspection (run at G3) | web/**/*.test.ts(x), web/test/mockFetch.ts | none |
| Q8 comment standard: gate-check greps (TODO without ID, `console.log` or `console.debug`, commented-out code, missing headers) plus reviewer inspection of TSDoc on exports, ID references and arrange or mock comments in tests | inspection | web/**/*.ts, web/**/*.tsx (excluding `next-env.d.ts` and unmodified scaffold) | none |
| Visual direction check: the page matches section 8's visual direction at 375px and desktop (owner request) | manual (owner, at G3 browser review) | recorded in section 8 "Browser-review changes" | none (real API) |
| U1–U6 real-API check: with uvicorn on :8000 and `npm run dev` on :3000, submit the brief's example with the success scenario and select a hotel (proves the base URL, CORS from a real browser, and card and summary rendering, which mocked tests cannot) | manual (owner, at G3 browser review, 375px and desktop) | recorded in the task doc's section 8 "Browser-review changes" and section 11 | none (real API) |

## 11. Test results log
Append only.
| Run # | Phase | Command | Passed | Failed | Failing tests + reason | Date |
|---|---|---|---|---|---|---|
| 1 | red (tester) | `npm test` (from `web/`, vitest 3.2.7) | 0 | 29 tests + 1 file | `app/page.test.tsx`: all 29 cases (25 plan rows, parametrised rows expanded: U2 scenario x2, U5 card x3, U11 whitespace x2) fail because the scaffold page lacks the journey: 19 on "Unable to find a label with the text of: /what are you looking for/i", 3 on the label /demo scenario/i, 2 (U11 empty submits) on no button named /find hotels/i, 1 (U3 idle) on "No role=status or aria-live=polite region found". `lib/recommendations.test.ts` (3 rows): the file fails to load on `Failed to resolve import "@/lib/recommendations"`, so its 3 tests are reported as a failed file and not counted as tests. All fail because the behaviour is missing, not because a test is broken. Also: `npm run lint` exit 0; `npx tsc --noEmit` exit 2 with one error only, TS2307 cannot find module `@/lib/recommendations` (expected). | 2026-11-03 |
| 2 | red (G2, main session, after pinning scaffold ranges) | `npm test`; `npm run lint`; `npx tsc --noEmit` (web/) | 0 | 29 (+1 file) | Same as run 1: missing UI labels/button/status region; `@/lib/recommendations` not found. Lint 0; tsc only TS2307 | 2026-11-03 |
| 3 | green (implementer) | `npm test` (from `web/`, vitest 3.2.7) | 32 | 0 | None. 2 files: `app/page.test.tsx` 29, `lib/recommendations.test.ts` 3. No `act()` or React warnings in the output (only Node ExperimentalWarning about require of ESM) | 2026-11-03 |
| 4 | green (implementer) | `npm run lint`; `npx tsc --noEmit`; `npm run build` (web/) | all 3 | 0 | Lint exit 0; tsc exit 0; `next build` exit 0 (Next 16.4.4, routes `/` and `/_not-found` prerendered static). Test-file fingerprint check `sha256sum -c docs/gates/T2-G2.sha256`: 5/5 OK. Comment greps: no `console.log`/`console.debug`, no TODO without a task ID | 2026-11-03 |
| 5 | red (tester, G3 browser-review loop: U5 focus to results section, owner-approved test edit) | `npm test`; `npm run lint`; `npx tsc --noEmit` (web/) | 31 | 1 | `app/page.test.tsx` > "U5: focus moves to the Recommended hotels section when results arrive": the region named "Recommended hotels" is found (the existing `<section aria-labelledby="results-heading">`), but `toHaveFocus()` fails because focus is still on the heading. Right reason: behaviour not yet changed. All other 31 pass. Lint exit 0; tsc exit 0. Fingerprint check: only `web/app/page.test.tsx` differs (4/5 OK), as approved | 2026-11-03 |
| 6 | green (implementer, G3 browser-review loop: U5 focus to results section, scaffold cleanup, system fonts) | `npm test`; `npm run lint`; `npx tsc --noEmit`; `npm run build` (web/) | 32 | 0 | None. Both files pass (`app/page.test.tsx` 29, `lib/recommendations.test.ts` 3), including "U5: focus moves to the Recommended hotels section when results arrive"; only Node ExperimentalWarning in the output, no `act()` warnings. Lint exit 0; tsc exit 0; `next build` exit 0 (routes `/` and `/_not-found` static) with no Google font fetch. Fingerprint check `sha256sum -c docs/gates/T2-G2.sha256` (re-saved file): 5/5 OK. Comment greps: no `console.log`/`console.debug`, no TODO without a task ID. Rerun after the owner removed the section focus ring: same results | 2026-11-03 |
| 7 | green (implementer, review-fix loop: findings 3-6 from `docs/reviews/T2-review.md`) | `npm test`; `npm run lint`; `npx tsc --noEmit`; `npm run build` (web/); `sha256sum -c --quiet docs/gates/T2-G2.sha256` (root) | 32 | 0 | None. Tests 32/32 (2 files); lint exit 0; tsc exit 0; `next build` exit 0 (routes `/` and `/_not-found` static; ran alongside the dev server on :3000 with no conflict); fingerprint check exit 0 (all OK). Changes are non-behavioural: motion-safe hover/active transforms, comment wording, unused CSS tokens removed, next.config header | 2026-11-03 |

## 12. Implementation notes
**Files:**
- `web/lib/recommendations.ts` (new): `Scenario`, `RecommendationRequest`, `Hotel`, `RecommendationResponse` types mirroring `openapi.yaml`; `fetchRecommendations(request)`.
- `web/lib/formatPrice.ts` (new): `formatPrice(amount, currency)` with `Intl.NumberFormat("en-NZ", { style: "currency", currencyDisplay: "code", minimumFractionDigits: 0 })`.
- `web/components/HotelAssistant.tsx` (new, client): owns `loading`, `response`, `selectedId`; submit handler; `focusResults` moves focus to the results section and scrolls it into view (G3 loop); `MotionConfig reducedMotion="user"`; search card wrapper.
- `web/components/RequestForm.tsx` (new, client): message input (`maxLength` 1000), helper text, U11 validation alert, scenario `<select>`, "Find hotels" button.
- `web/components/StatusRegion.tsx` (new): always-mounted `role="status"` with spinner and "Finding hotels...".
- `web/components/Results.tsx` (new, client): `<section aria-labelledby="results-heading">` with `tabIndex={-1}`, the focus ref and `focus:outline-none` (G3 loop; the heading is plain again), heading, fixture badge, assistant message, `fieldset` radio group, `md:grid-cols-3` grid with sticky `aside` summary.
- `web/components/HotelCard.tsx` (new, client): one `motion.li` card with radio, label (hotel name only), price, breakfast pill, explanation.
- `web/components/SelectionSummary.tsx` (new, client): "Your selection" accent panel with the summary sentence and demo note.
- `web/app/page.tsx` (scaffold replaced): synchronous server component with `<main>`, `h1`, intro and `HotelAssistant`.
- `web/app/layout.tsx` (scaffold hand-edited): header comment, TSDoc, metadata title "Hotel Assistant" and description; `next/font/google` Geist import and font variables removed (G3 loop).
- `web/app/globals.css` (scaffold hand-edited): header comment, dark-mode override removed (light-only design); `--font-sans`/`--font-mono` are system font stacks (G3 loop).
- Deleted (G3 loop): `web/public/next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg` (grep found no references), the now-empty `web/public/` folder, and the default `web/README.md`.

**Key choices:**
- `fetchRecommendations` reads `process.env.NEXT_PUBLIC_API_BASE_URL` per call with `||` (an empty string also falls back to `http://localhost:8000`) and strips trailing slashes. It builds the body explicitly as `{message, scenario}` and throws on non-2xx. The page catches with a `TODO(T3)` comment (U8) and always clears loading in `finally`.
- Form state (message, scenario, invalid) lives in `RequestForm`; journey state lives in `HotelAssistant`. `RequestForm` also ignores a submit while `loading`, so implicit submission by pressing Enter cannot send a second request (U3).
- The page `h1` and intro are rendered by the server component `page.tsx`, so only the interactive part is client JS.
- The summary renders without `AnimatePresence`: it is keyed by hotel id and has no exit animation, so the previous summary leaves the DOM immediately (U6 tests check that), while the entrance animation still runs.
- Each card's label wraps only the hotel name (accessible name = name). An `after:absolute after:inset-0` overlay on the label makes the whole card clickable. Price, breakfast and explanation are linked with `aria-describedby`.
- Price and summary text are each kept in one element, because `getByText` matches an element's own text nodes. The price line is therefore styled as one bold accent line, not split into a big figure and a small "per night".
- When `hotels` is empty (T2 does not design this), the heading and assistant message show but no fieldset; a `TODO(T3)` marks the U7 empty state.
- Contrast: body text slate-700/800 on white; accent indigo-600/700; pills emerald-800 on emerald-50, amber-900 on amber-50, violet-800 on violet-100; white on an indigo-600 to violet-700 summary gradient. Owner to confirm at the G3 browser review.
- No extra jsdom stubs were needed for framer-motion; `vitest.setup.ts` is unchanged.
- U5 (G3 loop): focus goes to the whole results `<section>` (role region, named by its heading), not the heading. No visible outline on the results section at owner's request; it is a script-focus target only, not a tab stop (`focus:outline-none`, no ring classes).
- U5 scroll: `focusResults` calls `focus({ preventScroll: true })`, then `scrollIntoView({ block: "start" })` with `behavior: "smooth"` unless `prefers-reduced-motion: reduce` matches (then `"auto"`). Both `matchMedia` and `scrollIntoView` are optional-chained because jsdom lacks them; `scroll-mt-4` leaves a small gap above the section.
- System font stack (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, ...`) replaces Geist, so `next build` needs no network (an offline fresh clone builds, G5).
- Review-fix loop (findings 3-6): the card hover lift and the button press scale are gated with `motion-safe:` so reduced-motion users get no transform (colour and shadow changes stay); the base-URL comment now says it is read per call so tests can stub it and that Next.js inlines it at build time; unused `--color-background`, `--color-foreground` and `--font-mono` theme tokens removed from `globals.css` (grep found no users); `next.config.ts` has a header comment, config unchanged.

## 13. Review findings
Review link and verdict summary: [T2-review](../../reviews/T2-review.md). No blockers. 1 should (#1 register, statuses and time: fixed at G4 Part A) and 6 nits: #2 accepted (no outline on the results section, owner's choice; T3/T4 manual check worded to match), #3–#6 fixed by the implementer (motion-safe gating, env comment, unused CSS tokens, next.config.ts header; run 7 green), #7 fixed (G3 line number).

## 14. Gate results
| Gate | Pass/Fail | Report | Date |
|---|---|---|---|
| G0 | Pass | [T2-G0](../../gates/T2-G0.md) | 2026-11-03 |
| G1 | Pass | [T2-G1](../../gates/T2-G1.md) | 2026-11-03 |
| G2 | Pass (fingerprint re-saved after owner-approved U5 test edit) | [T2-G2](../../gates/T2-G2.md) | 2026-11-03 |
| G3 | Pass | [T2-G3](../../gates/T2-G3.md) | 2026-11-03 |
| G4 Part A | Pass | [T2-G4](../../gates/T2-G4.md) | 2026-11-03 |

## 15. Handoff log
| From → to | Summary | Approved by owner | Time |
|---|---|---|---|
| planner → main session | Sections 4, 5, 9 and 10 written: criteria for U1–U6, U11, Q1 and Q8; 26 planned Vitest tests in `web/app/page.test.tsx` and `web/lib/recommendations.test.ts`, plus 2 inspection rows and 1 manual row; 5 open questions; dependency table for owner approval. Next: ui-designer (section 8), then owner answers, then G1. | Answers recorded in sections 6 and 7 | 2026-11-03 |
| ui-designer → main session | Section 8 written: Option A (single column, textarea, scenario radio group, summary under cards; recommended) and Option B (search bar, scenario select, sticky side summary on desktop), each wireframed at desktop and 375px with components and trade-offs; exact copy table; states (idle, validation, loading, results, selected; empty and failure marked T3); keyboard map and focus rules. 3 owner questions (option choice, focus after response, copy approval). "Choice and why" and "Browser-review changes" left for the owner. Next: owner answers, then G1, then tester. | Owner chose Option B; focus move and copy approved; visual direction added | 2026-11-03 |
| main session → tester | Plan complete, G1 PASS. Next: `/task-test` (scaffold, install approved packages, 28 failing tests, G2). | Yes (owner: "yes") | 2026-11-03 |
| tester → main session | Scaffolded `web/` with create-next-app (Next 16.4.4, React 19.3.0) and deleted the nested `AGENTS.md`. Installed the approved packages with exact pins. `@vitejs/plugin-react` is pinned at 5.2.0 rather than 6.x: Node 23.1 led npm to choose vitest 3.2.7 (vite 7), and plugin-react 6 needs vite 8; `npm dedupe` left one vite 7.3.7. Added `vitest.config.ts`, `vitest.setup.ts`, `test/mockFetch.ts` and the `test` script. Wrote all 28 planned tests in `app/page.test.tsx` and `lib/recommendations.test.ts`. Red run 1: 29 page cases fail on missing copy and controls, and the client file fails on its unresolved import (right reason). Lint is clean; tsc fails only on the missing module. Scaffold caret ranges were left as generated (owner to decide). Next: G2, then implementer. | Pending | 2026-11-03 |
| main session → implementer | Red complete, G2 PASS (28 failing tests, fingerprint saved). Next: `/task-implement`. | Yes (owner: "yes") | 2026-11-03 |
| implementer → main session | Green: `lib/recommendations.ts`, `lib/formatPrice.ts`, six components in `web/components/`, page, layout and globals.css (Option B with the section 8 visual direction). `npm test` 32 passed / 0 failed; lint, tsc and `next build` exit 0; test files unchanged (G2 fingerprint 5/5 OK); no test, config, `openapi.yaml` or `api/` edits; no new packages. Next: owner browser review at 375px and desktop against the real API, then reviewer / G3. | Pending | 2026-11-03 |
| tester → main session | G3 browser-review loop: changed only the U5 focus test in `web/app/page.test.tsx` (owner-approved edit of a fingerprinted test) to assert focus on the "Recommended hotels" region, renamed to "...section when results arrive"; updated the U5 criteria (section 4) and the section 10 row. Run 5: 31 passed / 1 failed (that test, focus still on the heading); lint and tsc exit 0. G2 fingerprint now differs for `web/app/page.test.tsx` only; it needs re-saving after approval. Next: implementer. | Pending | 2026-11-03 |
| implementer → main session | G3 browser-review loop: results `<section>` now takes `tabIndex={-1}` and the focus ref, with no outline (owner change mid-loop: `focus:outline-none` only), and scrolls into view (smooth unless reduced motion); heading tabIndex and focus classes removed; U5 comments updated. Deleted 5 unreferenced `web/public` SVGs, the empty `public/` folder and `web/README.md`; replaced `next/font/google` Geist with a system font stack. Run 6: `npm test` 32 passed / 0 failed; lint, tsc and `next build` exit 0; fingerprint 5/5 OK; no test, config, `openapi.yaml` or `api/` edits; no new packages. Next: owner re-checks the browser at 375px and desktop, then reviewer / G3. | Pending | 2026-11-03 |
| main session → reviewer | Green complete, G3 PASS (32 web tests, owner browser review approved). Next: `/task-review`. | Yes (owner: "yes") | 2026-11-03 |

## 16. Not verified / risks
- Every web test mocks `fetch`, so the real request to the API (base URL, browser CORS preflight) is first checked by the owner's G3 browser review (manual row in section 10), and later by Q3 e2e in T4.
- If `app/page.tsx` ends up as an async server component, RTL cannot render it. The seam in section 5 requires a component that renders in jsdom.
- `user.paste` honours `maxLength` in user-event 14. If the installed version behaves differently, the tester reports it in red rather than changing the criterion.
- framer-motion in jsdom: if its components warn or need `IntersectionObserver` or `matchMedia` in tests, the tester adds a stub in `web/vitest.setup.ts` (test config) in red; tests must not wait on animation.
- npm audit: 2 critical (@vitest/mocker <=4.1.11 via vitest 3.2.7) and 17 moderate, dev and test tooling only. Not fixable on Node v23.1.0 (vitest 4+ excludes it); owner accepted. Node 23.1 also gives an EBADENGINE warning for eslint-visitor-keys@5.0.1.
- Tests depend on section 8 copy. If the ui-designer's copy changes after G2, the affected tests need owner-approved edits.
- Review not-verified items: contrast estimated from Tailwind palette values, not measured; no screen-reader run; `web/next.config.ts` and `web/eslint.config.mjs` not compared byte-for-byte with create-next-app output.
- No visible focus indicator on the results section (owner's choice, review #2); T3 U10 and T4 Q5 manual checks record it as a deviation.
- Service error and empty results show nothing useful until T3 (U7, U8), as planned.

## 17. Commits & pushes
| Hash | Message | Branch | Pushed | Date |
|---|---|---|---|---|

## 18. Time spent
107 minutes, 2026-11-03 18:42 to 20:29, G0 to G4 Part A, including owner reviews (owner confirmed). Logged in [time-log](../../time-log.md).

## 19. Closure
| Field | Value |
|---|---|
| Date | 2026-11-03 |
| Merge hash | Recorded in CURRENT_TASK.md under Completed tasks; not known when this doc is archived |
| Archived | 2026-11-03, moved to `docs/tasks/completed/` |
