# Owner decisions

What I (the owner) set up, decided, challenged and verified, as distinct from what the agents produced. Each row links to the record it comes from.

**Labels:** *Exact* means a verbatim excerpt of my direction. Everything else is a *retrospective summary*, compiled after submission from the task docs (section 6 "Clarifications" and section 7 "Decisions & deviations" in [docs/tasks/completed/](tasks/completed/)), the reviews and git history. Rationale is what was recorded at the time, not private model reasoning.

## 1. Framing before any code
- **Contract first.** `openapi.yaml` was committed (`70661f6`) before the harness and before any app code, and was never revised ([contract-changes.md](contract-changes.md)).
- **Harness before tasks.** Harness development started from my initial prompt to Claude Code. It gave the problem statement and every requirement from the brief, plus my decisions on how the work should be run, and the harness was built from that and committed (`1c53e8f`) before any app code. The decisions in that prompt:
  - **Agents:** five, each with one job: planner, ui-designer, tester, implementer and reviewer. The tester may only write tests, the implementer may only write code, and the reviewer edits nothing. No agent commits or pushes, and subagent questions come back to me through the main session.
  - **Gates:** G0 (start) to G4 (review, close and push) on every task, and G5 (submission) on T4. A gate passes only when every item passes or I waive it, and each run writes a report to `docs/gates/`.
  - **Checks:** TDD with failing tests first, test names that start with their requirement ID, and a G2 test-file fingerprint so tests cannot be edited to get green. Lint, format and typecheck on both sides; contract tests against `openapi.yaml`; and manual checks for layout and visible focus, which jsdom cannot test.
  - **Rules:** branching (one branch per task, I run the close commands), contract and secrets (no silent contract changes, no `.env` reads, ask before adding dependencies), code quality and the Q8 comment standard.
  - **Context and memory:** `CLAUDE.md` imports `AGENTS.md`, `docs/tasks/CURRENT_TASK.md` carries state between sessions, and each task has one task doc as its single source of truth.

  The point was to control the agents, not just prompt them.
