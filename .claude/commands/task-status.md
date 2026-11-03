---
description: Print where work stands, including the current task, last gate and test results, next step, and all tasks. Changes nothing.
---

First read `.claude/flows/agent-handoff.md`, `.claude/flows/agents.md`, `docs/tasks/CURRENT_TASK.md` and the active task doc.

Print:
- the contents of `CURRENT_TASK.md`
- open clarifications
- last gate result
- last test results
- last pushed commit
- next agent and command
- a table of all tasks: ID | status | doc location

Change nothing.
