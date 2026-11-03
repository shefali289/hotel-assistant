# Approach

## Scope
TODO (T4)

## Assumptions
TODO (T4)

## Decisions
- **DEC-1:** `scenario` is required (no default).
- **DEC-2:** Responses include `"source": "fixture"`.
- **DEC-3:** `message` must contain a non-whitespace character, max 1000 chars; invalid input returns FastAPI's default 422 shape. The UI also blocks empty submits.
- **DEC-4:** The 503 body is `{"detail": "<user-safe message>"}`.
- **DEC-5:** The success delay comes from env `FIXTURE_DELAY_MS` (default 800; 0 in unit tests).

## Trade-offs
TODO (T4)

## Harness and workflow
TODO (T4): agents, skills, gates, branching

## Checks and evidence
TODO (T4)

## Mock boundaries
Each layer replaces as little as possible, so tests exercise the code that ships (Q6).

| Layer | Real | Replaced |
|---|---|---|
| **web: Vitest + React Testing Library (jsdom)** | The page (`app/page.tsx` default export), every component, React state and effects, and the API client `lib/recommendations.ts`, including its URL building, request body and typed `RecommendationError` mapping | Only global `fetch`, stubbed with `vi.stubGlobal` through the helpers in `web/test/mockFetch.ts` (`mockFetchSuccess`, `mockFetchEmpty`, `mockFetch503`, `mockFetchNetworkError`, `mockFetchPending`, `neverSettles`). Response bodies (`SUCCESS_BODY`, `EMPTY_BODY`, `ERROR_BODY`) are copied from the `openapi.yaml` examples. Multi-call journeys such as fail then Retry stub one `Response` per call (`mockResolvedValueOnce`), because a body can be read only once. `vi.stubEnv` sets `NEXT_PUBLIC_API_BASE_URL` in the client tests. `vitest.setup.ts` calls `vi.unstubAllGlobals()` and `vi.unstubAllEnvs()` after each test. No snapshots; queries go by role, label or text |
| **api: pytest** | The real FastAPI app, run in process through `TestClient` (no network, no server), with real Pydantic validation and the real fixture data | `FIXTURE_DELAY_MS=0` is set for every test by the autouse `no_delay` fixture in `api/tests/conftest.py` (DEC-5). Only the delay tests in `api/tests/test_delay.py` replace `app.main.sleep` with a recorder, so they check the requested delay without waiting 800 ms. The contract tests (`api/tests/test_contract.py`) validate real responses against the schemas in `openapi.yaml` |
| **e2e: Playwright (planned in T4)** | The real API (uvicorn) and the real web app (`npm run dev`) in Chromium, over the real network, with no response mocking (`route.fulfill` is not used) | Nothing in the main journey (Q3). The 503 then Retry spec (Q4) only rewrites the first request's `scenario` to `error` in transit with `route.continue`, so the real API sends a real 503 and then a real 200 for the unchanged retry |

**What the mocks cannot prove, and where it is checked instead:**
- **Browser CORS and the real network.** Vitest's stubbed `fetch` makes no HTTP request, so it cannot show that the browser accepts the API's CORS headers or that the web app reaches `http://localhost:8000`. The api suite checks the CORS headers in process (`api/tests/test_cors.py`); the owner's G3 browser review and the T4 e2e specs check the real browser path.
- **That the stubbed bodies match the real API.** The web stubs are copies of the `openapi.yaml` examples, and the api contract tests prove the real responses match `openapi.yaml`. Together they link the two sides, but only the e2e specs run them against each other.
- **Layout and visible focus.** jsdom has no layout or CSS, so the 375px layout (U9) and the visible focus rings (U10) are owner manual checks with screenshots in `docs/evidence/`, not Vitest tests.
- **The real delay.** api tests run with no delay, so the 800 ms wait and the progress state it causes are seen only in the browser review and e2e.

## Limitations / not verified
TODO (T4)

## Next steps
TODO (T4)

## Time spent
TODO (T4): written by the project owner

## Agent interactions
TODO (T4): written by the project owner; 2–3 interactions labelled Exact or Summary

## Contract revisions
TODO (T4): summarise `docs/contract-changes.md`
