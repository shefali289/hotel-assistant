# Approach

## Scope
A traveller types a request, sees the assistant's recommendations, reviews them and chooses one hotel. The build covers:
- **API (T1):** FastAPI `POST /recommendations` with `{message, scenario}`, served from three fixture hotels, with validation, an 800 ms success delay, empty and 503 scenarios, CORS for the local web app, and contract tests against `openapi.yaml`.
- **Web (T2, T3):** a Next.js page with a labelled message input and scenario control, an empty-message guard, progress while waiting, the assistant message, hotel cards with a fixture label, single selection with a summary, an empty state, a recoverable failure with Retry, a 375px layout and full keyboard use.
- **Evidence and docs (T4):** Playwright end-to-end specs against the real servers, screenshots, manual checks, this document and the README.

Out of scope, as the brief sets: interpreting the message, a live LLM, streaming, scraping, real booking, auth, a database, deployment and Serko systems.

## Assumptions
- The message is shown and sent but not interpreted. The same three fixtures come back whatever it says, so the budget and breakfast preference in the example are not applied.
- `scenario` is a visible demo control ("Demo scenario (test control)"), not a traveller preference. It lets a reviewer reach the success, empty and failure states on purpose (DEC-1).
- Prices are nightly prices in the hotel's currency (NZD in all fixtures); no totals, taxes or currency conversion.
- Selecting a hotel is the end of the journey. The summary says "No booking has been made".
- One local user on localhost: the API allows only `http://localhost:3000` and `http://127.0.0.1:3000` as origins.
- The tested platform is Windows 11 with Node 23.1.0 and Python 3.12.7, in Chromium.

## Decisions
- **DEC-1:** `scenario` is required (no default).
- **DEC-2:** Responses include `"source": "fixture"`.
- **DEC-3:** `message` must contain a non-whitespace character, max 1000 chars; invalid input returns FastAPI's default 422 shape. The UI also blocks empty submits.
- **DEC-4:** The 503 body is `{"detail": "<user-safe message>"}`.
- **DEC-5:** The success delay comes from env `FIXTURE_DELAY_MS` (default 800; 0 in unit tests).

## Trade-offs
- **Contract first.** `openapi.yaml` was committed before any app code, and both sides are tested against it (api contract tests; web stubs copied from its examples). This cost some design time up front but kept the API and web work independent.
- **Fixtures instead of interpretation.** A fixed response makes every state reproducible and testable, at the cost of not answering the message. The response says `source: "fixture"` (DEC-2) and the UI labels it, so nobody mistakes it for a real search.
- **A required scenario control (DEC-1).** With no default, a client cannot silently get success. The cost is one extra field in every request.
- **Retry re-sends the last request (U8).** This is the honest meaning of Retry. Under the Service error scenario it fails again by design; the failure card says how to recover (change the scenario), and the e2e Q4 spec proves that Retry recovers once the service answers (T3 section 7).
- **Native controls.** A `<select>` for the scenario and radio inputs inside the hotel cards give keyboard and screen-reader behaviour for free. Their finer keyboard behaviour is browser-defined, so it is checked by hand rather than in jsdom.
- **No outline on script-focused sections.** After a response, focus moves to the results, empty or failure section so keyboard users keep their place. The owner chose no visible outline on those sections; every interactive control keeps a visible focus ring. This is recorded as a U10 deviation.
- **Smallest mock boundary.** Web tests stub only `fetch`, api tests use the real app in process, and e2e mocks no response. More setup per test, but the tests exercise the shipped code (see Mock boundaries).
- **e2e failure by rewriting the request, not faking the response.** Q4 changes only the first request's `scenario` to `error` in transit, so the 503 and the 200 both come from the real API.
- **Opt-in screenshots.** e2e writes the evidence PNGs only with `E2E_SCREENSHOTS=1`, so routine runs and the checks on `main` leave tracked files alone.
- **Exact pins on the development runtime.** Dependencies are pinned to versions that work on Node 23.1.0. Vitest 4, which fixes the npm audit findings, does not support Node 23.1, so the findings in dev-only test tooling were accepted (T2 section 7).

