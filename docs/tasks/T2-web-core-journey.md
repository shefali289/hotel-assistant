# T2: Web core journey

> Single source of truth for this task. Every agent reads it first and appends to it.

## 1. Header
| Field | Value |
|---|---|
| ID | T2 |
| Title | Web core journey |
| Branch | task/T2-web-core-journey |
| Status | Not started |
| Phase | plan |
| Current agent | |
| Last updated | |
| Location | active |
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
| U1 | Labelled message input + submit | | Not started |
| U2 | Labelled scenario demo control | | Not started |
| U3 | Progress while waiting (submit disabled, aria-live status) | | Not started |
| U4 | Assistant message shown | | Not started |
| U5 | Hotel cards show name, nightly price, currency, breakfast, explanation, plus fixture label | | Not started |
| U6 | Select exactly one hotel → clear summary | | Not started |
| U11 | Client-side empty-message guard | | Not started |
| Q1 | Component/state tests with Vitest + RTL (journey part) | | Not started |
| Q8 | Code meets the commenting standard (status closed by T4) | | Not started |

## 5. Assumptions & dependencies
**Assumptions:**
- The red phase needs a runnable project, so the unmodified `create-next-app` scaffold counts as test config for G2. Use `npx create-next-app@latest web --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --disable-git`. Do not keep any nested `AGENTS.md` or `CLAUDE.md` it generates.
- Scaffold files hand-edited in green must meet the comment standard.

**Builds on (completed task docs):** T1.

**New packages and owner approval:** named in the brief, except the Vite React plugin named in the web-testing skill; confirm at G1.
| Package | Why | Approved by owner |
|---|---|---|
| next, react, react-dom, tailwindcss, typescript, eslint | Stack from create-next-app | |
| vitest, jsdom, @vitejs/plugin-react | Test runner and environment | |
| @testing-library/react, user-event, jest-dom | Component tests | |

## 6. Clarifications
**Open**
| Question | Asked by | Why it matters |
|---|---|---|

**Resolved**
| Question | Owner's answer | Date |
|---|---|---|
| Should the message input set `maxLength={1000}`? U11 only guards empty input, and a longer message would return a 422 that no UI state handles. | Yes | 2026-11-03 |

## 7. Decisions & deviations
Includes overrides and gate waivers.
| Agent proposed | Owner chose | Why | Impact |
|---|---|---|---|
| Set `maxLength={1000}` on the message input | Yes | Matches DEC-3, so the UI cannot send a message the API rejects for length | The planner adds it to U11's criteria, with a test; browsers cut pasted text at the limit |

## 8. UI co-creation
**Options:**

**Choice and why:**

**Copy:**

**States:**

**Keyboard map:**

**Browser-review changes:**

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
