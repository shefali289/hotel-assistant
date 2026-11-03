---
description: Write the active task's failing tests, show them failing, run G2 and commit them.
---

First read `.claude/flows/agent-handoff.md`, `.claude/flows/agents.md`, `docs/tasks/CURRENT_TASK.md` and the active task doc.

1. Run the **tester** agent.
2. Show the owner the failing output.
3. Run G2 with the gate-check skill and save the report. On T4, ask the owner about the G2 waiver planned in the task doc.
4. Commit `test(<scope>): failing tests for <ID>`.
5. Follow the handoff protocol. Next: **implementer** via `/task-implement`.