## Harness and workflow
The work ran in Claude Code with a harness committed to the repo before any app code.
- **Context:** `CLAUDE.md` imports `AGENTS.md`, which holds the task, stack, contract summary, commands and a session-start rule (read `docs/tasks/CURRENT_TASK.md` and resume from "Next step"). `CURRENT_TASK.md` is the short-term memory between sessions; each task doc in `docs/tasks/` is the single source of truth for its task.
- **Rules (always loaded):** TDD, branching, gates, code quality, contract and secrets, and visibility (every agent step and command is shown with its result).
- **Skills (loaded on demand):** web-testing, api-testing, accessible-ui, code-comments (the Q8 commenting standard) and gate-check (gate procedure and commands).
- **Agents:** planner (criteria, test plan, questions), ui-designer (two wireframe options for the owner), tester (writes failing tests only), implementer (writes code only) and reviewer (read-only findings). Each returns a fixed payload with an activity log. Subagents cannot ask the owner, so the main session relays questions.
- **Commands and gates:** `/task-plan`, `/task-test`, `/task-implement`, `/task-review`, `/task-gate`, `/task-status`. Gates G0 (start) to G4 (review, close and push) run on every task, and G5 (submission) on T4. Each gate writes a report to `docs/gates/` and passes only when every item passes or the owner waives it, with the waiver recorded in the task doc.
- **TDD with a fingerprint:** at G2 the failing tests are fingerprinted (`docs/gates/<ID>-G2.sha256`); at G3 the fingerprint must still match, so tests cannot be changed to get green. Test edits after G2 needed the owner's approval and a new fingerprint (T1, T2, T3).
- **Branching:** one branch per task (`task/<ID>-<slug>`). Nothing is committed during a task. At close, the main session archives the task doc and prints the commands; the owner runs the test, feat and docs commits, pushes the branch, merges with `--no-ff`, reruns the checks on `main` and pushes `main`. Agents never commit or push.
- **Owner control:** the owner answered every planning question, chose the UI options, reviewed the app in a browser at G3, and during T4 gave a standing instruction to take the recommended option on each question and auto-approve handoffs, while keeping the final commit and push.

## Checks and evidence
| Layer | What runs | Result |
|---|---|---|
| api | `pytest -q` (validation, scenarios, delay, CORS, contract tests against `openapi.yaml`), `ruff check`, `ruff format --check` | 45 passed; lint and format clean (on `main` after T3) |
| web | `npm test` (Vitest + React Testing Library: journey, states, keyboard, API client), `npm run lint`, `npx tsc --noEmit` | 60 passed; lint and typecheck clean (on `main` after T3) |
| e2e | `npx playwright test` (Q3 main journey, Q4 failure and Retry; Chromium at 1280 and 375), `npx tsc --noEmit` | 4 passed (2 specs at 2 viewports), T4 |
| Manual | Keyboard and 375px checks in [docs/manual-checks.md](docs/manual-checks.md), recorded by the owner | See that file |
| Gates and reviews | G0 to G4 per task, G5 on T4, in [docs/gates](docs/gates/); one review per task in [docs/reviews](docs/reviews/) | See the reports |

Every test name starts with its requirement ID, and [docs/requirements.md](docs/requirements.md) maps each ID to its tests and evidence. Screenshots are in [docs/evidence](docs/evidence/): the e2e journey, failure and recovered states at both widths (`T4-e2e-*.png`), the T3 small-screen and focus captures (`T3-*.png`), and the proof that Claude Code loaded `AGENTS.md` (`T4-agents-md-loaded.png`).

## Mock boundaries
Each layer replaces as little as possible, so tests exercise the code that ships (Q6).

