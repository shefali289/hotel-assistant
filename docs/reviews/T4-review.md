# Review: T4

Task doc: [T4-evidence-documentation](../tasks/completed/T4-evidence-documentation.md)

## Findings
Severity: blocker | should | nit.
Category: requirement | contract | tests/TDD | accessibility | comments/code quality | security | scope.

| # | Severity | Category | File:line | Requirement ID | Finding | Suggested fix | Owner verdict (fix / accept / won't fix + reason) |
|---|---|---|---|---|---|---|---|
| 1 | blocker | requirement | docs/evidence (no T4-agents-md-loaded.png); README.md:120; docs/manual-checks.md:5-6, 11-24; APPROACH.md:104-108; docs/time-log.md | D4, Q5, D3, D7 | The owner-only items are pending. There is no D4 screenshot, so the README Evidence link points to a missing file. Q5 manual checks are blank (browser, date and all 10 rows). APPROACH "Time spent" and "Agent interactions" say only "Written by the owner." The time log has no T4 row. G4 Part A and G5 cannot pass until they exist. | The owner captures the screenshot, records the Q5 rows (rows 4 and 6 note the U10 deviation), writes the two APPROACH sections and adds the T4 time-log row; the time waiver is decided at G5. | fix (owner, standing instruction, 2026-11-03): owner items |
| 2 | should | requirement | docs/requirements.md:39-55; task doc sections 1 and 4 | Q3, Q4, Q7, Q8, D1-D7 | Register rows still say "Not started" (Q8 "In progress") with no evidence; the section 4 statuses and the task-doc header are stale. | The main session updates the register, section 4 and the header at G4 Part A. | fix (owner, standing instruction, 2026-11-03): main session at G4 Part A |
| 3 | nit | requirement | README.md:103; APPROACH.md:6 | U5, D1 | The README says "The cards carry a 'Demo data (fixture)' label", but the code shows one badge beside the "Recommended hotels" heading (web/components/Results.tsx:51-57). | README: "The results carry a 'Demo data (fixture)' label". APPROACH:6 follows the AGENTS.md wording. | fix README, accept APPROACH (owner, standing instruction, 2026-11-03) |
| 4 | nit | requirement | README.md:96-99, 126-129, 46, 32 | D1 | The NO_PROXY and E2E_SCREENSHOTS commands are shown only for Git Bash, although PowerShell is the default shell on the tested OS; `python3` on macOS and Linux and PLAYWRIGHT_BASE_URL are not mentioned. | Add PowerShell forms (`$env:NO_PROXY="localhost,127.0.0.1"; $env:no_proxy=$env:NO_PROXY`, `$env:E2E_SCREENSHOTS="1"`). | fix PowerShell lines, accept the rest (owner, standing instruction, 2026-11-03) |
| 5 | nit | tests/TDD (docs) | README.md:37, 94; e2e/tests/main-journey.spec.ts:81-82 | Q3, D1 | If an API started with `FIXTURE_DELAY_MS=0` is already running, e2e reuses it and Q3's progress assertions could race (inferred, not reproduced). | One Troubleshooting line: stop any API started with FIXTURE_DELAY_MS=0 before running e2e. | fix (owner, standing instruction, 2026-11-03): one line |
| 6 | nit | requirement | docs/evidence/T4-e2e-journey-selected-mobile-375.png | Q3, U9 | The Next.js dev indicator ("N" badge) overlaps the Quay Rooms card in the 375px evidence. Dev-only; not an app defect. | Hiding it needs a web config change (out of scope). | accept (owner, standing instruction, 2026-11-03): dev-only indicator |
| 7 | nit | requirement | docs/evidence/T4-e2e-failure-*.png; README.md:117 | Q4 | The failure screenshots show the scenario control on "Success" beside the "Service error always fails" note, because Q4 forces the 503 in transit. | Add a clause to README:117 explaining that the spec forces the 503 in transit. | fix (owner, standing instruction, 2026-11-03): one clause |
| 8 | nit | comments/code quality | e2e/tests/main-journey.spec.ts:6-55; e2e/tests/failure-retry.spec.ts:6-36 | Q8 | EXAMPLE_MESSAGE, saveEvidence and isRecommendationsPost are duplicated in both specs. | None now: the test files are fingerprinted since G2. | accept (owner, standing instruction, 2026-11-03): two specs; change would reopen G2 |
| 9 | nit | security | docs/tasks/T4-evidence-documentation.md:41, 189 | D6 | The G5 path and email grep will match two lines that quote the scan pattern; neither contains a real path or email. | Accept as false positives at G5, or reword. | accept (owner, standing instruction, 2026-11-03): pattern text, no real path |

## Not verified
- Q3 and Q4 run only in Chromium (as planned).
- R5 was not reproduced.
- README install steps from a fresh clone (G5); PowerShell `.venv\Scripts\activate` and its execution policy were not tried.
- D4, Q5 and the APPROACH owner sections cannot be reviewed until they exist.
- Author identities and the history-wide secret scan (G5).

## Summary
T4 meets Q3, Q4, Q8, D2 and D5. Both e2e specs assert every clause of the Q3 and Q4 criteria against the real API, with no `route.fulfill`. D1 is met apart from the G5 fresh clone and nits R3 to R5 and R7. The agent-drafted parts of D3 and Q7 are complete and consistent with `openapi.yaml` and the code. All checks pass (api 45, web 60, e2e 4; lint, format and typecheck exit 0). The G2 fingerprint matches, `openapi.yaml` is unchanged, and the comment greps and secret scan are clean. T4 changes no app code. One blocker (R1, owner items) gates G4 Part A and G5; R2 is bookkeeping for the main session.
