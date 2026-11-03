# Agent handoff

## Naming
| Name | Meaning | Example |
|---|---|---|
| `<ID>` | Short task ID | `T1` |
| `<slug>` | Task slug | `api-recommendations` |
| Branch | `task/<ID>-<slug>` | `task/T1-api-recommendations` |
| Task doc | `docs/tasks/<ID>-<slug>.md` | `docs/tasks/T1-api-recommendations.md` |
| Gate report | `docs/gates/<ID>-G<n>.md` | `docs/gates/T1-G2.md` |
| Review | `docs/reviews/<ID>-review.md` | `docs/reviews/T1-review.md` |

## (a) State machine
```
G0 → plan (planner [+ ui-designer]) → G1 → test (tester) → G2 → implement (implementer) → G3
   → review (reviewer) → G4 Part A [+ G5 on T4] → archive → close commit → pre-push check
   → push branch → merge → checks on main → push main → G4 Part B → next task
```
Loops:
- implement → test on a behaviour change
- review → test → implement for accepted blockers
- any phase → owner for clarifications

## (b) Agent return payload
```
Status: done | blocked | needs-clarification
Summary: ≤3 bullets
Files changed:
Tests run: command, passed, failed
Comment standard applied: yes/no + notes
Open questions:
Recommended next agent:
```

## (c) Handoff block
```
---
<ID> · <phase> complete · Gate <Gx>: PASS/FAIL (report: docs/gates/<ID>-G<x>.md)
Done: <1–3 bullets>   Tests: <passed> passed / <failed> failed
Commit: <hash> <message>   Pushed: <branch/main or not yet>
Task doc: <path>   Open clarifications: <n or none>
Next agent: <agent> (<phase>) via <command>: <what it will do>
Continue handoff? yes / no / change something
---
```

## (d) Protocol
Update the task doc and `CURRENT_TASK.md`, print the block, then wait for the owner's answer. Use the question tool if available. Between the close commit and the main push, print the block but leave tracked files alone.

- **yes:** log the approval in the task doc's Handoff log and continue straight into the next command in this session.
- **no:** stop. `CURRENT_TASK.md` shows the next command.
- **change:** record it in Decisions & deviations, adjust, and ask again.
- **Gate FAIL:** no handoff. Show the failing items and fix options, and ask the owner to fix or waive.
