# Hotel Assistant: project context

**Session-start rule: at the start of every session, read `docs/tasks/CURRENT_TASK.md` and the active task doc, then resume from "Next step".**

## Task
A traveller can ask for a hotel, review the assistant's recommendations, and choose one. Maximum 4 hours; requirement IDs are in `docs/requirements.md`.

Example input: "Find a Wellington hotel for two nights, up to NZD 250 per night; breakfast preferred."

**In scope:** fixture-backed API, web journey (ask, review, select), empty and failure states, small-screen and keyboard use, tests, evidence, docs.
**Out of scope:** natural-language interpretation, live LLM, streaming, scraping, real booking, auth, database, deployment, Serko systems.

## Stack
- `web/`: Next.js App Router, React, TypeScript, Tailwind CSS. Vitest + React Testing Library (user-event, jest-dom, jsdom). ESLint from create-next-app.
- `api/`: Python FastAPI + Pydantic. pytest + TestClient (httpx, jsonschema, PyYAML for contract tests). ruff.
- `e2e/`: Playwright.
- Public packages only. Record runtime versions in the README.

## API contract summary (`openapi.yaml` is the source of truth)
`POST /recommendations` with `{message, scenario}`, both required.
- `message`: at least one non-whitespace character, max 1000 chars (DEC-3).
- `scenario`: required demo control, `success | empty | error`, no default (DEC-1).

| Scenario | Status | Body |
|---|---|---|
| success | 200, after `FIXTURE_DELAY_MS` (default 800; DEC-5) | `{message, hotels: [h1, h2, h3], source: "fixture"}` |
| empty | 200 | `{message, hotels: [], source: "fixture"}` (DEC-2) |
| error | 503 | `{detail: "<user-safe message>"}` (DEC-4) |
| invalid input | 422 | FastAPI's default shape (DEC-3) |

| id | name | nightlyPrice | currency | breakfastIncluded | explanation |
|---|---|---|---|---|---|
| h1 | Harbour House | 220 | NZD | true | Within budget; breakfast included. |
| h2 | City Garden | 245 | NZD | true | Near the meeting district. |
| h3 | Quay Rooms | 195 | NZD | false | Lower price; breakfast costs extra. |

## UI requirements
Labelled message input and scenario control; client-side empty-message guard; progress while waiting; assistant message; hotel cards (name, nightly price, currency, breakfast, explanation, fixture label); select one hotel and show a clear summary; empty state; recoverable failure with Retry; usable at 375px; keyboard access with visible focus.

## Commands
```
# api (from api/)   Windows activation: .venv\Scripts\activate
python -m venv .venv
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
pytest -q
ruff check
ruff format --check

# web (from web/)
npm install
npm run dev
npm test
npm run lint
npx tsc --noEmit

# e2e (from e2e/)
npx playwright test
```

## Folder layout (what loads when)
```
CLAUDE.md                        auto-loaded → imports @AGENTS.md
AGENTS.md                        tool-neutral project context
openapi.yaml                     API contract (committed before any code)
.claude/
  settings.json                  deny reading .env files; ask before push/merge
  rules/                         ALWAYS-ON (auto-loaded as project memory)
    tdd.md  branching.md  gates.md  code-quality.md  contract-and-secrets.md
  skills/                        ON DEMAND by description; agents are also told which to use
    web-testing/SKILL.md  api-testing/SKILL.md  accessible-ui/SKILL.md
    code-comments/SKILL.md  gate-check/SKILL.md
  agents/                        subagents (auto-discovered)
    planner.md  ui-designer.md  tester.md  implementer.md  reviewer.md
  commands/                      slash commands (auto-discovered)
    task-plan.md  task-test.md  task-implement.md  task-review.md  task-gate.md  task-status.md
  flows/                         READ by every command
    agent-handoff.md  agents.md
  instructions/                  TEMPLATES read by agents/commands
    task-doc-template.md  review-template.md  gate-report-template.md
docs/
  requirements.md                requirement register + coverage + task index
  tasks/                         active + not-started task docs, CURRENT_TASK.md
    completed/                   finished task docs (moved on close; read-only)
  gates/                         gate reports <ID>-G<n>.md
  reviews/  evidence/  manual-checks.md  contract-changes.md  agent-log.md  time-log.md
```
`flows/` and `instructions/` are not auto-loaded: every command reads the flows first, and every agent names the skills and templates it uses.

## Workflow
1. Commands: `/task-plan <ID>`, `/task-test`, `/task-implement`, `/task-review`, `/task-gate <G0–G5>`, `/task-status`.
2. Handoff: after each phase, print the handoff block from `.claude/flows/agent-handoff.md` and wait for the owner's answer.
3. Gates: G0 to G5 run with the gate-check skill, reports go to `docs/gates/`, and nothing passes without every item passing or an owner waiver.
4. Skills: web-testing, api-testing, accessible-ui, code-comments, gate-check; each agent lists the ones it uses.
5. Comment standard: all code and tests follow the code-comments skill (Q8).
6. Close: archive → close commit → push branch → merge `--no-ff` → checks on main → push main, only after the owner says yes.

## Repo map
| Path | Holds |
|---|---|
| `api/app/`, `api/tests/` | FastAPI app; pytest unit and contract tests |
| `web/` | Next.js app with colocated Vitest tests |
| `e2e/` | Playwright config and specs |
| `docs/requirements.md` | Requirement register, coverage check, task index |
| `docs/tasks/CURRENT_TASK.md` | Short-term memory: where work stands now |
| `docs/tasks/<ID>-<slug>.md` | Single source of truth for a task |
| `README.md`, `APPROACH.md` | Submission docs |
