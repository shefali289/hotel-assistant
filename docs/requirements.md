# Requirements register

Links point to active task docs and are updated when a doc moves to `tasks/completed/`.

## API
| ID | Requirement | Task | Verified by | Evidence | Status |
|---|---|---|---|---|---|
| A1 | Accepts `{message, scenario}` JSON | [T1](tasks/T1-api-recommendations.md) | pytest | | Not started |
| A2 | Empty, whitespace-only or too-long message → 422 | [T1](tasks/T1-api-recommendations.md) | pytest | | Not started |
| A3 | Missing or invalid scenario → 422 | [T1](tasks/T1-api-recommendations.md) | pytest | | Not started |
| A4 | Success → 200, message + exactly the 3 fixtures, after delay | [T1](tasks/T1-api-recommendations.md) | pytest | | Not started |
| A5 | Empty → 200, hotels `[]` | [T1](tasks/T1-api-recommendations.md) | pytest | | Not started |
| A6 | Error → 503 with useful detail | [T1](tasks/T1-api-recommendations.md) | pytest | | Not started |
| A7 | Hotel field names and types (nightlyPrice number, breakfastIncluded boolean) | [T1](tasks/T1-api-recommendations.md) | pytest, contract test | | Not started |
| A8 | Response labelled as fixture | [T1](tasks/T1-api-recommendations.md) | pytest | | Not started |
| A9 | Responses validated against `openapi.yaml` (contract test) | [T1](tasks/T1-api-recommendations.md) | contract test | | Not started |
| A10 | CORS allows the local web origin | [T1](tasks/T1-api-recommendations.md) | pytest | | Not started |

## UI
| ID | Requirement | Task | Verified by | Evidence | Status |
|---|---|---|---|---|---|
| U1 | Labelled message input + submit | [T2](tasks/T2-web-core-journey.md) | Vitest + RTL | | Not started |
| U2 | Labelled scenario demo control | [T2](tasks/T2-web-core-journey.md) | Vitest + RTL | | Not started |
| U3 | Progress while waiting (submit disabled, aria-live status) | [T2](tasks/T2-web-core-journey.md) | Vitest + RTL | | Not started |
| U4 | Assistant message shown | [T2](tasks/T2-web-core-journey.md) | Vitest + RTL | | Not started |
| U5 | Hotel cards show name, nightly price, currency, breakfast, explanation, plus fixture label | [T2](tasks/T2-web-core-journey.md) | Vitest + RTL | | Not started |
| U6 | Select exactly one hotel → clear summary | [T2](tasks/T2-web-core-journey.md) | Vitest + RTL | | Not started |
| U7 | Empty-result state | [T3](tasks/T3-web-states-accessibility.md) | Vitest + RTL | | Not started |
| U8 | Recoverable failure: 503 or network error shows message + Retry that re-sends the last request | [T3](tasks/T3-web-states-accessibility.md) | Vitest + RTL | | Not started |
| U9 | Usable at 375px width | [T3](tasks/T3-web-states-accessibility.md) | Manual check, screenshot | | Not started |
| U10 | Keyboard-only operation with visible focus | [T3](tasks/T3-web-states-accessibility.md) | Vitest + RTL, manual check | | Not started |
| U11 | Client-side empty-message guard | [T2](tasks/T2-web-core-journey.md) | Vitest + RTL | | Not started |

## Quality
| ID | Requirement | Task | Verified by | Evidence | Status |
|---|---|---|---|---|---|
| Q1 | Component/state tests with Vitest + RTL | [T2](tasks/T2-web-core-journey.md) (journey), [T3](tasks/T3-web-states-accessibility.md) (states; closes) | Test suite | | Not started |
| Q2 | API validation + contract tests with pytest | [T1](tasks/T1-api-recommendations.md) | Test suite | | Not started |
| Q3 | e2e evidence of main journey | [T4](tasks/T4-evidence-documentation.md) | Playwright | | Not started |
| Q4 | e2e evidence of failure → retry recovery | [T4](tasks/T4-evidence-documentation.md) | Playwright | | Not started |
| Q5 | Manual keyboard + small-screen checks recorded | [T4](tasks/T4-evidence-documentation.md) | `docs/manual-checks.md` | | Not started |
| Q6 | Mock boundaries documented | [T3](tasks/T3-web-states-accessibility.md) | Inspection of `APPROACH.md` notes | | Not started |
| Q7 | Unverified items listed | [T4](tasks/T4-evidence-documentation.md) | Inspection of `APPROACH.md` | | Not started |
| Q8 | Code meets the commenting standard (code-comments skill) | [T1](tasks/T1-api-recommendations.md), [T2](tasks/T2-web-core-journey.md), [T3](tasks/T3-web-states-accessibility.md), [T4](tasks/T4-evidence-documentation.md) (closes) | gate-check greps, review | | Not started |

## Docs
| ID | Requirement | Task | Verified by | Evidence | Status |
|---|---|---|---|---|---|
| D1 | README (runtime versions, install/run/check commands, env setup, fixture/demo path, submitted branch + commit) | [T4](tasks/T4-evidence-documentation.md) | G5, fresh clone | | Not started |
| D2 | `.env.example` placeholders only | [T4](tasks/T4-evidence-documentation.md) | Inspection | | Not started |
| D3 | `APPROACH.md` complete incl. 2–3 agent interactions labelled Exact/Summary and time spent | [T4](tasks/T4-evidence-documentation.md) | G5 | | Not started |
| D4 | `AGENTS.md` proven loaded (screenshot in `docs/evidence`) | [T4](tasks/T4-evidence-documentation.md) | Screenshot | | Not started |
| D5 | `openapi.yaml` committed before implementation, revisions logged in `docs/contract-changes.md` | [T4](tasks/T4-evidence-documentation.md) | `git log`, contract-vs-behaviour check | | Not started |
| D6 | No secrets/PII in repo | [T4](tasks/T4-evidence-documentation.md) | G5 scans | | Not started |
| D7 | Total time ≤ 4h, stop point explained | [T4](tasks/T4-evidence-documentation.md) | `docs/time-log.md` | | Not started |

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
| T1 | Not started | [T1-api-recommendations](tasks/T1-api-recommendations.md) |
| T2 | Not started | [T2-web-core-journey](tasks/T2-web-core-journey.md) |
| T3 | Not started | [T3-web-states-accessibility](tasks/T3-web-states-accessibility.md) |
| T4 | Not started | [T4-evidence-documentation](tasks/T4-evidence-documentation.md) |
