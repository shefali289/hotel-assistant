---
description: Run one gate for the active task and write its report. Changes nothing else; use it to re-check after fixes.
argument-hint: <G0–G5>
---

Gate: $ARGUMENTS

First read `.claude/flows/agent-handoff.md`, `.claude/flows/agents.md`, `docs/tasks/CURRENT_TASK.md` and the active task doc.

1. Run gate $ARGUMENTS for the active task with the gate-check skill.
2. Write the report to `docs/gates/<ID>-$ARGUMENTS.md`.
3. Update the Gate results section of the task doc.

Change nothing else. Do not commit.
