# Requirements register

Links point to active task docs and are updated when a doc moves to `tasks/completed/`.

## API
| ID | Requirement | Task | Verified by | Evidence | Status |
|---|---|---|---|---|---|
| A1 | Accepts `{message, scenario}` JSON | [T1](tasks/completed/T1-api-recommendations.md) | pytest | test_validation.py (A1 ×3) | Done |
| A2 | Empty, whitespace-only or too-long message → 422 | [T1](tasks/completed/T1-api-recommendations.md) | pytest | test_validation.py (A2 ×3) | Done |
| A3 | Missing or invalid scenario → 422 | [T1](tasks/completed/T1-api-recommendations.md) | pytest | test_validation.py (A3) | Done |
| A4 | Success → 200, message + exactly the 3 fixtures, after delay | [T1](tasks/completed/T1-api-recommendations.md) | pytest | test_scenarios.py, test_delay.py (A4 ×7) | Done |
| A5 | Empty → 200, hotels `[]` | [T1](tasks/completed/T1-api-recommendations.md) | pytest | test_scenarios.py (A5) | Done |
| A6 | Error → 503 with useful detail | [T1](tasks/completed/T1-api-recommendations.md) | pytest | test_scenarios.py (A6 ×2) | Done |
| A7 | Hotel field names and types (nightlyPrice number, breakfastIncluded boolean) | [T1](tasks/completed/T1-api-recommendations.md) | pytest, contract test | test_scenarios.py (A7 ×2), test_contract.py | Done |
| A8 | Response labelled as fixture | [T1](tasks/completed/T1-api-recommendations.md) | pytest | test_scenarios.py (A8) | Done |
| A9 | Responses validated against `openapi.yaml` (contract test) | [T1](tasks/completed/T1-api-recommendations.md) | contract test | test_contract.py (A9 ×3) | Done |
| A10 | CORS allows the local web origin | [T1](tasks/completed/T1-api-recommendations.md) | pytest | test_cors.py (A10 ×3) | Done |

## UI
| ID | Requirement | Task | Verified by | Evidence | Status |
|---|---|---|---|---|---|
| U1 | Labelled message input + submit | [T2](tasks/completed/T2-web-core-journey.md) | Vitest + RTL | page.test.tsx (U1 ×3), recommendations.test.ts (U1 ×3) | Done |
| U2 | Labelled scenario demo control | [T2](tasks/completed/T2-web-core-journey.md) | Vitest + RTL | page.test.tsx (U2 ×4) | Done |
| U3 | Progress while waiting (submit disabled, aria-live status) | [T2](tasks/completed/T2-web-core-journey.md) | Vitest + RTL | page.test.tsx (U3 ×4) | Done |
| U4 | Assistant message shown | [T2](tasks/completed/T2-web-core-journey.md) | Vitest + RTL | page.test.tsx (U4 ×2) | Done |
| U5 | Hotel cards show name, nightly price, currency, breakfast, explanation, plus fixture label | [T2](tasks/completed/T2-web-core-journey.md) | Vitest + RTL | page.test.tsx (U5 ×6); owner browser review (T2-G3) | Done |
| U6 | Select exactly one hotel → clear summary | [T2](tasks/completed/T2-web-core-journey.md) | Vitest + RTL | page.test.tsx (U6 ×4); owner browser review (T2-G3) | Done |
| U7 | Empty-result state | [T3](tasks/completed/T3-web-states-accessibility.md) | states.test.tsx (U7 ×4); [T3-G3](gates/T3-G3.md); docs/evidence/T3-375-empty.png, T3-1280-empty.png | Done |
| U8 | Recoverable failure: 503 or network error shows message + Retry that re-sends the last request | [T3](tasks/completed/T3-web-states-accessibility.md) | states.test.tsx (U8 ×14), recommendations.test.ts (U8 ×2); [T3-G3](gates/T3-G3.md); docs/evidence/T3-375-failure.png, T3-375-retry-pending.png, T3-1280-failure.png | Done |
| U9 | Usable at 375px width | [T3](tasks/completed/T3-web-states-accessibility.md) | Manual check at G3 (no overflow in 15 states, Retry 48 px); docs/evidence/T3-375-*.png, T3-1280-*.png | Done |
| U10 | Keyboard-only operation with visible focus | [T3](tasks/completed/T3-web-states-accessibility.md) | keyboard.test.tsx (U10 ×8); manual focus check; docs/evidence/T3-focus-*.png; deviation: no outline on script-focused sections (T2, T3 section 7) | Done |
| U11 | Client-side empty-message guard | [T2](tasks/completed/T2-web-core-journey.md) | Vitest + RTL | page.test.tsx (U11 ×6) | Done |

