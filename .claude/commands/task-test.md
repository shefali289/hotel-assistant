---
description: Write the active task's failing tests, show them failing, and run G2. Nothing is committed until the task closes.
---

First read `.claude/flows/agent-handoff.md`, `.claude/flows/agents.md`, `docs/tasks/CURRENT_TASK.md` and the active task doc.

1. Run the **tester** agent.
2. Show the owner the failing output.
3. Run G2 with the gate-check skill and save the report and the test-file fingerprint. On T4, ask the owner about the G2 waiver planned in the task doc.
4. Do not commit. The tests stay uncommitted until `/task-review` prints the close commands.
5. Follow the handoff protocol. Next: **implementer** via `/task-implement`.