- **Task split.** I split the work into four tasks, each on its own branch with its own gates: T1 API, T2 web core journey, T3 states and accessibility, T4 evidence and docs.
- **Contract decisions DEC-1 to DEC-5** (see [APPROACH.md](../APPROACH.md#decisions)). For example, `scenario` has no default, so a client can never get success by accident, and every response says `source: "fixture"`.

## 2. Changing the harness when it did not work
During T1 I found two gaps in my own process and fixed them on `main` as harness-only commits:
- `fd04384`: I could not see what the agents were doing, so every agent step, command and result must now be printed, and every handoff lists them (the visibility rule).
- `46337d2`: under the first rules, commits were made during a task (the T1 plan commit). Now nothing is committed until close; the session prints the commands and I run them, so every commit on the branch is mine.

## 3. Decisions where I overrode or redirected the agent
| Task | Agent proposed | I chose | Why |
|---|---|---|---|
| T2 | ui-designer recommended Option A (single column) | Option B, search bar with a side summary | Compact form; the summary stays in view beside the cards on desktop |
| T2 | Plain functional styling | *Exact:* "UI should look good and fancy". I allowed UI libraries if needed and approved lucide-react and framer-motion | Presentation matters to a traveller; WCAG AA contrast and visible focus were still required |
| T2 | Focus moves to the results heading (the approved plan) | At the G3 browser review, *Exact:* "Once find hotels is clicked, focus should go on the recommended hotels part" | The heading focus was invisible after a mouse click. I approved editing the fingerprinted test, and the fingerprint was re-saved |
| T2 | Keep the unused scaffold files and the Google-fetched font | Delete them; use a system font stack | No unused code, and an offline fresh clone must still build |
| T2 | Fix the npm audit findings (needs Vitest 4, which excludes Node 23.1) | Accept them and record them as a risk | Dev tooling only; nothing from it ships |
| T1 | Planner defaults for CORS, delay testing, copy, pinning and extra keys | Accepted all five, after reading each one | They fit the contract and scope |
| T2 | Planner questions 3 and 4 (whitespace handling, pre-T3 failure behaviour) | I asked to see examples before answering both | I would not approve behaviour I could not picture |
| T3 | Retry re-sends the same request, so under the error scenario it always fails | Keep it; the failure copy must not promise that Retry will work, and Q4 in e2e proves that recovery works | The honest meaning of Retry, with the recovery path still proven |
| T3 | Reviewer R1: no test for a 503 without a usable `detail` | Add the test after G2 (approved test edit) | The fallback copy branch had no guard |
| T4 | Planner: hard stop at 240 minutes and cut scope | Finish all T4 scope and record the overrun | I wanted the evidence complete; see section 5 |

## 4. Other decisions I made
Answers to planning questions, from section 6 of each task doc.
- **API edges (T1).** CORS allows a fixed list of two local origins, with no wildcard and no environment variable. Unknown extra request keys are ignored, with a test to prove it. The assistant copy is the `openapi.yaml` examples word for word, so the contract and behaviour cannot drift apart.
- **Input rules (T2).** A whitespace-only message is blocked, but the message is sent exactly as typed. `maxLength={1000}` matches DEC-3, so the UI can never send a message the API would reject for length.
- **Demo control vs contract (T2).** The UI preselects `success` for convenience, while the API keeps `scenario` required with no default (DEC-1). The default lives in the demo control, not in the contract.
- **Failure copy (T3).** A 503 shows the API's user-safe `detail` verbatim. Any other non-2xx and any network error get fixed client copy with Retry, so an unexpected status never leaves the page blank. One test uses a 500.
- **Focus outline (T3).** Sections that receive focus by script have no visible outline, for a consistent look. Every interactive control keeps its focus ring. I recorded this as a U10 deviation instead of claiming full compliance.
- **UI option (T3).** I chose Option A, "Quiet panel in the results slot". It keeps the T2 layout and focus code, so the change stays small.
- **Dependencies (T1, T2, T4).** Every package was approved before install and pinned exactly, including the create-next-app caret ranges the tester wanted to leave as they were. I added `httpx2` to remove a test deprecation warning instead of ignoring the warning.
- **One context file (T2).** Next.js regenerates a `web/AGENTS.md` on every start. I had it ignored in git so the repo-root `AGENTS.md` stays the only context file the agent loads.
- **Evidence hygiene (T4).** I removed the unused `ALLOWED_ORIGINS` and the commented `ANTHROPIC_API_KEY` from `.env.example`, so it lists only variables the code reads. e2e writes screenshots only when `E2E_SCREENSHOTS=1` is set, so routine runs and the checks on `main` leave tracked files untouched.

## 5. What I verified myself
- **Browser review at every frontend G3 (T2, T3)** at 375px and desktop. It led to the focus change above and to one visual fix (the empty panel's width).
- **Manual keyboard and small-screen checks** in [manual-checks.md](manual-checks.md). In T3 I asked the session to capture the screenshots (*Exact:* "capture yourself") and judged pass or fail from them. In T4 I confirmed the checks (*Exact:* "pass all manual checks - verified").
- **Review verdicts.** I gave a fix, accept or won't-fix verdict on every reviewer finding in [reviews/](reviews/).
- **Gate waivers**, each recorded with a reason: the T3 G2 waiver for 5 keyboard guards that passed in red (behaviour built in T2), the T4 G2 waiver for the e2e specs, and the G5 time-limit waiver.
- **Close commands.** I ran every test, feat and docs commit, push and `--no-ff` merge myself, from the printed commands.

## 6. Where I delegated, stated plainly
- **APPROACH owner sections.** The rules reserve "Time spent" and "Agent interactions" for me. I told the session (*Exact:* "fill those info in approach urself") to write them from drafts it had already shown me, and this is recorded in the T4 task doc.
- **Time.** I used about 304 of the 240 minutes. I chose to finish and record the overrun rather than stop ([time-log.md](time-log.md)).
