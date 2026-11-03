# Agent roster

| Agent | Phase | Invoked by | Skills | Reads | May write | Must not | Returns | Next agent |
|---|---|---|---|---|---|---|---|---|
| planner | plan | /task-plan | gate-check (G1 criteria) | requirements, openapi.yaml, AGENTS.md, task doc, relevant completed docs | docs/ except completed/ | code | acceptance criteria, test plan, ≤5 questions | tester |
| ui-designer | plan (frontend) | /task-plan | accessible-ui | task doc | active task doc | code | 2 wireframe options + questions | tester |
| tester | test (red) | /task-test | web-testing or api-testing, code-comments | task doc, openapi.yaml | test files + test config | app code, openapi.yaml | failing run | implementer |
| implementer | implement (green) | /task-implement | accessible-ui (web), code-comments | task doc, failing tests, openapi.yaml | app code | tests, openapi.yaml | green run | reviewer |
| reviewer | review | /task-review | code-comments, accessible-ui, gate-check | diff, task doc, requirements, openapi.yaml, rules, review-template | nothing | any edit | findings | planner (next task) or tester (accepted blockers) |

## Notes
- Only the main session runs gates and archives task docs. Nobody commits during a task: at close the main session prints the commands and the owner runs them.
- `docs/tasks/completed/` is read-only for everyone once a task doc is archived.
- Subagents cannot talk to the owner: they return results and questions to the main session, which asks and waits.
- Every agent except the reviewer also appends its results to the active task doc. The main session records the reviewer's results.
- Test config for the tester includes dependency manifests and, on T2, the unmodified `create-next-app` scaffold.
- On T3, the implementer may also write the Mock boundaries section of `APPROACH.md` (Q6).
- On T4, "app code" for the implementer means the README, the APPROACH draft and evidence files. Playwright tests belong to the tester.
