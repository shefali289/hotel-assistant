# Contract and secrets

- Treat `openapi.yaml` as the source of truth.
- Never change the contract silently: propose it, get the owner's approval, then log it in `docs/contract-changes.md`.
- Never read or print `.env` files or credentials.
- Run the pre-push secret check before every push.
- Never claim a check passed unless it was run.
- Ask before adding dependencies.
- Treat completed task docs as read-only.
- Do not write the agent-interaction or time sections of `APPROACH.md`.
