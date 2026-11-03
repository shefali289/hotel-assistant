# Branching

- Keep main always green.
- Commit and push the contract and harness on main first.
- Use one branch per task: `task/<ID>-<slug>`, for example `task/T1-api-recommendations`.
- Make no direct commits to main after setup. The only exception is the owner-approved final commit in `/task-review` step 6 on T4.
- Use Conventional Commits with scope `api | web | e2e | docs | harness`, and include the task ID.
- Only the main session commits, merges, pushes and archives.
- End each task: archive → close commit → push branch → merge `--no-ff` → checks on main → push main.
- Touch no tracked file between the close commit and the main push; `git switch main` would refuse or conflict.
- Push only after the owner's explicit yes.
- Never force-push. Never push a red main.
- Delete the local branch after merge; keep the remote branch.
