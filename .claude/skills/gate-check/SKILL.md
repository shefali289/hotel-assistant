---
name: gate-check
description: Use to run a gate G0–G5, or the pre-push check, and write its report to docs/gates/. Also use to read a gate's criteria when planning or reviewing a task.
---

# Gate check

Criteria are in `.claude/rules/gates.md`; the procedure and commands are here.

## Procedure
1. Copy `.claude/instructions/gate-report-template.md` to `docs/gates/<ID>-G<n>.md`, for example `docs/gates/T1-G3.md`.
2. Add one row per gate item: check type (`command | inspection | owner`), exact command or method, result (`pass | fail | waived`), evidence (output summary or file).
3. Run every command now. Never reuse an earlier result or assume one.
4. An `owner` item passes only on the owner's explicit answer in this session.
5. Leave out items that do not apply, such as frontend items on T1, and list them under "Not applicable" in the footer.
6. Overall PASS only if every item is pass or waived. A waiver needs the owner's explicit decision, recorded in the task doc's Decisions & deviations.
7. Update the task doc's Gate results. A rerun overwrites the report, and the task doc notes the rerun.

Do not paste the secret patterns into reports: write "secret-pattern scan (gate-check)". Otherwise later scans match the report itself.

Run commands in Bash from the repo root. Venv tools are at `api/.venv/Scripts/` on Windows and `api/.venv/bin/` elsewhere.

## Shared commands
**All checks.** Skip a block only while its folder does not exist yet, and say so in the evidence.
```
(cd api && .venv/Scripts/python -m pytest -q && .venv/Scripts/ruff check && .venv/Scripts/ruff format --check)
(cd web && npm test && npm run lint && npx tsc --noEmit)
(cd e2e && npx playwright test && npx tsc --noEmit)
```
**Comment standard.** Each grep passes when it prints nothing, apart from false positives you have read and dismissed: prose such as `// if the request fails` can match the commented-out code pattern. `--untracked` covers files not committed yet. `set -f` stops the shell expanding the patterns, so git matches them across folders.
```
set -f
SRC="web/*.ts web/*.tsx api/*.py e2e/*.ts"
# TODO without a task ID
git grep --untracked -nE 'TODO' -- $SRC | grep -vE 'TODO\(T[1-4]\)'
# Debug output
git grep --untracked -nE 'console\.(log|debug)|(^|[^a-zA-Z_.])print\(' -- $SRC
# Commented-out code
git grep --untracked -nE '^[[:space:]]*(//|#)[[:space:]]*(const|let|var|import|export|return|function|def|class|if|for|await)[[:space:](]' -- $SRC
# Files missing a header comment (generated and empty files exempt)
git ls-files -co --exclude-standard -- $SRC | grep -v 'next-env.d.ts' | while read -r f; do
  [ -s "$f" ] && ! head -1 "$f" | grep -qE '^(//|/\*|#|""")' && echo "MISSING: $f"
done
```
Then inspect: docstrings on exports, and ID references on requirement-driven behaviour.

**Secret scan.** Passes when it prints nothing. The excluded files hold the pattern list and placeholders.
```
PATTERN='sk-ant-|api_key=|password=|BEGIN PRIVATE KEY'
# Working tree, including untracked files
git grep --untracked -nIiE "$PATTERN" -- . ':!.claude/skills/gate-check/SKILL.md' ':!.env.example'
# Branch diff
git diff main...HEAD -- . ':!.claude/skills/gate-check/SKILL.md' ':!.env.example' | grep -iE "$PATTERN"
```

**Link check after archiving.** Passes when it prints nothing.
```
git grep -nE 'tasks/<ID>-[a-z-]+\.md' -- docs ':!docs/tasks/completed'
```
Then inspect: links in the requirements register, the review, CURRENT_TASK.md and the archived doc. The archived doc moved one level deeper, so its own relative links need one more `../`.

## Gates
**G0 Start**
```
git branch --show-current          # main
git status --porcelain
git fetch && git rev-parse main origin/main     # same hash
git log --oneline -3
```
Carry-over files: after a close, only `docs/tasks/CURRENT_TASK.md` and the previous `docs/gates/<prev>-G4.md` may show as modified, plus this task's own `docs/gates/<ID>-G0.md` on a rerun. They move to the new branch and go into the plan commit. Anything else fails the check.

Inspect: previous task is in `docs/tasks/completed/` and in CURRENT_TASK's Completed tasks; this task's doc is in `docs/tasks/`.

**G1 Plan:** inspect task doc sections 2–10; ask the owner for approval. Check that every requirement ID appears in section 10, as an automated test or, where a test cannot apply, an inspection or manual check.

**G2 Red**
```
git status --porcelain
git diff --name-only main...HEAD
```
Run the test command and compare each failure with the "right reason" rule in the web-testing skill. Inspect: every planned automated test exists; names start with IDs; header comments present. Inspection and manual rows are not part of G2.

Allowed changes: tests, test config, dependency manifests, unmodified `create-next-app` scaffold, docs. Anything hand-written under app code fails.

The test commit follows straight after PASS. Record its hash in the handoff block.

**G3 Green**
```
git log --oneline --grep='^test(' -1                 # gives <red-commit>
git diff <red-commit> -- <test paths>                # empty unless approved
git diff main -- openapi.yaml                        # empty
```
Then all checks, the comment standard and the secret scan. Ask the owner to confirm the frontend review at 375px and desktop.

**G4 Part A**, before archiving: inspect the review, requirement register and task doc sections 7, 16 and 18.

**Pre-push check** (`/task-review` step 3), after the close commit:
```
git status --porcelain                  # empty
git ls-files | grep -E '(^|/)\.env(\.local)?$'     # empty
```
Then all checks and the branch-diff secret scan. Do not write the result to any tracked file yet; record it in Part B.

**G4 Part B**, after main is pushed:
```
git log --oneline --merges -1
git rev-parse main origin/main          # same hash
```
Then the link check. Write Part B into `docs/gates/<ID>-G4.md`.

**G5 Submission**
```
git grep -n 'TODO' -- README.md APPROACH.md      # empty
ls docs/evidence
# Secrets anywhere in history
git log --all -p -i -G'sk-ant-|api_key=|password=|BEGIN PRIVATE KEY' --format=%h -- . ':!.claude/skills/gate-check/SKILL.md' ':!.env.example'
# PII: author identities become public on push, and local paths must not appear
git log --all --format='%an <%ae>' | sort -u
git grep -nIE 'C:\\Users|/Users/|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}' -- . ':!.claude/skills/gate-check/SKILL.md'
# Fresh clone
tmp=$(mktemp -d) && git clone --branch "$(git branch --show-current)" . "$tmp/repo"
```
Follow the README in `$tmp/repo` exactly: install and pass all checks. Remove the temp folder afterwards. Show the author identities to the owner, who accepts them or asks for a change. Then run the comment standard over the whole repo and inspect the other G5 items.
