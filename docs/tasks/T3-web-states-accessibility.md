# T3: Web states and accessibility

> Single source of truth for this task. Every agent reads it first and appends to it.

## 1. Header
| Field | Value |
|---|---|
| ID | T3 |
| Title | Web states and accessibility |
| Branch | task/T3-web-states-accessibility |
| Status | Not started |
| Phase | plan |
| Current agent | |
| Last updated | |
| Location | active |
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
| U7 | Empty-result state | | Not started |
| U8 | Recoverable failure: 503 or network error shows message + Retry that re-sends the last request | | Not started |
| U9 | Usable at 375px width | | Not started |
| U10 | Keyboard-only operation with visible focus | | Not started |
| Q1 | Component/state tests with Vitest + RTL (states part; closes Q1) | | Not started |
| Q6 | Mock boundaries documented | | Not started |
| Q8 | Code meets the commenting standard (status closed by T4) | | Not started |

## 5. Assumptions & dependencies
**Assumptions:**
- The Mock boundaries section of `APPROACH.md` is where Q6 is documented; the implementer writes that section only.
- jsdom has no layout or CSS, so U9 and U10's visible focus are verified by manual check and screenshot, starting with the owner's browser review at G3. U10's tab order and key handling still get failing Vitest tests.

**Builds on (completed task docs):** T1, T2.

**New packages and owner approval:** none expected.
| Package | Why | Approved by owner |
|---|---|---|

## 6. Clarifications
**Open**
| Question | Asked by | Why it matters |
|---|---|---|

**Resolved**
| Question | Owner's answer | Date |
|---|---|---|
| With the Error scenario, Retry re-sends the same request and fails again, as U8 specifies. To recover in a demo, should the traveller change the scenario and submit again, with Retry left as is? | Yes | 2026-11-03 |

## 7. Decisions & deviations
Includes overrides and gate waivers.
| Agent proposed | Owner chose | Why | Impact |
|---|---|---|---|
| Keep Retry re-sending the last request; the demo recovers by changing the scenario and resubmitting | Yes | U8 specifies the re-send, and the Error scenario always returns 503 | The form stays usable in the failure state and the failure copy must not imply Retry will always work. The README demo path (T4) describes this. Q4 proves Retry recovery separately; see the web-testing skill |

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
