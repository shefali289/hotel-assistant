---
description: Review the active task, get the owner's verdicts, run G4 (and G5 on T4), archive, then push and merge after the owner's yes.
---

First read `.claude/flows/agent-handoff.md`, `.claude/flows/agents.md`, `docs/tasks/CURRENT_TASK.md` and the active task doc.

1. Run the **reviewer** agent.
2. Save the findings to `docs/reviews/<ID>-review.md` using `.claude/instructions/review-template.md`.
3. Ask the owner for a verdict on each finding. Accepted blockers go to the **tester**, then the **implementer**; re-run G2 and G3 as needed.
4. Update requirement statuses and evidence, and the task doc's status and time.
5. Run G4 Part A with the gate-check skill and save the report. On T4 also run G5.

## Close and push
If origin is missing, stop and ask the owner.

1. Fill in Closure, set status to done, then `git mv docs/tasks/<ID>-<slug>.md docs/tasks/completed/<ID>-<slug>.md`. Update all links (requirements, review, CURRENT_TASK, and the archived doc's own relative links) and verify none are broken. The merge hash is not known yet, so Closure points to CURRENT_TASK's Completed tasks.
2. Commit `docs(<scope>): close <ID> and archive task doc`. From here until step 6, touch no tracked file.
3. Run the pre-push check from the gate-check skill. Fail: stop and ask the owner.
4. Show the branch, `git log --oneline origin/main..HEAD` and the remote URL. Ask "Push <branch>, merge into main and push main?" and wait for yes.
5. Run these in order:
   - `git push -u origin task/<ID>-<slug>`
   - `git switch main`
   - `git merge --no-ff task/<ID>-<slug> -m "merge: <ID> <title>"`
   - all checks on main (fail: stop, do not push)
   - `git push origin main`
6. Record the hashes in `docs/tasks/CURRENT_TASK.md`, write G4 Part B, and delete the local branch (keep the remote). These two files stay uncommitted and carry into the next task's plan commit, as G0 allows.
7. Follow the handoff protocol. Next: **planner** via `/task-plan <next ID>`.

**After T4:** there is no next task to carry the files, and the README still needs the commit. Print the final branch and merge commit. Ask the owner to approve one final commit on main: put that hash in the README, then commit it with CURRENT_TASK.md and the G4 report as `docs(docs): record submitted commit for T4`. After the owner's yes, run all checks and push main.
