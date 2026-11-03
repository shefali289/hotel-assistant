# Branching

- Keep main always green.
- Commit and push the contract and harness on main first.
- Commit nothing during a task. At task close, `/task-review` prints the commit, push and merge commands and the owner runs them.
- Use one branch per task: `task/<ID>-<slug>`, for example `task/T1-api-recommendations`.
- Make no direct commits to main after setup. The exceptions are the owner-approved final commit in `/task-review` step 6 on T4, and harness-only changes (`.claude/`, `AGENTS.md`, `CLAUDE.md`) that the owner commits straight to main from printed commands. After a harness commit on main, rebase the active task branch onto main; its commits are never pushed before close, so this needs no force-push.
- Use Conventional Commits with scope `api | web | e2e | docs | harness`, and include the task ID.
- Agents and the main session never commit, merge or push. The main session archives task docs and prints the commands.
- End each task: archive → pre-push check → the owner runs the printed commands (test commit, feat commit, docs commit, push branch, merge `--no-ff`, checks on main, push main).
- Touch no tracked file while the owner runs the close commands; `git switch main` would refuse or conflict.
- Push only after the owner's explicit yes.
- Never force-push. Never push a red main.
- Delete the local branch after merge; keep the remote branch.
