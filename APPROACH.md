# Approach

## Scope
TODO (T4)

## Assumptions
TODO (T4)

## Decisions
- **DEC-1:** `scenario` is required (no default).
- **DEC-2:** Responses include `"source": "fixture"`.
- **DEC-3:** `message` must contain a non-whitespace character, max 1000 chars; invalid input returns FastAPI's default 422 shape. The UI also blocks empty submits.
- **DEC-4:** The 503 body is `{"detail": "<user-safe message>"}`.
- **DEC-5:** The success delay comes from env `FIXTURE_DELAY_MS` (default 800; 0 in unit tests).

## Trade-offs
TODO (T4)

## Harness and workflow
TODO (T4): agents, skills, gates, branching

## Checks and evidence
TODO (T4)

## Mock boundaries
TODO (T4)

## Limitations / not verified
TODO (T4)

## Next steps
TODO (T4)

## Time spent
TODO (T4): written by the project owner

## Agent interactions
TODO (T4): written by the project owner; 2–3 interactions labelled Exact or Summary

## Contract revisions
TODO (T4): summarise `docs/contract-changes.md`
