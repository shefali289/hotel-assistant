# Agent harness

The Claude Code setup used to build this repo. It was committed before any app code (`1c53e8f`, after the contract `70661f6`) and built from my first prompt to Claude Code. That prompt gave the problem statement, every requirement from the brief, and my decisions on agents, gates, checks and rules. Its purpose is to keep me in control of the agents: each agent has one job and limited write access, each phase ends at a gate, and every commit is run by me.

## How it loads
| What | When Claude Code reads it |
|---|---|
| `CLAUDE.md` → imports `@AGENTS.md` | Auto-loaded at session start. AGENTS.md holds the task, stack, contract summary, commands and repo map. Proof: `docs/evidence/T4-agents-md-loaded.png` |
| `.claude/rules/*.md` | Always loaded, as project memory |
| `.claude/settings.json` | Always applied: blocks reading `.env` files and asks before `git push` or `git merge` |
| `.claude/commands/*.md` | When I type the slash command |
| `.claude/agents/*.md` | When a command starts a subagent |
| `.claude/skills/*/SKILL.md` | On demand, by their description; each agent names the skills it uses |
| `.claude/flows/`, `.claude/instructions/` | Read explicitly by every command and agent (not auto-loaded) |

Session memory: AGENTS.md has a session-start rule to read `docs/tasks/CURRENT_TASK.md` and the active task doc, then resume from "Next step". Each task doc in `docs/tasks/` is the single source of truth for its task.

## Layout
```
.claude/
  settings.json          permissions: deny .env reads; ask before push/merge
  rules/                 always on
    tdd.md               failing test first; tester writes tests, implementer writes code
    branching.md         one branch per task; nothing committed during a task; owner runs close commands
    gates.md             G0–G5 criteria; a gate passes only if every item passes or I waive it
    code-quality.md      small, typed, lint-clean, in scope
    contract-and-secrets.md  openapi.yaml is the source of truth; no silent changes; no secrets
    visibility.md        every agent step and command is printed with its result
  agents/                planner, ui-designer, tester, implementer, reviewer
  commands/              task-plan, task-test, task-implement, task-review, task-gate, task-status
  skills/                web-testing, api-testing, accessible-ui, code-comments, gate-check
  flows/                 agents.md (roster), agent-handoff.md (state machine, payload, handoff block)
  instructions/          task-doc, review and gate-report templates
```

## Agents
| Agent | Phase | May write | Must not |
|---|---|---|---|
| planner | plan | task doc (acceptance criteria, test plan, up to 5 questions) | write code |
| ui-designer | plan (frontend) | task doc (two wireframe options, states, copy, keyboard map) | write code |
| tester | test (red) | test files and test config | touch app code or `openapi.yaml` |
| implementer | implement (green) | app code | touch tests or `openapi.yaml` |
| reviewer | review | nothing (returns findings) | make any edit |

Subagents cannot ask me directly: they return questions to the main session, which asks me and waits. Every agent returns an activity log of its steps and commands, which the main session prints in full. No agent commits, merges or pushes.

## Task lifecycle
| Command | Does | Gate |
|---|---|---|
| `/task-plan <ID>` | Checks the start state, creates `task/<ID>-<slug>`, runs the planner (and ui-designer for frontend), asks me the questions | G0 start, G1 plan |
| `/task-test` | Tester writes failing tests and shows them failing; the test files are fingerprinted | G2 red |
| `/task-implement` | Implementer makes them pass; all checks run; I review frontend work in a browser at 375px and desktop | G3 green |
| `/task-review` | Reviewer returns findings, I give a verdict on each, the task doc is archived, and the close commands are printed for me to run | G4 review and close (G5 submission on T4) |
| `/task-gate <G>` | Re-runs one gate after fixes | any |
| `/task-status` | Shows where work stands; changes nothing | none |

After each phase the main session prints a handoff block (agents run, commands and results, next step) and waits for my answer.

## Safeguards
- **Tests cannot be bent to pass.** The G2 fingerprint (`docs/gates/<ID>-G2.sha256`) must still match at G3. Any test edit after G2 needs my approval and a new fingerprint.
- **Contract first.** `openapi.yaml` changes need a proposal, my approval and an entry in `docs/contract-changes.md`. There were none.
- **Nothing committed during a task.** At close I run the test, feat and docs commits, push the branch, merge with `--no-ff`, rerun the checks on `main` and push `main`.
- **Every check is real.** Rules forbid claiming a check passed without running it; gate reports record each command and its result.
- **No secrets.** `.env` reads are denied, and a secret-pattern scan runs before every push.

## Changes during the work
I changed the harness twice during T1, as harness-only commits on `main`:
- `fd04384`: show the running agent, each step and every command in every phase and handoff.
- `46337d2`: commit only at task close; I run the printed close commands.

Why: see `docs/owner-decisions.md` sections 1 and 2.

## Using it
Open the repo in Claude Code; `CLAUDE.md` loads automatically. Run `/task-status` to see where work stands, then `/task-plan <ID>` to start a task. Requirement IDs and the task index are in `docs/requirements.md`.
