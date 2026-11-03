# T3: Web states and accessibility

> Single source of truth for this task. Every agent reads it first and appends to it.

## 1. Header
| Field | Value |
|---|---|
| ID | T3 |
| Title | Web states and accessibility |
| Branch | task/T3-web-states-accessibility |
| Status | Done |
| Phase | close |
| Current agent | none |
| Last updated | 2026-11-03 |
| Location | completed |
| Skills used | accessible-ui, web-testing, code-comments, gate-check |

## 2. Goal
Handle empty results and recoverable failures, and harden the journey for small screens and keyboard-only use.

## 3. In scope / Out of scope
**In scope:** empty state, error + retry, network failure, small-screen and keyboard hardening, mock-boundary notes. UI co-creation.

**Out of scope:** new features.

## 4. Requirements
Acceptance criteria are written by the planner.
| ID | Requirement | Acceptance criteria (Given/When/Then) | Status |
|---|---|---|---|
| U7 | Empty-result state | **Given** a valid submit, **when** the API answers 200 with `hotels: []` (the `empty` example in `openapi.yaml`, DEC-2), **then** the loading state ends (U3), the results section shows the response `message` verbatim ("No hotels matched your request.") and the empty-state copy from section 8, which tells the traveller what to do next (for example change the request). The fixture label still shows, because the response has `source: "fixture"` (U5). No hotel radio group, no radio and no "Your selection" summary are rendered, and no empty right-hand column is left in the desktop grid (Option B). **When** the empty response arrives, **then** focus moves to the results section (role `region`, named by its heading from section 8), as it does for U5, so keyboard and screen-reader users land on the outcome. **Given** the empty state, **then** the form stays usable: "Find hotels" is enabled and the fields keep their values. **When** the traveller submits again (for example with the `success` scenario), **then** the empty state is cleared while loading (U6 clearing rule) and the new response replaces it. | Done |
| U8 | Recoverable failure: 503 or network error shows message + Retry that re-sends the last request | **Given** a valid submit, **when** the API answers 503 with `{detail}` (`ServiceUnavailable`, DEC-4), **or** `fetch` rejects (network error, no response), **then** the loading state ends (submit enabled again, progress text gone from the status region, U3), a failure section shows the failure heading and message from section 8 and a real `<button>` whose accessible name contains "Retry" (a 503 shows the API's `detail` verbatim; other failures use the fixed copy in section 8; owner, section 6), and no hotel cards, fixture label or summary are shown. Focus moves to the failure section (Option A, no outline) so it is announced and the next Tab reaches Retry. The copy must not promise that Retry will succeed (section 7). **When** the traveller activates Retry, **then** exactly one new request is sent with the same URL, method, headers and body (`{message, scenario}`) as the request that failed, even if the message or scenario fields were edited after the failure (U8 says "re-sends the last request"; owner, section 6). **While** the retry is pending, **then** the failure section is removed, the U3 loading state shows ("Finding hotels...", submit disabled), and no second request can be sent. **When** the retry succeeds, **then** results replace the failure (U4 to U6 behaviour, focus to results). **When** the retry fails again, **then** the failure state shows again and focus returns to it (the `error` scenario always does this). **Given** the failure state, **then** the form stays usable: the message and scenario fields are editable and "Find hotels" is enabled. **When** the traveller changes the scenario (for example to `success`) and submits, **then** the failure is cleared, the new body is sent, and its response is shown (resolved question in section 6). Any other non-2xx status, such as 500, shows the same failure state with the fixed copy (owner, section 6). | Done |
| U9 | Usable at 375px width | **Given** a real browser with the viewport at 375 by 812 CSS px (DevTools device toolbar), the real API on :8000 and `npm run dev` on :3000, **when** the traveller goes through every state (idle, validation error, loading, results, selected, empty, failure, retry pending), **then** in each state: there is no horizontal scrolling (`document.documentElement.scrollWidth <= document.documentElement.clientWidth` in the console, and no sideways drag); the layout is a single column with the hotel cards stacked and the summary below the cards; no text is clipped, truncated without a way to read it, or overlapping (a long hotel name or explanation wraps); and "Find hotels", Retry and each hotel card are comfortable to tap (buttons at least 44 CSS px tall; every target at least 24 by 24 CSS px, WCAG 2.2 AA 2.5.8). **Given** desktop width (1280 px), **then** the empty and failure states leave no empty right-hand column (Option B grid). Verified by the owner's manual check with screenshots (jsdom has no layout; TDD rule exception). | Done |
| U10 | Keyboard-only operation with visible focus | **Given** the page has loaded, **when** the traveller presses Tab repeatedly, **then** focus moves message field → scenario select → "Find hotels" in that order, and no hidden or decorative element takes focus. **Given** a pending request, **then** the disabled "Find hotels" button is skipped by Tab. **Given** results, **when** focus is on the results section and the traveller presses Tab, **then** focus moves to the hotel radio group (one tab stop: the checked radio, or the first when none is checked). **When** the traveller presses Space on the focused hotel with none checked, **then** it is selected and the summary appears; **when** they press Arrow Down or Arrow Up, **then** the selection moves to the next or previous hotel and the summary follows. **Given** the failure state, **when** the traveller presses Tab from the focused failure section, **then** focus reaches Retry, and Retry activates with Enter and with Space (each sends the retry request). **Given** any state, **then** the whole journey (ask, submit with Enter, review, select, retry, resubmit) can be done without a mouse. **Visible focus (manual):** every focusable control (message field, scenario select, "Find hotels", each hotel card through its `focus-within` ring, Retry) shows a clearly visible focus indicator when reached by keyboard, at desktop and 375 px, with at least 3:1 contrast against its background (WCAG 2.4.7, 1.4.11). The results section has no visible outline by owner choice (T2 section 7); this is recorded as a deviation, and the empty and failure focus targets follow the same rule (owner, section 7 U10 deviation). | Done |
| Q1 | Component/state tests with Vitest + RTL (states part; closes Q1) | **Given** `web/` with dependencies installed, **when** `npm test` runs, **then** every U7, U8 and U10 test in section 10 runs in jsdom with React Testing Library and user-event, together with the 32 T2 tests, and all pass; `npm run lint` and `npx tsc --noEmit` pass. Every test name starts with its requirement ID; global `fetch` (plus `vi.stubEnv` where stated) is the only mock; no snapshot tests; queries are by role, label or text, not class names or state. Retry tests stub one `Response` per call (`mockResolvedValueOnce`), because a body can be read only once. With T2's journey tests this closes Q1. | Done |
| Q6 | Mock boundaries documented | **Given** `APPROACH.md`, **when** the reviewer reads its "Mock boundaries" section (the only part of `APPROACH.md` the T3 implementer writes; its `TODO (T4)` line is replaced), **then** it states for each layer what is real and what is replaced: **web Vitest:** only global `fetch`, stubbed with `vi.stubGlobal` through `web/test/mockFetch.ts`, with bodies copied from the `openapi.yaml` examples, plus `vi.stubEnv` for the base URL; components, hooks and the API client are real; jsdom has no layout, so U9 and U10's visible focus are manual checks. **api pytest:** the real FastAPI app in process through `TestClient`; `FIXTURE_DELAY_MS=0` from `conftest.py`, and `app.main.sleep` patched only in the delay tests; contract tests validate responses against `openapi.yaml`. **e2e Playwright (T4):** the real API and web app with no response mocking; Q4 only rewrites the first request's scenario in transit (`route.continue`) so a real 503 is followed by a real 200. It also says what the mocks cannot prove (real browser CORS and the real network), and where that is checked instead (G3 browser review, T4 e2e). | Done |
| Q8 | Code meets the commenting standard (status closed by T4) | **Given** the `web/` source and test files written or edited in T3, **when** the gate-check comment greps run and the reviewer inspects, **then** every file has a header comment with its purpose and IDs (above `"use client"` where present); new or changed exports have TSDoc (including any new error type or failure component); U7, U8 and U10 behaviour cites its ID in a WHY comment (for example `// U8: Retry re-sends the last request as sent`); each new test file has a header and a comment on each mock or arrange step; no commented-out code, no `console.log` or `console.debug`; and no `TODO(T3)` is left anywhere in `web/` (T2 left two: the `HotelAssistant.tsx` catch block and the `Results.tsx` empty state). The stale "T2 scope" comment above the non-2xx throw in `lib/recommendations.ts` is updated to describe the T3 behaviour. | In progress (T3 part done; closed by T4) |

## 5. Assumptions & dependencies
**Assumptions:**
- The Mock boundaries section of `APPROACH.md` is where Q6 is documented; the implementer writes that section only.
- jsdom has no layout or CSS, so U9 and U10's visible focus are verified by manual check and screenshot, starting with the owner's browser review at G3. U10's tab order and key handling still get failing Vitest tests.
- T2 seams stay: the default export of `web/app/page.tsx` renders the whole journey in jsdom; `fetchRecommendations(request)` in `web/lib/recommendations.ts` is the only API client; the results `<section>` is a script-focus target (`tabIndex={-1}`, labelled by its heading). T2 already throws on any non-2xx and on a rejected `fetch`, and always leaves loading in `finally`; T3 replaces the empty `catch` (the `TODO(T3)`) with the failure state.
- "The last request" for Retry is the `{message, scenario}` object that was sent, kept by the page when the request starts. Retry sends that object, not the current field values (U8 wording and the resolved question in section 6). Changing the scenario and pressing "Find hotels" is the way to send a different request.
- A new submit or a Retry clears any empty or failure state while loading, as U6 already does for results (T2 planner default, owner-approved).
- The 503 `detail` is user-safe by contract (DEC-4, A6: "Recommendations are temporarily unavailable. Please try again."). The owner chose to show it (section 6): the client reads it only when the body is JSON with a string `detail`, and otherwise falls back to the section 8 copy. A network error has no body, so it always uses the section 8 copy.
- The failure section must not use `role="alert"` for a message that focus also announces, to avoid a double announcement; the ui-designer decides (section 8). Tests find the failure by its region name or text, not by `role="alert"`, because the U11 validation message already uses `role="alert"`.
- Test helpers: the tester adds `ERROR_BODY` (copied from the `unavailable` 503 example in `openapi.yaml`), `mockFetch503()` and `mockFetchNetworkError()` (a `TypeError("Failed to fetch")` rejection) to `web/test/mockFetch.ts`, as in the web-testing skill. Sequences (fail then succeed, fail then fail, fail then pending) use `vi.fn()` with one `mockResolvedValueOnce` or `mockRejectedValueOnce` per call. These are test files, so they are allowed in red.
- New T3 tests go in new files (`web/app/states.test.tsx` for U7 and U8, `web/app/keyboard.test.tsx` for U10) plus two client rows in `web/lib/recommendations.test.ts`. The 32 T2 tests stay unchanged, so T2's behaviour is still guarded.
- U9 and U10 visible-focus evidence: the owner checks in Chrome at the G3 browser review and saves screenshots to `docs/evidence/` with a `T3-` prefix (owner, section 6). `docs/manual-checks.md` (Q5) is filled in by T4, which can cite these screenshots.
- The visual direction from T2 (Tailwind, lucide-react icons with `aria-hidden`, framer-motion under `MotionConfig reducedMotion="user"`) applies to the empty and failure states. Animations must not delay the DOM, so tests never wait on them.

**Builds on (completed task docs):** [T1](T1-api-recommendations.md) (503 body and wording, A6, DEC-4), [T2](T2-web-core-journey.md) (journey, Option B, copy, focus rule, test helpers).

**New packages and owner approval:** none. Everything T3 needs is installed: Vitest, RTL, user-event 14.6.8 (Tab, arrow keys on radios, Enter and Space on buttons), jest-dom, lucide-react and framer-motion. No package is added.
| Package | Why | Approved by owner |
|---|---|---|
| (none) | | |

## 6. Clarifications
**Open**
| Question | Asked by | Why it matters |
|---|---|---|

**Resolved**
| Question | Owner's answer | Date |
|---|---|---|
| With the Error scenario, Retry re-sends the same request and fails again, as U8 specifies. To recover in a demo, should the traveller change the scenario and submit again, with Retry left as is? | Yes | 2026-11-03 |
| (planner 1, ui-designer 2) Should a 503 show the API's `detail` verbatim or fixed client copy? | Show the 503 `detail` verbatim. A 503 without a usable `detail` shows "The hotel service is not available right now. Please try again." A network error shows "We could not reach the hotel service. Check your connection, then try again." | 2026-11-03 |
| (planner 2) Should other non-2xx statuses (for example 500) show the same failure state with Retry? | Yes: any non-2xx shows the failure state with the fixed copy above; one test uses a 500. A malformed 200 is untested and stays a risk (section 16) | 2026-11-03 |
| (planner 3, ui-designer 3) Should the focused empty and failure sections show a visible outline? | No outline, following the T2 rule; recorded as a U10 deviation in section 7. Every interactive control, Retry included, keeps its focus ring | 2026-11-03 |
| (planner 4) Who takes the U9 and U10 screenshots? | The owner, at the G3 browser review, saved as `docs/evidence/T3-375-<state>.png` and `docs/evidence/T3-focus-<control>.png`. `docs/manual-checks.md` stays with T4 | 2026-11-03 |
| (ui-designer 1) Which UI option? | Option A, "Quiet panel in the results slot" | 2026-11-03 |
| (ui-designer 4) Approve the draft copy in section 8? | Approved as drafted (Option A rows) | 2026-11-03 |

## 7. Decisions & deviations
Includes overrides and gate waivers.
| Agent proposed | Owner chose | Why | Impact |
|---|---|---|---|
| Keep Retry re-sending the last request; the demo recovers by changing the scenario and resubmitting | Yes | U8 specifies the re-send, and the Error scenario always returns 503 | The form stays usable in the failure state and the failure copy must not imply Retry will always work. The README demo path (T4) describes this. Q4 proves Retry recovery separately; see the web-testing skill |
| ui-designer: Option A, "Quiet panel in the results slot" (recommended over Option B) | Option A | Keeps T2's layout and no-outline rule, reuses the U5 region name and focus code, smallest diff | Empty state keeps the "Recommended hotels" region; failure is a white card with an amber accent headed "We could not get recommendations" |
| planner/ui-designer: show the 503 `detail` verbatim; fixed copy for other non-2xx and network errors | Yes | The API's `detail` is user-safe (DEC-4); without a rule an unexpected status would leave the page blank | Client parses the 503 body and throws a typed error; adds a 503-detail test and a 500 test |
| planner/ui-designer: no visible outline on the script-focused empty and failure sections | Yes (no outline) | Consistent with the T2 owner rule for the results section | **U10 deviation:** the empty and failure sections show no outline when focused by script; every interactive control, Retry included, shows a focus-visible ring. The U10 manual check passes on that basis |
| planner: owner takes U9/U10 screenshots at the G3 browser review | Yes | Agents cannot capture a real browser; jsdom cannot test layout or visible focus (TDD exception) | Evidence at `docs/evidence/T3-375-<state>.png` and `docs/evidence/T3-focus-<control>.png` |
| tester: keep 5 new U10 tests that already pass in red (Tab order, disabled submit skipped, Tab from results to radios, Space/arrow selection, keyboard-only journey) as regression guards | Waive G2 "fail for the right reason" for these 5 only | T2 built this behaviour with native controls and the U5 focus move; U10 asks for proof that it works from the keyboard | G2 waiver recorded in docs/gates/T3-G2.md. The 3 U10 Retry tests and all U7/U8 tests fail on missing behaviour |
| tester: U8 client tests assert the typed error (`kind: "unavailable"` + `detail` for a 503, `kind: "network"` for a fetch failure), not a plain rejection | Yes | A plain rejection already passes in T2; the UI chooses its copy from `kind` | The implementer must throw an error carrying `kind` and `detail` properties from `lib/recommendations.ts` |
| main session: capture the U9/U10 screenshots with headless Chrome over CDP, since the owner asked "capture yourself" | Yes | The owner asked the main session to take them | Replaces "owner takes screenshots at G3". The owner judged pass from the screenshots and requested one visual fix (empty panel width). Script kept outside the repo (scratchpad) |
| reviewer R1: add a U8 test for a 503 without a usable `detail` after G2 | Yes (approved test edit after G2) | The fallback copy branch was unguarded | One test added to `web/app/states.test.tsx`; it passes at once (guards existing behaviour, like the G2-waived U10 guards). G2 fingerprint re-saved; G3 checks rerun green (60 web tests) |

## 8. UI co-creation
**Planner notes for the ui-designer** (inputs only; the ui-designer owns this section). Option B and the T2 copy stay. The options should cover:
- Empty state (U7): the heading (keep "Recommended hotels" or a different one, since it names the focused region), the empty-state guidance copy shown with the response `message`, whether the fixture badge stays, and how the Option B grid avoids an empty right-hand column.
- Failure state (U8): where it renders (the results slot), the heading, the body copy for a 503 and for a network error (question 1), and the Retry label (its accessible name must contain "Retry"). The copy must not promise success (section 7) and could hint that changing the scenario is the demo way to recover, without making the demo control look like a traveller preference (DEC-1).
- Announcement and focus: the focus target after an empty or failed response (the section, as in U5, or the heading), whether it shows a focus outline (question 3), and whether any live region or `role="alert"` is used without double-announcing alongside the focus move.
- Retry pending: Retry is removed or disabled while the retry is pending; the status region shows the same "Finding hotels..." text.
- Keyboard map update: message → scenario → "Find hotels" → Retry in the failure state; Enter and Space on Retry; Tab from the focused empty or failure section.
- 375px: wireframes of the empty and failure states, Retry tap size (at least 44 px tall) and width, and the visible focus style for Retry (`focus-visible:ring-2 focus-visible:ring-offset-2`, at least 3:1 contrast).
- States table: add empty, failure, retry pending, retry success and retry failure, and the resubmit-from-failure path.

**Options:**

Both options build on T2 Option B and keep its layout, copy, visual direction and seams. Shared across both options:
- **Where it renders.** The empty and failure states use the results slot under the search card. Either a response or a failure is shown, never both. `HotelAssistant` gains one more piece of state, `failure` (the message to show, or null), and keeps `lastRequest` (the `{message, scenario}` object sent, for Retry).
- **No empty right column (U7, U9).** The `md:grid-cols-3` wrapper renders only when `hotels.length > 0`, as it does now. The empty panel and the failure card are full width in the `max-w-5xl` container, and their text is capped at `max-w-prose` so lines stay readable.
- **Announcement without doubling.** No new `role="alert"` and no new live region. The always-mounted `role="status"` region keeps doing only one job: it shows "Finding hotels..." while a request (including a retry) is pending and is emptied when the request ends. It never repeats the outcome. The outcome is announced once, by the focus move: the focused section is a `region` named by its heading (`aria-labelledby`) and described by its body text (`aria-describedby`), so a screen reader reads the heading and the message together. U11's `role="alert"` stays the only alert on the page.
- **Retry while pending: removed, in both options.** U8's criteria say the failure section is removed while the retry is pending, and this matches the U6 clearing rule, so the page looks the same as after a fresh submit: the failure card goes, the status region shows "Finding hotels..." and "Find hotels" is disabled. A disabled Retry was considered and rejected. It would leave an out-of-date failure message on screen next to "Finding hotels...". A disabled button is also skipped by Tab and gives screen readers a second state to explain. A second retry cannot be sent, because the button is no longer in the DOM. Focus: as with T2's disabled submit, focus leaves the removed Retry while the request runs (it goes to `body`), then the focus move to the new outcome (results, empty or failure) puts the traveller back in place.
- **Retry button.** A real `<button type="button">` with the visible text "Retry" and a `RotateCw` icon (`aria-hidden`), so its accessible name is exactly "Retry". It is `w-full` at 375 px and `md:w-auto` on desktop, `min-h-11` (44 px) with `px-6 py-3 text-base`, and uses `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`, where the ring offset colour matches the card background (indigo-500 on white or light tints is above 3:1). `onClick` re-sends `lastRequest`, never the current field values (U8, section 6).
- **Small-screen and focus hardening (U9, U10), applied to existing components.** Long text wraps instead of overflowing: `break-words` (`overflow-wrap: anywhere` for unbroken strings) on the hotel name label, explanation, assistant message, failure body and summary sentence, plus `min-w-0` on flex children that hold text. The "Find hotels" button is already at least 44 px tall (`py-3`). Each hotel card is fully clickable through its label overlay, so it is far larger than 24 by 24 px. The `focus-within` ring on the cards and the `focus-visible` rings on the input, select and buttons stay as they are. No element gets a positive `tabIndex`. Decorative icons stay `aria-hidden` and are never focusable.

**Option A: "Quiet panel in the results slot"** (recommended)
The empty state stays inside the familiar "Recommended hotels" section. The failure state is a calm white card with an amber left accent, in the same slot, with its own heading. Focus goes to the section, as in U5, with no outline, following the T2 owner rule. The quiet look matches T2: hardly anything new to learn, and the smallest diff.
```
Desktop (>= 768px), EMPTY (U7)                       focus -> whole section (no outline)
+------------------------------------------------------------------------------+
| Hotel Assistant / intro / search card (unchanged; "Find hotels" enabled,     |
| fields keep their values)                                                    |
| [status]                                              (empty after response) |
|------------------------------------------------------------------------------|
| Recommended hotels                                     [Demo data (fixture)] |
| +--------------------------------------------------------------------------+ |
| | (bot) Assistant: No hotels matched your request.                         | |
| +--------------------------------------------------------------------------+ |
| +--------------------------------------------------------------------------+ |
| | (search-x)  No hotels to show                                    (h3)    | |
| |  Try changing your request, for example a higher nightly budget or a     | |
| |  different area, then select Find hotels again.                          | |
| |  Demo note: the Empty results scenario always returns no hotels.         | |
| +--------------------------------------------------------------------------+ |
|  (full width: no grid, no "Choose a hotel", no summary column)               |
+------------------------------------------------------------------------------+

Desktop (>= 768px), FAILURE (U8)                     focus -> failure section (no outline)
+------------------------------------------------------------------------------+
| search card (unchanged; fields editable, "Find hotels" enabled)              |
| [status]                                              (empty after failure)  |
|------------------------------------------------------------------------------|
| |(!) We could not get recommendations                             (h2)     | |
| |    Recommendations are temporarily unavailable. Please try again.        | |
| |    Demo note: the Service error scenario always fails. To see hotels,    | |
| |    choose another scenario and select Find hotels.                       | |
| |    [ (rotate) Retry ]                                                    | |
| (white card, amber-500 left border, full width; no fixture badge, no cards)  |
+------------------------------------------------------------------------------+

375px, EMPTY                          375px, FAILURE
+-----------------------------------+ +-----------------------------------+
| ...search card...                 | | ...search card...                 |
| [         Find hotels           ] | | [         Find hotels           ] |
| [status]                          | | [status]                          |
|-----------------------------------| |-----------------------------------|
| Recommended hotels                | | |(!) We could not get           | |
| [Demo data (fixture)]             | | |    recommendations            | |
| +-------------------------------+ | | |    Recommendations are        | |
| | (bot) Assistant: No hotels    | | | |    temporarily unavailable.   | |
| | matched your request.         | | | |    Please try again.          | |
| +-------------------------------+ | | |    Demo note: the Service     | |
| +-------------------------------+ | | |    error scenario always      | |
| | (search-x) No hotels to show  | | | |    fails. To see hotels,      | |
| | Try changing your request,    | | | |    choose another scenario    | |
| | for example a higher nightly  | | | |    and select Find hotels.    | |
| | budget or a different area,   | | | | [          Retry           ] | |
| | then select Find hotels again.| | | |  (full width, 48 px tall)     | |
| | Demo note: the Empty results  | | +-----------------------------------+
| | scenario always returns no    | |
| | hotels.                       | |
| +-------------------------------+ |
+-----------------------------------+

RETRY PENDING (both widths): failure card removed; [status] (spinner) Finding hotels...;
"Find hotels" disabled; results slot empty until the retry's outcome arrives.
```
Components:
- `Results` (changed): when `hotels` is empty, it renders `EmptyState` in place of the grid and sets the section's `aria-describedby` to the assistant message and the empty text. The heading, badge and assistant message are unchanged, and the region name stays "Recommended hotels", so the U5 focus code and query are reused.
- `EmptyState` (new, small): an `h3` and the guidance and demo-note paragraphs in a neutral slate-50 panel with a `SearchX` icon (`aria-hidden`).
- `FailureState` (new): a `<section aria-labelledby="failure-heading" aria-describedby="failure-body" tabIndex={-1} className="... focus:outline-none">` holding the `h2`, the body paragraph, the demo note and the Retry button. Props: `message`, `onRetry`, `sectionRef`.
- `HotelAssistant` (changed): adds `failure` and `lastRequest`. The `catch` sets `failure` from the error; `handleRetry` calls the same send path with `lastRequest`. One `useEffect` focuses whichever outcome section mounted (results or failure) through the shared `focusResults` helper (rename to `focusOutcome`).
- `lib/recommendations.ts` (changed): throws a typed `RecommendationError` with a `kind` (`"unavailable" | "unexpected" | "network"`) and an optional user-safe `detail` (read only when a 503 body is JSON with a string `detail`; question 1). The page maps `kind` to the section 8 copy.

Trade-offs:
- For: the fewest new patterns. The empty state keeps the U5 region name, so its focus test and the T2 focus code carry over. It follows the owner's T2 no-outline rule, so it looks the same as results. Calm amber styling suits a temporary problem and does not look like a crash.
- Against: the focused section shows no outline (a U10 deviation, as in T2, recorded in section 7). Keeping "Recommended hotels" as the heading when there are none is slightly odd. The `aria-describedby` and the h3 "No hotels to show" make up for it, but a sighted user reads a heading that promises hotels.

**Option B: "Outcome cards with their own heading and visible focus"**
Each outcome gets its own heading that says what happened, inside a tinted card. The focus target (the card section) shows a visible focus ring, so U10 has no deviation. The empty state has an indigo-50 tint. The failure state has a rose-50 tint with a `CircleAlert` icon, and Retry is the primary indigo button.
```
Desktop (>= 768px), EMPTY (U7)                       focus -> card section, ring visible
+------------------------------------------------------------------------------+
| search card (unchanged)                                                      |
| [status]                                                                     |
|------------------------------------------------------------------------------|
| #============================================================================# |
| # (search-x) No hotels found                    (h2)  [Demo data (fixture)] # |
| #  (bot) Assistant: No hotels matched your request.                         # |
| #  Try changing your request, for example a higher nightly budget or a      # |
| #  different area, then select Find hotels again.                           # |
| #  Demo note: the Empty results scenario always returns no hotels.          # |
| #============================================================================# |
|  (indigo-50 card, full width; '#' = 2 px indigo-500 focus ring + offset)     |
+------------------------------------------------------------------------------+

Desktop (>= 768px), FAILURE (U8)                     focus -> card section, ring visible
+------------------------------------------------------------------------------+
| search card (unchanged)                                                      |
| [status]                                                                     |
|------------------------------------------------------------------------------|
| #============================================================================# |
| # (!) Something went wrong                                     (h2)         # |
| #  Recommendations are temporarily unavailable. Please try again.           # |
| #  Demo note: the Service error scenario always fails. To see hotels,       # |
| #  choose another scenario and select Find hotels.                          # |
| #  [ (rotate) Retry ]   (primary indigo button)                             # |
| #============================================================================# |
|  (rose-50 card, rose-200 border; ring shows while the card holds focus)      |
+------------------------------------------------------------------------------+

375px, EMPTY                          375px, FAILURE
+-----------------------------------+ +-----------------------------------+
| ...search card...                 | | ...search card...                 |
| [status]                          | | [status]                          |
|-----------------------------------| |-----------------------------------|
| #===============================# | | #===============================# |
| # (search-x) No hotels found    # | | # (!) Something went wrong      # |
| # [Demo data (fixture)]         # | | # Recommendations are           # |
| # Assistant: No hotels matched  # | | # temporarily unavailable.      # |
| # your request.                 # | | # Please try again.             # |
| # Try changing your request,    # | | # Demo note: the Service error  # |
| # for example a higher nightly  # | | # scenario always fails. To see # |
| # budget or a different area,   # | | # hotels, choose another        # |
| # then select Find hotels again.# | | # scenario and select Find      # |
| # Demo note: the Empty results  # | | # hotels.                       # |
| # scenario always returns no    # | | # [          Retry            ] # |
| # hotels.                       # | | #===============================# |
| #===============================# | +-----------------------------------+
+-----------------------------------+

RETRY PENDING: same as Option A (card removed, "Finding hotels...", submit disabled).
```
Components:
- `Results` (changed): when `hotels` is empty, it renders `EmptyState` instead of its normal body. The section's heading text becomes "No hotels found" (the region name changes), and the badge and assistant message move inside the card.
- `EmptyState` and `FailureState` (new): the same as Option A, except each is a tinted card section with `focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`. It uses `focus:`, not `focus-visible:`, because browsers often hide `:focus-visible` on a script focus that follows a mouse click, and the ring must show either way.
- `HotelAssistant` and `lib/recommendations.ts`: the same as Option A.
- The results section with hotels keeps T2's no-outline rule. Only the empty and failure cards show the ring. The ring disappears when focus moves on (Tab to Retry, or a click elsewhere).

Trade-offs:
- For: the heading names the outcome ("No hotels found", "Something went wrong"), so it is clearer at a glance and to a screen reader. The visible focus ring meets U10 and accessible-ui manual check 6 with no deviation. The rose tint and icon make the failure easy to tell apart from results without relying on colour (the heading text carries the meaning).
- Against: it departs from the T2 owner rule (an outline on a script-focused target), so the page behaves differently after success and after empty or failure, and the owner may dislike the ring for the same reason as in T2. A different region name for empty means the U7 focus test queries `/no hotels found/i`, not `/recommended hotels/i`. "Something went wrong" is vaguer than Option A's heading. A rose tint can read as alarming for a temporary, recoverable problem.

**Recommendation:** Option A. It keeps the owner's T2 decisions (Option B layout, no outline on script-focused sections), reuses the U5 focus code and region name for the empty state, and has the smallest diff. Its one cost, no outline on the focused failure section, is already a recorded T2 deviation, and every interactive control (including Retry) still shows a ring. If the owner wants U10 met with no deviation, take Option B's focus ring alone (question 3) and keep Option A's copy and styling.

**Choice and why:** Option A, "Quiet panel in the results slot" (owner, 2026-11-03). It keeps T2's layout and no-outline rule and reuses the U5 region name and focus code. No outline on the focused empty and failure sections (U10 deviation, section 7). Draft copy approved; the Option A rows apply.

**Copy:**
Approved by the owner on 2026-11-03 (section 6); the Option A rows apply. Tests match these with case-insensitive regexes. Copy from T2 is unchanged and not repeated here. Where the two options differ, the row says so.
| Element | Exact copy | Notes |
|---|---|---|
| Empty: section heading (`h2`, region name) | A: Recommended hotels (unchanged) / B: No hotels found | The focus target's accessible name. U7 test: `getByRole("region", { name: /recommended hotels/i })` (A) or `/no hotels found/i` (B) |
| Empty: assistant message | Assistant: {message}, for example "Assistant: No hotels matched your request." | Verbatim from the response (U4, DEC-2); the same element as for results |
| Empty: fixture badge | Demo data (fixture) | Shown because `source: "fixture"` (U5) |
| Empty: panel heading (`h3`, Option A only) | No hotels to show | |
| Empty: guidance | Try changing your request, for example a higher nightly budget or a different area, then select Find hotels again. | Tells the traveller what to do next (U7). In `aria-describedby` of the section |
| Empty: demo note | Demo note: the Empty results scenario always returns no hotels. | Small slate-600 text. Uses the option's visible label, so it does not read as a traveller preference (DEC-1) |
| Failure: heading (`h2`, region name) | A: We could not get recommendations / B: Something went wrong | The focus target's accessible name. Test: `getByRole("region", { name: /could not get recommendations/i })` (A) or `/something went wrong/i` (B) |
| Failure: body, 503 with a string `detail` | `{detail}` verbatim, today "Recommendations are temporarily unavailable. Please try again." | Owner: yes (section 6). "Please try again" invites a retry but does not say it will work, so it meets section 7. Its id is `failure-body`, in the section's `aria-describedby` |
| Failure: body, 503 without a usable `detail`, or any other non-2xx | The hotel service is not available right now. Please try again. | Fixed client copy (owner, section 6) |
| Failure: body, network error (rejected `fetch`) | We could not reach the hotel service. Check your connection, then try again. | Fixed client copy; there is no body |
| Failure: demo note | Demo note: the Service error scenario always fails. To see hotels, choose another scenario and select Find hotels. | Shown for every failure (it is true either way). It names the demo way to recover (section 6) and does not promise that Retry works |
| Retry button | Retry | Visible text and accessible name exactly "Retry"; icon `aria-hidden`. Test: `getByRole("button", { name: /retry/i })` |
| Progress text while retrying | Finding hotels... | The same status region and text as U3; no separate "Retrying..." text, so tests and screen readers hear one familiar message |

**States:**
T2 states (idle, validation error, validation cleared, loading, results, selected, new request) are unchanged. New or changed rows:
| State | Trigger | What shows | Focus | Status region |
|---|---|---|---|---|
| Empty (U7) | 200 with `hotels: []` | Option A: the "Recommended hotels" section with the badge, assistant message and empty panel. Option B: the "No hotels found" card with the badge, assistant message, guidance and demo note. No fieldset, radios or summary, and no grid, so no empty right column. Form fields keep their values; "Find hotels" enabled | Moves to the empty-state section (A: no outline; B: visible ring) | Emptied ("Finding hotels..." gone) |
| New submit from Empty | Valid submit | As in Loading: the empty state is cleared (U6 rule) | As in Loading | "Finding hotels..." |
| Failure (U8) | 503, other non-2xx, or rejected `fetch` | Failure section with its heading, body (by failure kind, see Copy), demo note and Retry. No hotel cards, badge, assistant message or summary. Fields editable with their values kept; "Find hotels" enabled | Moves to the failure section (A: no outline; B: visible ring); the next Tab reaches Retry | Emptied |
| Retry pending (U8) | Retry activated (click, Enter or Space) | Failure section removed; "Find hotels" disabled; results slot empty. Exactly one request with the same URL, method, headers and body as the failed one (`lastRequest`), even if the fields were edited | Leaves the removed Retry (goes to `body`), as with T2's disabled submit, until the outcome arrives | "Finding hotels..." |
| Retry success | Retry's request returns 200 with hotels | Results state (U4 to U6): cards, badge, message; no selection | Moves to the "Recommended hotels" section | Emptied |
| Retry returns empty | Retry's request returns 200 with `hotels: []` | Empty state | As in Empty | Emptied |
| Retry failure | Retry's request fails again (always with the Service error scenario) | Failure state again; the body follows the new failure's kind | Moves to the failure section again | Emptied |
| Resubmit from Failure | Traveller edits the message or scenario (for example chooses Success) and selects "Find hotels" | As in Loading: failure cleared; the new body is sent and becomes the new `lastRequest`; its outcome is shown | As in Loading, then the outcome | "Finding hotels...", then emptied |
| Validation error from Empty or Failure | Submit with a blank message | U11 message on the field; no request. The empty or failure state stays on screen (as T2 keeps results) | Message field | Unchanged |

**Keyboard map:**
Tab order (unchanged in idle and results): message input → scenario select → "Find hotels" → (results) hotel radio group (one tab stop).
Tab order (failure): message input → scenario select → "Find hotels" → Retry. The failure section is `tabIndex={-1}`, so it is not a tab stop. It takes focus only from script.
Tab order (empty): message input → scenario select → "Find hotels". There is nothing focusable in the empty section.
| Control or position | Keys | Result |
|---|---|---|
| Focused failure section (after a failure) | Tab | Moves to Retry (U10) |
| Focused failure section | Shift+Tab | Moves back to "Find hotels" (the previous tab stop in DOM order) |
| Focused empty section (after an empty response) | Shift+Tab | Moves back to "Find hotels" so the traveller can resubmit |
| Focused empty section | Tab | Leaves the page content (browser UI), as nothing in the section is focusable |
| Retry | Enter or Space | Sends exactly one retry with `lastRequest` (native button). It is then removed, so repeated presses cannot send a second request |
| Retry | Tab / Shift+Tab | Leaves Retry / goes back to "Find hotels" |
| Message input | Enter | Submits the current field values (native, with the U11 guard); this is the way to send a changed request from the failure state |
| Scenario select | Arrow Up/Down; Alt+Arrow Down or Space to open; Enter | Native; changing it does not touch the failure or empty state until "Find hotels" is pressed |
| "Find hotels" | Enter or Space | Submits; skipped by Tab while disabled (loading or retry pending) |
| Focused results section | Tab | Moves to the hotel radio group: the checked radio, or the first when none is checked |
| Hotel radios | Space; Arrow Up/Left, Arrow Down/Right | Space selects the focused hotel when none is checked; arrows move the selection and the summary follows (native) |
Visible focus: the input, select, "Find hotels" and Retry use `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`. Hotel cards use a `focus-within` ring. The results section has no outline (T2 owner rule). The empty and failure sections have no outline in Option A (a recorded deviation) and a `focus:ring-2` ring in Option B (question 3).

**Browser-review changes:** G3 browser review, 2026-11-03, against the real API (uvicorn :8000) and `npm run dev` (:3000). At the owner's request the main session captured the evidence with headless Chrome over the DevTools protocol (scratchpad script, no new dependency; real keyboard events for Tab, Enter and Space), and the owner judged it from the screenshots.
- Change requested by the owner: the empty-state panel was about half width at desktop because `max-w-prose` capped the whole panel. The implementer moved it onto the heading and paragraphs (`EmptyState.tsx`), so the panel is full width like the failure card and its text stays capped. Visual only; no test changed.
- Not changed: the Next.js dev-tools "N" badge overlaps the bottom-left corner in dev mode only.
- Result: U9 pass (no horizontal overflow in all 15 shots; single column at 375 px; Retry and Find hotels 48 px tall; Retry full width at 375 px; no empty right column at 1280 px). U10 pass (visible ring on message, scenario, Find hotels, hotel card and Retry; no outline on the focused empty and failure sections, per section 7; Space and Enter on Retry each sent a retry). U7/U8 real-API path pass (Empty, then Service error showing the 503 `detail` verbatim, Retry fails again, then Success shows hotels).
- Evidence: `docs/evidence/T3-375-{idle,validation,loading,results,selected,empty,failure,retry-pending}.png`, `docs/evidence/T3-1280-{empty,failure}.png`, `docs/evidence/T3-focus-{message,scenario,find-hotels,hotel-card,retry}.png` (recaptured after the fix).

## 9. Contract impact
None. `openapi.yaml` stays unchanged, and T3 only consumes what it already defines:
- 200 with `hotels: []` (the `empty` example, DEC-2) drives U7. The web's `RecommendationResponse` type already allows an empty array.
- 503 `ServiceUnavailable` `{detail: string}` (DEC-4) drives U8. The client reads `detail` (owner, section 6) as a user-safe string; it never shows any other part of a response body.
- A network error (rejected `fetch`) is outside the contract and is handled only in the client.
- 422 stays unreachable from the UI (U11 guard and `maxLength={1000}`, DEC-3). If one ever arrived it would fall under the non-2xx rule (owner, section 6).
- Retry re-sends the same request body as the original `{message, scenario}`, so the request shape does not change. No `api/` change is needed; the G3 check `git diff main -- openapi.yaml` must be empty.

## 10. Test plan
Type: unit | contract | e2e | inspection | manual. Inspection and manual rows are for what a test cannot cover; they name the check and are not part of G2.

Mock boundary unless stated: global `fetch` stubbed with `vi.stubGlobal` through `web/test/mockFetch.ts`: the existing `mockFetchSuccess`, `mockFetchEmpty` and `mockFetchPending`, plus `ERROR_BODY`, `mockFetch503()` and `mockFetchNetworkError()`, which the tester adds (section 5). Sequences use `vi.fn()` with one `mockResolvedValueOnce` or `mockRejectedValueOnce` per call, because a `Response` body can be read once. Real components, hooks and API client. Page tests render the default export of `web/app/page.tsx`. Copy in assertions comes from section 8, matched with case-insensitive regexes. Each test name starts with its ID. Tests find the failure section by its region name or text, not by `role="alert"` (U11 uses that role).
| Test or check (with ID) | Type | File | Mock boundary |
|---|---|---|---|
| U7: an empty response shows the assistant message and the empty-state copy, with no hotel radios and no summary | unit | web/app/states.test.tsx | fetch (`mockFetchEmpty`) |
| U7: the empty state keeps the fixture label | unit | web/app/states.test.tsx | fetch (`mockFetchEmpty`) |
| U7: focus moves to the results section when an empty response arrives | unit | web/app/states.test.tsx | fetch (`mockFetchEmpty`) |
| U7: a new submit from the empty state clears it and shows the new results (also asserts "Find hotels" is enabled in the empty state) | unit | web/app/states.test.tsx | fetch: `vi.fn()` `mockResolvedValueOnce(empty)` then `mockResolvedValueOnce(success)` |
| U8: a failure shows the failure message and a Retry button [503, network error] | unit | web/app/states.test.tsx | fetch (`mockFetch503` with `ERROR_BODY`; `mockFetchNetworkError`) |
| U8: a 503 shows the API's detail message | unit | web/app/states.test.tsx | fetch (`mockFetch503` with `ERROR_BODY`) |
| U8: after a failure the loading state ends and no hotels, fixture label or summary are shown | unit | web/app/states.test.tsx | fetch (`mockFetch503`) |
| U8: focus moves to the failure section when a request fails | unit | web/app/states.test.tsx | fetch (`mockFetch503`) |
| U8: Retry re-sends the last request with the same URL, method and body [503, network error] | unit | web/app/states.test.tsx | fetch: `vi.fn()` `mockResolvedValueOnce(503)` or `mockRejectedValueOnce(TypeError)`, then a never-settling promise; both calls' args compared |
| U8: Retry sends the request that failed even after the message and scenario were edited | unit | web/app/states.test.tsx | fetch: `mockResolvedValueOnce(503)`, then a never-settling promise; second body equals the first |
| U8: while a retry is pending the failure is cleared, progress shows and no second retry can be sent | unit | web/app/states.test.tsx | fetch: `mockResolvedValueOnce(503)`, then a never-settling promise; call count asserted |
| U8: a successful retry replaces the failure with results | unit | web/app/states.test.tsx | fetch: `mockResolvedValueOnce(503)` then `mockResolvedValueOnce(success)` |
| U8: a retry that fails again shows the failure state again with focus on it | unit | web/app/states.test.tsx | fetch: `mockResolvedValueOnce(503)` twice (two separate `Response` objects) |
| U8: the form stays usable in the failure state; changing the scenario and submitting sends the new body and shows its results | unit | web/app/states.test.tsx | fetch: `mockResolvedValueOnce(503)` then `mockResolvedValueOnce(success)`; second body `scenario` asserted |
| U8: any other non-2xx status (500) shows the same failure state with the fixed copy | unit | web/app/states.test.tsx | fetch: `vi.fn().mockResolvedValue(jsonResponse(500, {}))` |
| U8: fetchRecommendations rejects on a 503 response | unit | web/lib/recommendations.test.ts | fetch (`mockFetch503`) |
| U8: fetchRecommendations rejects when fetch fails with a network error | unit | web/lib/recommendations.test.ts | fetch (`mockFetchNetworkError`) |
| U10: Tab moves through the message field, the scenario select and Find hotels in order | unit | web/app/keyboard.test.tsx | none needed (no submit); fetch stubbed defensively |
| U10: the disabled Find hotels button is skipped by Tab while a request is pending | unit | web/app/keyboard.test.tsx | fetch (`mockFetchPending`) |
| U10: Tab from the focused results section reaches the hotel radio group | unit | web/app/keyboard.test.tsx | fetch (`mockFetchSuccess`) |
| U10: Space selects the focused hotel and arrow keys move the selection, with the summary following | unit | web/app/keyboard.test.tsx | fetch (`mockFetchSuccess`) |
| U10: Tab from the focused failure section reaches Retry | unit | web/app/keyboard.test.tsx | fetch (`mockFetch503`) |
| U10: Retry activates from the keyboard [Enter, Space] | unit | web/app/keyboard.test.tsx | fetch: `mockResolvedValueOnce(503)`, then a never-settling promise; call count asserted |
| U10: the journey works without a mouse: type, Enter to submit, Tab to the hotels, arrow to select | unit | web/app/keyboard.test.tsx | fetch (`mockFetchSuccess`); only `user.type`, `user.tab` and `user.keyboard` |
| U9 small-screen check: at 375 by 812 in Chrome DevTools with the real API, go through idle, validation, loading, results, selected, empty, failure and retry pending; in each, `scrollWidth <= clientWidth`, single column, no clipped text, buttons at least 44 px tall; at 1280 px, no empty right column in the empty and failure states; screenshots `docs/evidence/T3-375-<state>.png` | manual (owner, at G3 browser review) | docs/evidence/T3-375-*.png; result recorded in section 8 "Browser-review changes" and section 11 | none (real API) |
| U10 visible-focus check: keyboard only, at desktop and 375 px, every control (message, scenario, Find hotels, each hotel card, Retry) shows a visible focus indicator with at least 3:1 contrast; the empty and failure focus targets show no outline (owner decision, section 7); native select arrow keys work; accessible-ui manual script steps 1 to 7 run end to end; screenshots `docs/evidence/T3-focus-<control>.png` | manual (owner, at G3 browser review) | docs/evidence/T3-focus-*.png; recorded in section 8 and section 11 | none (real API) |
| Q1 suite check: `npm test`, `npm run lint` and `npx tsc --noEmit` from `web/` all pass, with all T2 and T3 tests; every test name starts with an ID; only `fetch` (and `vi.stubEnv`) is mocked; no snapshots | inspection (run at G3) | web/**/*.test.ts(x), web/test/mockFetch.ts | none |
| Q6 mock-boundaries check: the "Mock boundaries" section of `APPROACH.md` covers web, api and e2e as in the Q6 criteria, matches the real test code (for example `web/test/mockFetch.ts`, `api/tests/conftest.py`), and no other `APPROACH.md` section was edited | inspection (reviewer, then G3/G4) | APPROACH.md | none |
| Q8 comment standard: gate-check greps (TODO without ID, `console.log` or `console.debug`, commented-out code, missing headers) plus `git grep -n "TODO(T3)" -- web` returning nothing, and reviewer inspection of TSDoc on new exports, U7/U8/U10 ID comments, and arrange or mock comments in the new tests | inspection | web/**/*.ts, web/**/*.tsx (excluding `next-env.d.ts`) | none |
| U7, U8 real-API check: with uvicorn on :8000 and `npm run dev` on :3000, run the `empty` scenario, then the `error` scenario, press Retry (fails again, as decided), change the scenario to `success` and submit (results show) | manual (owner, at G3 browser review, 375 px and desktop) | recorded in section 8 "Browser-review changes" and section 11 | none (real API) |

## 11. Test results log
Append only.
| Run # | Phase | Command | Passed | Failed | Failing tests + reason | Date |
|---|---|---|---|---|---|---|
| 1 | test (red) | `npm test` (web/), plus `npx vitest run --reporter=verbose` for per-test lines | 37 (32 T2 unchanged + 5 new U10) | 22 | All 22 fail on missing behaviour. **U8 client (2):** `toMatchObject` fails: the 503 rejection is a plain `Error("...status 503")` with no `kind: "unavailable"` or `detail`; the network rejection is the raw `TypeError` with no `kind: "network"`. **U8 page (13 incl. 2 parametrised each):** `Unable to find role="region" and name /could not get recommendations/i` (no failure section yet; the T2 `catch` is empty). **U10 Retry (3: Tab to Retry, Enter, Space):** same missing failure region. **U7 (4):** `Unable to find role="heading" and name /no hotels to show/i` (3) or the empty-state guidance text (1): the empty panel does not exist yet. No syntax, config or selector errors. **Pass at once (5, U10):** Tab order message → scenario → Find hotels; disabled Find hotels skipped by Tab; Tab from the focused results section to the first radio; Space selects and Arrow Down/Up move the selection with the summary following; keyboard-only journey. T2 built these (native form controls, native radio group, U5 focus move), so they guard existing behaviour. `npm run lint` exit 0; `npx tsc --noEmit` exit 0 (tests query the DOM and use `toMatchObject`, so no not-yet-existing export is imported) | 2026-11-03 |
| 2 | implement (green) | `npm test` (web/); `npm run lint`; `npx tsc --noEmit`; `sha256sum -c docs/gates/T3-G2.sha256`; `git diff --stat main -- openapi.yaml` | 59 (4 files: 32 T2 + 27 T3) | 0 | None. All 22 red tests now pass; the 5 U10 guard tests still pass. Lint exit 0; tsc exit 0. Test-file fingerprint: all 7 files OK (tests unchanged since G2). `openapi.yaml` diff vs main empty. Comment greps: `git grep "TODO(T3)" -- web` no match; no `console.log`/`console.debug`; no TODO in web source or tests. Only Node `ExperimentalWarning` lines from tooling in the output, no React act() warnings. U9 and U10 visible-focus manual checks not run (owner, G3 browser review) | 2026-11-03 |
| 3 | implement (browser-review fix) | `npm test` (web/); `npm run lint`; `npx tsc --noEmit`; `sha256sum -c --quiet docs/gates/T3-G2.sha256` (repo root) | 59 (4 files) | 0 | None. Visual-only change to `EmptyState.tsx` (`max-w-prose` moved from the panel to its text). Lint exit 0; tsc exit 0; fingerprint check exit 0, no output (all test files unchanged since G2) | 2026-11-03 |
| 4 | implement (G3) | main session: `pytest -q`, `ruff check`, `ruff format --check` (api/); `npm test`, `npm run lint`, `npx tsc --noEmit` (web/); `sha256sum -c --quiet docs/gates/T3-G2.sha256` | 45 api + 59 web | 0 | All green after the browser-review fix; fingerprint OK; lint, format and typecheck exit 0 | 2026-11-03 |
| 5 | implement (G3 manual) | headless Chrome capture at 375 by 812 and 1280 by 900 (real API) | U9, U10 visible focus, U7/U8 real-API path | 0 | 15 screenshots in `docs/evidence/T3-*.png`; `scrollWidth == clientWidth` in every state; Retry 48 px; Space and Enter on Retry each sent a retry; owner judged pass after the empty-panel width fix | 2026-11-03 |
| 6 | review loop R1 | `npx vitest run app/states.test.tsx --reporter=verbose`; `npm test`; `npm run lint`; `npx tsc --noEmit` (web/); `sha256sum -c --quiet docs/gates/T3-G2.sha256` (repo root) | 60 (4 files: 59 + 1 new U8) | 0 | None. New owner-approved test "U8: a 503 without a usable detail shows the fixed failure copy" (`mockFetch503({})`) passes at once: it guards the existing fallback in `failureMessage` (`HotelAssistant.tsx`). It would fail for the right reason without the fallback: with no `detail` and no `UNAVAILABLE_COPY` return, the failure region would hold no body text and `getByText(FIXED_FAILURE_COPY)` would throw "Unable to find an element with the text". Lint exit 0; tsc exit 0. Fingerprint check exit 1: only `web/app/states.test.tsx` FAILED, as expected for the approved edit; fingerprint not regenerated (main session) | 2026-11-03 |
| 7 | review loop (G3 rerun) | main session: fingerprint re-saved; `pytest -q`, `ruff check`, `ruff format --check`; `npm test`, `npm run lint`, `npx tsc --noEmit`; `sha256sum -c --quiet docs/gates/T3-G2.sha256`; comment greps; secret scan | 45 api + 60 web | 0 | All green; fingerprint OK after the approved R1 edit | 2026-11-03 |

## 12. Implementation notes
**Files:**
- `web/lib/recommendations.ts` (changed): exports `RecommendationErrorKind` and `RecommendationError` (`kind`, optional `detail`); a rejected `fetch` becomes `kind: "network"`, a 503 becomes `kind: "unavailable"` with `detail` read by a private `readDetail` (only a string `detail` from a JSON body), any other non-2xx becomes `kind: "unexpected"`. Stale "T2 scope" comment replaced; header and TSDoc updated.
- `web/components/EmptyState.tsx` (new): Option A panel (`h3` "No hotels to show", guidance with id `empty-guidance`, demo note, `SearchX` icon `aria-hidden`).
- `web/components/FailureState.tsx` (new): `section` with `aria-labelledby="failure-heading"`, `aria-describedby="failure-body"`, `tabIndex={-1}`, `focus:outline-none`; amber left accent; `h2`, body, demo note, Retry `<button type="button">` (`RotateCw` icon `aria-hidden`, `min-h-11 w-full md:w-auto px-6 py-3`, `focus-visible:ring-2 ring-indigo-500 ring-offset-2 ring-offset-white`). Props `message`, `onRetry`, `sectionRef`.
- `web/components/Results.tsx` (changed): renders `EmptyState` instead of the grid when `hotels` is empty and sets `aria-describedby` to the assistant message (`assistant-message`) and the guidance; `TODO(T3)` removed; assistant message text gets `min-w-0 wrap-anywhere` (U9).
- `web/components/HotelAssistant.tsx` (changed): adds `failure` state and `lastRequestRef`; `send(request)` (was `handleSubmit`) stores the request, clears response, failure and selection, and maps errors to copy through a private `failureMessage`; `handleRetry` re-sends `lastRequestRef.current`; one effect focuses whichever outcome mounted; `focusResults` renamed to `focusOutcome`; `TODO(T3)` removed.
- `web/components/HotelCard.tsx`, `web/components/SelectionSummary.tsx` (changed, U9 hardening): `wrap-anywhere` on the hotel name label (plus `min-w-0`), explanation and summary sentence; headers cite U9.
- `APPROACH.md`: only the "Mock boundaries" section written (Q6); no other section touched.

**Key choices:**
- `lastRequest` is a ref, not state: it never drives rendering, and Retry must read the request as sent, not the current fields (U8, section 6).
- Retry calls the same `send` path as a submit, so the U6 clearing rule, U3 loading and the outcome focus move are shared; the failure section (and Retry) unmount at once, so a second retry cannot be sent and the disabled "Find hotels" blocks a submit (section 8, "Retry while pending: removed").
- Focus effect depends on `[response, failure]`; a retry that fails again goes null then message, so the effect re-runs and focus returns to the failure section even when the text is identical.
- Failure copy lives in `HotelAssistant` (`failureMessage`), keyed off `RecommendationError.kind`; anything not a `RecommendationError` (for example an unreadable 200 body, section 16) also gets the fixed copy, so the page never goes blank.
- U9 wrapping uses Tailwind 4's `wrap-anywhere` (`overflow-wrap: anywhere`) rather than `break-words` (`overflow-wrap: break-word`), because section 8 asks for `anywhere` for unbroken strings and only `anywhere` lowers the min-content width inside flex rows.
- No `role="alert"` and no new live region; the status region is unchanged (section 8, announcement without doubling). No new dependencies; icons come from the installed lucide-react.
- Owner browser-review fix (visual only, no behaviour change): `max-w-prose` moved from the `EmptyState` panel `div` to its `h3` and both `p` elements, so the "No hotels to show" panel is full width in the container like the failure card and only its text is capped, as section 8 specifies.

## 13. Review findings
Review link and verdict summary: [T3-review](../../reviews/T3-review.md). No blockers; 2 should, 4 nit. Fixed: R1 (U8 test for a 503 without a usable `detail`, added by the tester with owner approval after G2; fingerprint re-saved; 60 web tests pass), R5 (statuses and evidence at G4 Part A), R6 (section 16 risk widened). Accepted: R2, R3, R4 (reasons in the review and section 16).

## 14. Gate results
| Gate | Pass/Fail | Report | Date |
|---|---|---|---|
| G0 | PASS | [T3-G0](../../gates/T3-G0.md) | 2026-11-03 |
| G1 | PASS | [T3-G1](../../gates/T3-G1.md) | 2026-11-03 |
| G2 | PASS (1 owner waiver; fingerprint re-saved after approved R1 test edit) | [T3-G2](../../gates/T3-G2.md), [fingerprint](../../gates/T3-G2.sha256) | 2026-11-03 |
| G3 | PASS (rerun after review R1: 60 web tests, fingerprint re-saved) | [T3-G3](../../gates/T3-G3.md) | 2026-11-03 |
| G4 Part A | PASS | [T3-G4](../../gates/T3-G4.md) | 2026-11-03 |

## 15. Handoff log
| From → to | Summary | Approved by owner | Time |
|---|---|---|---|
| planner → main session | Sections 4, 5, 6, 9 and 10 written: Given/When/Then criteria for U7, U8, U9, U10, Q1, Q6 and Q8; 23 planned Vitest rows (2 conditional on questions 1 and 2) in new `web/app/states.test.tsx` and `web/app/keyboard.test.tsx` plus 2 in `web/lib/recommendations.test.ts`; 3 manual rows (U9, U10 visible focus, real-API U7/U8) and 3 inspection rows (Q1, Q6, Q8); 4 open questions; no new packages; contract impact none. Planner notes for the ui-designer added at the top of section 8. Next: ui-designer (section 8), then owner answers, then G1. | Yes: questions answered (section 6), plan approved at G1 | 2026-11-03 |
| ui-designer → main session | Section 8 written: shared rules (results slot, no empty right column, focus-move announcement with no new `role="alert"` or live region, Retry removed while pending, Retry button spec, U9/U10 hardening). Option A "Quiet panel in the results slot" (recommended: empty state keeps "Recommended hotels", amber failure card "We could not get recommendations", no outline on focused sections) and Option B "Outcome cards with their own heading and visible focus" ("No hotels found" / "Something went wrong", tinted cards, `focus:ring-2` on the focused card), each wireframed at desktop and 375 px for empty, failure and retry pending; components; draft copy by failure kind; states (empty, failure, retry pending, success, empty or failure on retry, resubmit, validation from empty or failure); keyboard map. 4 owner questions. "Choice and why" and "Browser-review changes" left for the owner. Next: owner answers, then G1, then tester. | Yes: owner chose Option A, answered all questions and approved the plan at G1 | 2026-11-03 |
| main session → tester | Plan complete, G0 and G1 PASS; Option A and all owner answers recorded. Next: tester writes the failing tests in section 10 and runs G2 via `/task-test` | Yes (2026-11-03) | 2026-11-03 |
| tester → main session | All 24 automated rows in section 10 written (27 test cases with the parametrised rows): `web/app/states.test.tsx` (U7 ×4, U8 ×13), `web/app/keyboard.test.tsx` (U10 ×8), 2 U8 rows added to `web/lib/recommendations.test.ts`; `ERROR_BODY`, `mockFetch503`, `mockFetchNetworkError`, plus small `networkError` and `neverSettles` helpers added to `web/test/mockFetch.ts`. T2 tests untouched. Run 1: 37 passed, 22 failed, all for missing behaviour; 5 U10 tests pass at once because T2 built the behaviour (section 11). Lint and tsc clean. Design couplings for the owner: U8 client rows assert the section 8 typed error fields (`kind`, `detail`); U7 fixture-label and focus rows wait for the "No hotels to show" panel first. Next: G2, then implementer | | 2026-11-03 |
| main session → implementer | Test phase complete, G2 PASS (owner waiver for 5 U10 guard tests); 22 failing tests. Next: implementer makes them pass and runs G3 via `/task-implement` | Yes (2026-11-03) | 2026-11-03 |
| implementer → main session | Green: typed `RecommendationError` in `lib/recommendations.ts`; new `EmptyState` and `FailureState`; `Results` and `HotelAssistant` handle empty, failure, `lastRequest` Retry and outcome focus; U9 wrapping on existing components; both `TODO(T3)` removed; APPROACH "Mock boundaries" written (Q6). Run 2: 59 passed, 0 failed; lint and tsc clean; fingerprint OK; `openapi.yaml` unchanged. Not done by the implementer: U9/U10 visible-focus manual checks and screenshots (owner, G3 browser review). Next: owner browser review, G3, then reviewer | | 2026-11-03 |
| main session → reviewer | Implement phase complete, G3 PASS; owner browser review passed after the empty-panel width fix; 15 screenshots in docs/evidence. Next: reviewer via `/task-review` | Yes (2026-11-03) | 2026-11-03 |
| tester → main session | Review loop R1 (owner-approved test edit after G2): added "U8: a 503 without a usable detail shows the fixed failure copy" to `web/app/states.test.tsx` (`mockFetch503({})`, asserts `FIXED_FAILURE_COPY` and Retry in the failure region). Run 6: 60 passed, 0 failed; lint and tsc clean. The test passes at once (guards existing behaviour). Fingerprint now differs for `states.test.tsx` only; main session re-saves `docs/gates/T3-G2.sha256` and reruns G3 checks. No other test, app code or `openapi.yaml` touched. Next: main session | | 2026-11-03 |

## 16. Not verified / risks
- user-event 14 models radio-group tab stops and arrow-key selection on radios, but not every browser detail. If a U10 keyboard test cannot be expressed in jsdom (for example, Tab skipping unchecked radios), the tester reports it in red and the owner decides whether to move it to the U10 manual row; the test is not weakened silently.
- Native `<select>` keyboard behaviour (arrow keys, Alt+Arrow Down) is not modelled by user-event, so it is covered only by the U10 manual check.
- A 200 with invalid JSON or a body that does not match the schema is not tested (owner accepted, section 6; widened by review R6). Invalid JSON makes `response.json()` throw inside the `catch`, so the failure state shows. Valid JSON of the wrong shape (for example no `hotels`) would throw during render of `Results`, outside the `catch`, so the failure state would not show. Outside the contract and not reachable with the fixture API.
- Review R2 (accepted): the resubmit-from-empty and resubmit-from-failure tests check the new outcome but not that the old state is cleared while the new request is pending; the Retry test covers clearing while pending through the same `send()` path.
- Review R3 (accepted): Tab to the checked radio (when one is checked) is untested; native radio-group behaviour.
- Review R4 (accepted): the Retry test compares the retry's Content-Type with a literal rather than the first call's headers; equivalent today because both calls come from the same client function.
- Evidence screenshots were captured by the main session with headless Chrome at the owner's request (section 7), not by the owner by hand.
- Screen-reader announcement of the empty and failure states is inferred from the focus move and the live-region design, not tested with a real screen reader.
- The no-outline rule on script-focused sections (T2 owner choice) may conflict with U10's "visible focus"; the owner kept it (no outline) and it is recorded as a U10 deviation in section 7.
- Tests depend on section 8 copy. If the copy changes after G2, the affected tests need owner-approved edits.

## 17. Commits & pushes
| Hash | Message | Branch | Pushed | Date |
|---|---|---|---|---|

## 18. Time spent
2026-11-03 20:39–21:40, 61 minutes (G0 to G4 Part A, including the owner's browser review and review verdicts). Running total 218 of 240 minutes ([time log](../../time-log.md)).

## 19. Closure
| Field | Value |
|---|---|
| Date | 2026-11-03 |
| Merge hash | Recorded in CURRENT_TASK.md under Completed tasks; not known when this doc is archived |
| Archived | 2026-11-03, `docs/tasks/completed/T3-web-states-accessibility.md` |
