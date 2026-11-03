# T4: Evidence and documentation

> Single source of truth for this task. Every agent reads it first and appends to it.

## 1. Header
| Field | Value |
|---|---|
| ID | T4 |
| Title | Evidence and documentation |
| Branch | task/T4-evidence-documentation |
| Status | Not started |
| Phase | plan |
| Current agent | |
| Last updated | |
| Location | active |
| Skills used | web-testing (Playwright section), gate-check, code-comments |

## 2. Goal
Prove the journey end to end, complete the submission documents, and pass the G5 submission gate.

## 3. In scope / Out of scope
**In scope:** Playwright journey (using the brief's example input as the message) + failure/retry tests against the real local API, screenshots (desktop + 375px) in `docs/evidence`, manual checks, final contract-vs-behaviour check, README (incl. submitted branch + commit), APPROACH draft (the owner writes the agent-interaction and time sections), G5 submission gate.

**Out of scope:** new app behaviour.

## 4. Requirements
Acceptance criteria are written by the planner.
| ID | Requirement | Acceptance criteria (Given/When/Then) | Status |
|---|---|---|---|
| Q3 | e2e evidence of main journey | | Not started |
| Q4 | e2e evidence of failure → retry recovery | | Not started |
| Q5 | Manual keyboard + small-screen checks recorded | | Not started |
| Q7 | Unverified items listed | | Not started |
| Q8 | Code meets the commenting standard (final; closes Q8) | | Not started |
| D1 | README (runtime versions, install/run/check commands, env setup, fixture/demo path, submitted branch + commit) | | Not started |
| D2 | `.env.example` placeholders only | | Not started |
| D3 | `APPROACH.md` complete incl. 2–3 agent interactions labelled Exact/Summary and time spent | | Not started |
| D4 | `AGENTS.md` proven loaded (screenshot in `docs/evidence`) | | Not started |
| D5 | `openapi.yaml` committed before implementation, revisions logged in `docs/contract-changes.md` | | Not started |
| D6 | No secrets/PII in repo | | Not started |
| D7 | Total time ≤ 4h, stop point explained | | Not started |

## 5. Assumptions & dependencies
**Assumptions:** the app's behaviour is complete after T3.

**Builds on (completed task docs):** T1, T2, T3.

**Carried in from T1 review (nit 4, owner deferred to T4, 2026-11-03):** README troubleshooting (D1) should say that on networks with a proxy, localhost requests may be intercepted; set `NO_PROXY=localhost,127.0.0.1` or use `curl --noproxy '*'`. See [T1 review](../reviews/T1-review.md).

**New packages and owner approval:** named in the brief; confirm at G1.
| Package | Why | Approved by owner |
|---|---|---|
| @playwright/test, typescript | e2e tests and typecheck | |

## 6. Clarifications
**Open**
| Question | Asked by | Why it matters |
|---|---|---|
| Will the owner waive the G2 item "tests fail for the right reason" for this task? | Setup | The Playwright tests cover behaviour that exists after T3, so they should pass on first run. A failure would be a real defect. Asked at G2. |

**Resolved**
| Question | Owner's answer | Date |
|---|---|---|

## 7. Decisions & deviations
Includes overrides and gate waivers.
| Agent proposed | Owner chose | Why | Impact |
|---|---|---|---|

## 8. UI co-creation
Not applicable: no UI changes.

## 9. Contract impact
Final contract-vs-behaviour check recorded here.

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
