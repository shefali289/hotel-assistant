---
description: Start a task by running G0, creating its branch, planning it with the owner, and running G1. Nothing is committed until the task closes.
argument-hint: <task ID, e.g. T1>
---

Task: $ARGUMENTS

First read `.claude/flows/agent-handoff.md`, `.claude/flows/agents.md`, `docs/tasks/CURRENT_TASK.md` and the task doc `docs/tasks/$ARGUMENTS-<slug>.md`. Names follow the naming section of `agent-handoff.md`.

1. Run G0 with the gate-check skill and save the report. FAIL: stop and follow the gate-failure protocol.
2. Create the branch from main: `git switch -c task/<ID>-<slug>`.
3. Update `docs/tasks/CURRENT_TASK.md`.
4. Run the **planner** agent.
5. Frontend tasks: run the **ui-designer** agent.
6. Ask the owner every clarification, UI and dependency question, and wait. Record the answers, choices and deviations in the task doc.
7. Run G1 with the gate-check skill and save the report.
8. Do not commit. The plan stays uncommitted on the branch until `/task-review` prints the close commands.
9. Follow the handoff protocol. Next: **tester** via `/task-test`.
