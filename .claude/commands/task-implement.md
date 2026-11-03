---
description: Make the active task's failing tests pass, run all checks and the owner's browser review, run G3 and commit.
---

First read `.claude/flows/agent-handoff.md`, `.claude/flows/agents.md`, `docs/tasks/CURRENT_TASK.md` and the active task doc.

1. Run the **implementer** agent.
2. Run all checks.
3. Frontend tasks: start the dev server and ask the owner to review at 375px and desktop. Record the feedback in section 8 of the task doc. Behaviour changes go back to the **tester** first.
4. Run G3 with the gate-check skill and save the report.
5. Commit `feat(<scope>): <ID> <summary>`, plus `refactor(<scope>): ...` if there was a refactor.
6. Follow the handoff protocol. Next: **reviewer** via `/task-review`.
