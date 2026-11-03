---
description: Review the active task, get the owner's verdicts, run G4 (and G5 on T4), archive, then print the commit, push and merge commands for the owner to run.
---

First read `.claude/flows/agent-handoff.md`, `.claude/flows/agents.md`, `docs/tasks/CURRENT_TASK.md` and the active task doc.

1. Run the **reviewer** agent.
2. Save the findings to `docs/reviews/<ID>-review.md` using `.claude/instructions/review-template.md`.
3. Ask the owner for a verdict on each finding. Accepted blockers go to the **tester**, then the **implementer**; re-run G2 and G3 as needed.
4. Update requirement statuses and evidence, and the task doc's status and time.
5. Run G4 Part A with the gate-check skill and save the report. On T4 also run G5.

## Close and push
Nothing has been committed during the task. The owner runs every commit, push and merge from the commands printed here; agents and the main session do not.

If origin is missing, stop and ask the owner.

1. Fill in Closure and set status to done. Move the task doc with a plain move (not `git mv`) to `docs/tasks/completed/<ID>-<slug>.md`. Update all links (requirements, review, CURRENT_TASK, and the archived doc's own relative links) and verify none are broken. The merge hash is not known yet, so Closure points to CURRENT_TASK's Completed tasks.
2. Run the pre-push check from the gate-check skill. Fail: stop and ask the owner.
3. Print the close commands in the owner's shell syntax (PowerShell on Windows), filled in with this task's real file paths, in this order:
   - `git switch task/<ID>-<slug>` (confirms the branch)
   - `git add <test files and test config>`, then `git commit -m "test(<scope>): failing tests for <ID>"`
   - `git add <app code>`, then `git commit -m "feat(<scope>): <ID> <summary>"`
   - `git add -A`, then `git status --short` (the owner checks the list), then `git commit -m "docs(<scope>): plan, review and close <ID>"`
   - `git push -u origin task/<ID>-<slug>`
   - `git switch main`, then `git pull --ff-only`
   - `git merge --no-ff task/<ID>-<slug> -m "merge: <ID> <title>"`
   - all checks on main; if any fail, stop and do not push
   - `git push origin main`
   - `git branch -d task/<ID>-<slug>`

   Separate test and feat commits keep the red-before-green order visible in history. Skip a commit whose file list is empty. From here until main is pushed, touch no tracked file.
4. Wait for the owner to say the commands ran. Ask for any error output, and stop on one.
5. Run G4 Part B: record the hashes in `docs/tasks/CURRENT_TASK.md` and write Part B. These two files stay uncommitted and go into the next task's close commits, as G0 allows.
6. Follow the handoff protocol. Next: **planner** via `/task-plan <next ID>`.

**After T4:** there is no next task to carry the files, and the README still needs the commit. Print the final merge commit, then print the commands for one final commit on main: put that hash in the README, then `git add README.md docs/tasks/CURRENT_TASK.md docs/gates/T4-G4.md`, `git commit -m "docs(docs): record submitted commit for T4"`, all checks, and `git push origin main`.
