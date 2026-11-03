# T1: API recommendations

> Single source of truth for this task. Every agent reads it first and appends to it.

## 1. Header
| Field | Value |
|---|---|
| ID | T1 |
| Title | API recommendations |
| Branch | task/T1-api-recommendations |
| Status | Not started |
| Phase | plan |
| Current agent | |
| Last updated | |
| Location | active |
| Skills used | api-testing, code-comments, gate-check |

## 2. Goal
Deliver the FastAPI `POST /recommendations` endpoint so that it matches `openapi.yaml`, proven by pytest unit and contract tests.

## 3. In scope / Out of scope
**In scope:** FastAPI app, fixtures, validation, scenarios, CORS, pytest unit and contract tests.

**Out of scope:** any UI.

## 4. Requirements
Acceptance criteria are written by the planner.
| ID | Requirement | Acceptance criteria (Given/When/Then) | Status |
|---|---|---|---|
| A1 | Accepts `{message, scenario}` JSON | | Not started |
| A2 | Empty, whitespace-only or too-long message → 422 | | Not started |
| A3 | Missing or invalid scenario → 422 | | Not started |
| A4 | Success → 200, message + exactly the 3 fixtures, after delay | | Not started |
| A5 | Empty → 200, hotels `[]` | | Not started |
| A6 | Error → 503 with useful detail | | Not started |
| A7 | Hotel field names and types (nightlyPrice number, breakfastIncluded boolean) | | Not started |
| A8 | Response labelled as fixture | | Not started |
| A9 | Responses validated against `openapi.yaml` (contract test) | | Not started |
| A10 | CORS allows the local web origin | | Not started |
| Q2 | API validation + contract tests with pytest | | Not started |
| Q8 | Code meets the commenting standard (status closed by T4) | | Not started |

## 5. Assumptions & dependencies
**Assumptions:** `openapi.yaml` is committed and pushed on main before this task starts.

**Builds on (completed task docs):** none.

**New packages and owner approval:** named in the brief; confirm at G1.
| Package | Why | Approved by owner |
|---|---|---|
| fastapi, pydantic, uvicorn | API runtime | |
| pytest, httpx | Tests with TestClient | |
| jsonschema, PyYAML | Contract tests | |
| ruff | Lint and format | |

## 6. Clarifications
**Open**
| Question | Asked by | Why it matters |
|---|---|---|

**Resolved**
| Question | Owner's answer | Date |
|---|---|---|

## 7. Decisions & deviations
Includes overrides and gate waivers.
| Agent proposed | Owner chose | Why | Impact |
|---|---|---|---|

## 8. UI co-creation
Not applicable.

## 9. Contract impact

## 10. Test plan
Type: unit | contract | e2e | inspection | manual. Inspection and manual rows are for what a test cannot cover; they name the check and are not part of G2.
| Test or check (with ID) | Type | File | Mock boundary |
|---|---|---|---|

## 11. Test results log
Append only.
| Run # | Phase | Command | Passed | Failed | Failing tests + reason | Date |
|---|---|---|---|---|---|---|

## 12. Implementation notes
**Files:**

**Key choices:**

## 13. Review findings
Review link and verdict summary:

## 14. Gate results
| Gate | Pass/Fail | Report | Date |
|---|---|---|---|

## 15. Handoff log
| From → to | Summary | Approved by owner | Time |
|---|---|---|---|

## 16. Not verified / risks

## 17. Commits & pushes
| Hash | Message | Branch | Pushed | Date |
|---|---|---|---|---|

## 18. Time spent

## 19. Closure
| Field | Value |
|---|---|
| Date | |
| Merge hash | Recorded in CURRENT_TASK.md under Completed tasks; not known when this doc is archived |
| Archived | |
