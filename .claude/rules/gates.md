# Gates

Run every gate with the gate-check skill and report it in `docs/gates/`. A gate passes only if every item passes or the owner waives it.

**G0 Start:** on main; clean tree (only the carry-over files listed in the gate-check skill may be modified); main in sync with origin/main; previous task merged, pushed and archived; task doc in `docs/tasks/`; CURRENT_TASK reflects the previous close (or the initial state for T1).

**G1 Plan:** goal and in/out scope written; every requirement ID has acceptance criteria and at least one planned check (an automated test, or an inspection or manual check where a test cannot apply); clarifications resolved or deferred with reason; new dependencies listed and approved; frontend: UI option, copy, states and keyboard map recorded; contract impact stated; owner approved.

**G2 Red:** every planned automated test exists and is named with its ID; only test/config/doc files changed vs main; tests fail for the right reason (missing behaviour, not broken tests); test files have header comments; run logged; test-file fingerprint saved to `docs/gates/<ID>-G2.sha256`.

**G3 Green:** all tests pass; lint, format and typecheck pass (web: `npm test`, `npm run lint`, `npx tsc --noEmit`; api: `pytest -q`, `ruff check`, `ruff format --check`); test files unchanged since G2, by the fingerprint check (or change approved); `openapi.yaml` unchanged and contract tests pass; comment standard met (headers, docstrings on exports, ID references, no commented-out code, no TODO without ID, no debug logs); frontend reviewed by the owner at 375px and desktop; no secrets; run logged.

**G4 Review, close & push** runs in two parts in one report.
- *Part A, before archiving:* review saved with the owner's verdicts; no open blockers; requirement statuses and evidence updated; deviations, waivers and not-verified items recorded; time logged.
- *Part B, after main is pushed:* task doc archived with links fixed; pre-push check passed; the owner ran the close commands; test, feat and docs commits on the branch in that order; branch pushed; merged `--no-ff`; all checks green on main; main pushed; hashes recorded.
- The gate passes only when Part B is complete.

**G5 Submission (T4 only, before the final push):** every requirement Done or explicitly Not done with reason; README complete (versions, install/run/check commands, env setup, demo path, branch; the commit is filled in after merge); APPROACH complete (the owner's sections written by the owner); AGENTS.md load proof in `docs/evidence`; contract-vs-behaviour check recorded and contract changes logged; evidence screenshots and manual checks present; Q8 comment standard checked across the whole repo; no secrets or PII in tracked files or history; time log total ≤ 240 minutes; a fresh clone into a temp folder installs and passes all tests by following the README.