| Layer | Real | Replaced |
|---|---|---|
| **web: Vitest + React Testing Library (jsdom)** | The page (`app/page.tsx` default export), every component, React state and effects, and the API client `lib/recommendations.ts`, including its URL building, request body and typed `RecommendationError` mapping | Only global `fetch`, stubbed with `vi.stubGlobal` through the helpers in `web/test/mockFetch.ts` (`mockFetchSuccess`, `mockFetchEmpty`, `mockFetch503`, `mockFetchNetworkError`, `mockFetchPending`, `neverSettles`). Response bodies (`SUCCESS_BODY`, `EMPTY_BODY`, `ERROR_BODY`) are copied from the `openapi.yaml` examples. Multi-call journeys such as fail then Retry stub one `Response` per call (`mockResolvedValueOnce`), because a body can be read only once. `vi.stubEnv` sets `NEXT_PUBLIC_API_BASE_URL` in the client tests. `vitest.setup.ts` calls `vi.unstubAllGlobals()` and `vi.unstubAllEnvs()` after each test. No snapshots; queries go by role, label or text |
| **api: pytest** | The real FastAPI app, run in process through `TestClient` (no network, no server), with real Pydantic validation and the real fixture data | `FIXTURE_DELAY_MS=0` is set for every test by the autouse `no_delay` fixture in `api/tests/conftest.py` (DEC-5). Only the delay tests in `api/tests/test_delay.py` replace `app.main.sleep` with a recorder, so they check the requested delay without waiting 800 ms. The contract tests (`api/tests/test_contract.py`) validate real responses against the schemas in `openapi.yaml` |
| **e2e: Playwright** (`e2e/tests/main-journey.spec.ts`, `e2e/tests/failure-retry.spec.ts`) | The real API (uvicorn, default 800 ms delay) and the real web app (`npm run dev`), both started by the `webServer` entries in `e2e/playwright.config.ts`, in Chromium at 1280 by 900 and 375 by 812, over real localhost HTTP, with no response mocking (`route.fulfill` is not used) | Nothing in the main journey (Q3), which types the brief's example message and checks the request body, the progress state, the real 200, the three hotels and the selection summary. The failure spec (Q4) only rewrites the first request's `scenario` to `error` in transit with `route.continue`, so the real API sends a real 503 and then a real 200 for the retry, whose body is identical to the first as the UI sent it |

**What the mocks cannot prove, and where it is checked instead:**
- **Browser CORS and the real network.** Vitest's stubbed `fetch` makes no HTTP request, so it cannot show that the browser accepts the API's CORS headers or that the web app reaches `http://localhost:8000`. The api suite checks the CORS headers in process (`api/tests/test_cors.py`); the owner's G3 browser review and the T4 e2e specs check the real browser path.
- **That the stubbed bodies match the real API.** The web stubs are copies of the `openapi.yaml` examples, and the api contract tests prove the real responses match `openapi.yaml`. Together they link the two sides, but only the e2e specs run them against each other.
- **Layout and visible focus.** jsdom has no layout or CSS, so the 375px layout (U9) and the visible focus rings (U10) are owner manual checks with screenshots in `docs/evidence/`, not Vitest tests.
- **The real delay.** api tests run with no delay, so the 800 ms wait and the progress state it causes are seen only in the browser review and e2e.