## Quality
| ID | Requirement | Task | Verified by | Evidence | Status |
|---|---|---|---|---|---|
| Q1 | Component/state tests with Vitest + RTL | [T2](tasks/completed/T2-web-core-journey.md) (journey), [T3](tasks/completed/T3-web-states-accessibility.md) (states; closes) | Test suite | T2: 32 web tests ([T2-G3](gates/T2-G3.md)); T3: 60 web tests pass, fetch is the only mock ([T3-G3](gates/T3-G3.md)) | Done |
| Q2 | API validation + contract tests with pytest | [T1](tasks/completed/T1-api-recommendations.md) | Test suite | 45 passed, ruff clean ([T1-G3](gates/T1-G3.md)) | Done |
| Q3 | e2e evidence of main journey | [T4](tasks/completed/T4-evidence-documentation.md) | `e2e/tests/main-journey.spec.ts` 4/4 with Q4 at desktop and 375 ([T4-G3](gates/T4-G3.md)); `docs/evidence/T4-e2e-journey-selected-*.png` | Done |
| Q4 | e2e evidence of failure → retry recovery | [T4](tasks/completed/T4-evidence-documentation.md) | `e2e/tests/failure-retry.spec.ts` real 503 → Retry → 200 at desktop and 375 ([T4-G3](gates/T4-G3.md)); `docs/evidence/T4-e2e-failure-*.png`, `T4-e2e-retry-recovered-*.png` | Done |
| Q5 | Manual keyboard + small-screen checks recorded | [T4](tasks/completed/T4-evidence-documentation.md) | `docs/manual-checks.md`: 7 keyboard and 3 small-screen rows Pass (owner confirmed 2026-11-04; Chrome 156, T3 G3 review; rows 4 and 6 note the U10 deviation) | Done |
| Q6 | Mock boundaries documented | [T3](tasks/completed/T3-web-states-accessibility.md) | `APPROACH.md` Mock boundaries section (web, api, e2e, gaps); [T3-review](reviews/T3-review.md) | Done |
| Q7 | Unverified items listed | [T4](tasks/completed/T4-evidence-documentation.md) | APPROACH "Limitations / not verified" covers the Q7 list ([T4-review](reviews/T4-review.md)); every register ID is Done or Not done with a reason ([T4-G5](gates/T4-G5.md)) | Done |
| Q8 | Code meets the commenting standard (code-comments skill) | [T1](tasks/completed/T1-api-recommendations.md), [T2](tasks/completed/T2-web-core-journey.md), [T3](tasks/completed/T3-web-states-accessibility.md), [T4](tasks/completed/T4-evidence-documentation.md) (closes) | gate-check greps, review | T1: greps empty, review ([T1-review](reviews/T1-review.md)); T2: greps clean, review ([T2-review](reviews/T2-review.md)); T3: greps clean, review ([T3-review](reviews/T3-review.md)); T4: repo-wide greps empty, e2e headers and ID names ([T4-G3](gates/T4-G3.md), [T4-review](reviews/T4-review.md)) | Done |

## Docs
| ID | Requirement | Task | Verified by | Evidence | Status |
|---|---|---|---|---|---|
| D1 | README (runtime versions, install/run/check commands, env setup, fixture/demo path, submitted branch + commit) | [T4](tasks/completed/T4-evidence-documentation.md) | README complete; fresh clone (with this branch's uncommitted files overlaid) installs and passes all checks by following it, after the G5 `npx next typegen` fix ([T4-G5](gates/T4-G5.md)); commit hash added by the final commit on main | Done |
| D2 | `.env.example` placeholders only | [T4](tasks/completed/T4-evidence-documentation.md) | Only `NEXT_PUBLIC_API_BASE_URL` and `FIXTURE_DELAY_MS`; no env file tracked ([T4-review](reviews/T4-review.md)) | Done |
| D3 | `APPROACH.md` complete incl. 2–3 agent interactions labelled Exact/Summary and time spent | [T4](tasks/completed/T4-evidence-documentation.md) | APPROACH complete, no TODO; agent-drafted sections reviewed ([T4-review](reviews/T4-review.md)); Time spent and Agent interactions written by the main session at the owner's instruction (T4 section 7) | Done |
| D4 | `AGENTS.md` proven loaded (screenshot in `docs/evidence`) | [T4](tasks/completed/T4-evidence-documentation.md) | `docs/evidence/T4-agents-md-loaded.png`: fresh Claude Code session quotes the AGENTS.md session-start rule via the CLAUDE.md import | Done |
| D5 | `openapi.yaml` committed before implementation, revisions logged in `docs/contract-changes.md` | [T4](tasks/completed/T4-evidence-documentation.md) | `openapi.yaml` added in `70661f6`, ancestor of first app commit `ab6674c`; no later revisions; `docs/contract-changes.md` says so ([T4-review](reviews/T4-review.md)); contract-vs-behaviour check at G5 | Done |
| D6 | No secrets/PII in repo | [T4](tasks/completed/T4-evidence-documentation.md) | Secret scans clean in working tree, branch and all history; path/email grep only 2 accepted pattern lines (R9); author identity accepted ([T4-G5](gates/T4-G5.md)) | Done |
| D7 | Total time ≤ 4h, stop point explained | [T4](tasks/completed/T4-evidence-documentation.md) | `docs/time-log.md` total 304 of 240 at G4 Part A; overrun recorded and stop point explained in APPROACH Time spent; owner waiver at G5 ([T4-G5](gates/T4-G5.md)) | Not done: 64 minutes over the 4-hour limit (owner chose to finish all scope; waived at G5) |

## Coverage check
| Task | IDs |
|---|---|
| T1 | A1–A10, Q2 |
| T2 | U1–U6, U11, Q1 (journey) |
| T3 | U7–U10, Q1 (states), Q6 |
| T4 | Q3, Q4, Q5, Q7, D1–D7 |
| All | Q8, listed on every task and closed by T4 |

Every ID other than Q8 belongs to exactly one task, with one exception set by the task list: **Q1 is split between T2 (journey) and T3 (states)**. T3 closes its status.

## Task index
| Task | Status | Doc |
|---|---|---|
| T1 | Done (closing) | [T1-api-recommendations](tasks/completed/T1-api-recommendations.md) |
| T2 | Done | [T2-web-core-journey](tasks/completed/T2-web-core-journey.md) |
| T3 | Done | [T3-web-states-accessibility](tasks/completed/T3-web-states-accessibility.md) |
| T4 | Done | [T4-evidence-documentation](tasks/completed/T4-evidence-documentation.md) |