## Limitations / not verified
Each item was not verified, or only partly, for the reason given.
- **No real screen-reader test.** Announcements (progress, results, empty, failure, validation) are inferred from the live-region and focus design and the jsdom tests; no assistive technology was run.
- **e2e in Chromium only.** Only Chromium is installed for Playwright; Firefox and WebKit were not run.
- **Native `<select>` keyboard checked by hand only.** user-event does not model arrow keys or Alt+Arrow Down on a select, so only the U10 manual check covers it.
- **A 200 with invalid JSON or the wrong body shape is not tested.** It is outside the contract and the fixture API cannot send it. Invalid JSON shows the failure state; valid JSON of the wrong shape would break rendering instead (T3 section 16).
- **T3 evidence was captured by the main session, not the owner.** The T3 small-screen and focus screenshots were taken with headless Chrome at the owner's request, and the owner judged them.
- **U10 deviation: no outline on script-focused sections.** The results, empty and failure sections take focus with no visible outline (owner's choice); every interactive control shows a focus ring.
- **The real 800 ms delay is seen only in the browser and e2e.** api tests run with no delay and check the requested delay with a recorder.
- **The fresh-clone check ran on one OS.** G5 follows the README on Windows; Linux and macOS (venv path `bin/`) were not tried.
- **The message is not interpreted.** Fixtures are fixed, as scoped; the budget and breakfast preference in a request are not applied.
- **Manual checks were not rerun on T4.** The Q5 keyboard and small-screen results come from the T3 G3 browser review on the same app code, plus the T4 e2e 375px screenshots (T4 question 3).
- **Time overrun.** 218 of the 240 minutes were used before T4; the owner chose to finish all of T4 and record the overrun rather than cut scope (T4 question 1). See Time spent.
- **Colour contrast was estimated, not measured.** Values come from the Tailwind palette and the screenshots, judged by eye.
- **CORS in a real browser** was first checked by the owner's T2 browser review and is now covered by the e2e specs; the api suite checks the headers in process only.
- **Timing tests.** The api "not delayed" check has a 0.5 s margin and was not tried on a loaded machine.
- **Dev tooling audit findings.** npm audit reports critical and moderate findings in the Vitest 3 test tooling. The fix (Vitest 4) does not support Node 23.1, so they were accepted; nothing from them ships.
- **Small test gaps accepted in the T3 review (R2 to R4).** Clearing old state while a resubmit is pending (covered through Retry's path), Tab to an already checked radio (native behaviour), and comparing the retry's headers with the first call's rather than a literal.
- **Scaffold files.** `web/next.config.ts` and `web/eslint.config.mjs` were not compared byte for byte with the create-next-app output.
- **Reused servers in e2e.** If a web server is already running on port 3000 without `NEXT_PUBLIC_API_BASE_URL`, e2e reuses it as it is. The client's default base URL is the same value, so this has no effect today.

## Next steps
- Interpret the message (for example with an LLM or a parser) behind the same contract, and filter and rank real inventory by budget, dates and breakfast. This needs a logged contract change, because `source` allows only `fixture` today.
- Validate the response shape in the web client, so a malformed 200 shows the failure state instead of breaking the page.
- Run the e2e specs in Firefox and WebKit, and test with NVDA and VoiceOver.
- Add CI that runs the api, web and e2e checks on every push, on Linux as well as Windows.
- Move to a Node LTS that Vitest 4 supports, to clear the dev tooling audit findings.
- Continue the journey after selection (dates, guests, booking) once a real booking service is in scope.

## Time spent
About 304 minutes in total against a 240-minute limit: T1 50, T2 107, T3 61, T4 86 (to G4 Part A; the G5 checks and close add a little more) (from [docs/time-log.md](docs/time-log.md)).
When T4 started, 22 minutes remained. I chose to finish all of T4 (e2e evidence, README, APPROACH, G5) rather than cut scope, and to record the 64-minute overrun honestly instead of stopping at 240.
Stop point: all T4 scope was finished; nothing was cut for time.

## Agent interactions
1. **Exact.** At T4 I told the main session: "Go with recommendation for all future questions and aut-approve and do hand-off. Ask before final push and commit". It then applied each recommended option, logged every one in the task doc as a standing instruction, and still paused before the final commit.
2. **Summary.** The T4 tester's first Playwright run failed with connection refused. It traced this to the machine's semicolon-separated `NO_PROXY`, which Node ignores, so the proxy answered the health checks and Playwright reused servers that were not running. A comma-separated value fixed it, and the README now documents it.
3. **Summary.** The T4 planner flagged that only 22 of 240 minutes were left and offered a hard stop with scope cuts. I overrode it to finish everything and record the overrun.

## Contract revisions
None. `openapi.yaml` was committed once, in `70661f6` during setup, before the first app-code commit `ab6674c`, and no later commit touches it. [docs/contract-changes.md](docs/contract-changes.md) records "No revisions after the first commit".
