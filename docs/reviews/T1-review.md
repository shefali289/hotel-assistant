# Review: T1

Task doc: [T1-api-recommendations](../tasks/completed/T1-api-recommendations.md)

Reviewer: reviewer agent, 2026-11-03. Scope: working tree vs main (nothing is committed during a task), i.e. `api/app/*.py`, `api/tests/*.py`, `api/pyproject.toml`, `api/requirements.txt` and the T1 docs.

## Findings
Severity: blocker | should | nit.
Category: requirement | contract | tests/TDD | accessibility | comments/code quality | security | scope.

| # | Severity | Category | File:line | Requirement ID | Finding | Suggested fix | Owner verdict (fix / accept / won't fix + reason) |
|---|---|---|---|---|---|---|---|
| 1 | nit | contract | api/app/models.py:51 | A7, A9 | `nightly_price: float` serialises as `"nightlyPrice": 220.0` (also 245.0, 195.0), confirmed on the live server. This is valid: the contract type is `number` and the generated schema is `{'type': 'number', 'minimum': 0.0}`. Only a byte-for-byte comparison would see a difference. | Leave as is; `int \| float` would print 220 but makes the generated schema `anyOf`. T2 should format the price itself (e.g. `Intl.NumberFormat`). | accept: valid JSON number matching the contract; T2 formats prices for display (owner, 2026-11-03) |
| 2 | nit | comments/code quality | api/tests/test_cors.py:13, api/tests/test_scenarios.py:45; bare `dict` at api/tests/test_validation.py:12,36,93 and api/tests/test_contract.py:51 | Q8 | Test helpers `preflight` and `post_scenario` lack return types, and several parameters are bare `dict`. The code-quality rule says "Type everything"; the selected ruff rules don't flag it. | Add the response return type and `dict[str, object]`. Changes fingerprinted test files, so needs owner approval. | fix: owner approved editing the fingerprinted tests (typing only); fingerprint refreshed after (owner, 2026-11-03) |
| 3 | nit | comments/code quality | api/tests/test_cors.py:42 | Q8 | The arrange line `origin = "http://evil.example"` has no comment; the comment is on the assert at line 47. Every other arrange step is commented. | Move or add the comment at line 42. Changes a fingerprinted test, so needs owner approval. | fix: owner approved adding the arrange comment; fingerprint refreshed after (owner, 2026-11-03) |
| 4 | nit | scope (for T4) | none (environment) | D1 | Plain `curl` to `http://127.0.0.1:8765` returned the corporate proxy's HTML page; only `curl --noproxy '*'` reached the API. A reader on a similar network could think the API is broken. | Mention `NO_PROXY=localhost,127.0.0.1` (or `--noproxy`) in README troubleshooting in T4. No T1 change. | accept, deferred to T4: README troubleshooting note recorded in the T4 task doc (owner, 2026-11-03) |

Checked with no issue:
- **Requirement coverage:** each of A1–A10 has behaviour and a test that catches its regression (e.g. removing the sleep, wildcard CORS, a scenario default, dropping the alias generator or the 503 declaration all fail tests). Q2: 45 passed with `-W error`, ruff clean. Q8: greps empty and every file read.
- **Contract:** 200/200/503/422 as specified; camelCase keys, exact hotel keys, `source: "fixture"`, 503 body is only `detail`; 422 in FastAPI's default shape with `loc ["body","message"]`. `git diff main -- openapi.yaml` empty; generated responses `200, 503, 422`.
- **TDD evidence:** G2 red was 45 × `ModuleNotFoundError: No module named 'app'` (right reason); `sha256sum -c --quiet docs/gates/T1-G2.sha256` exits 0 from the repo root; no test file added or removed.
- **Mock boundaries:** in-process TestClient only; env via `monkeypatch`; `app.main.sleep` patched; no network use in tests.
- **Code quality and scope:** four small, fully typed app files; no unused code; nothing outside A1–A10. `.gitignore` covers `.venv`, caches and `.env`.
- **Secrets:** secret-pattern scan (gate-check) empty for the working tree and both diffs.
- **Deviations (section 7):** all sensible and owner-approved (httpx → httpx2, `referencing` pin, plan commit `adfa6bd` kept).

## Not verified
- A cross-origin request from a real browser (CORS checked with TestClient and a curl preflight only).
- A fresh `pip install -r requirements.txt` into a new venv (the existing Python 3.12.7 venv was used; G5 covers the fresh clone).
- Linux or macOS (venv path `bin/` instead of `Scripts/`).
- Timing-test stability on a loaded machine (0.5 s margin; task doc section 16).
- Accessibility and small screen: not applicable, T1 has no UI.

## Summary
No blockers, no should-fix, 4 nits. All checks were run in the review and pass: 45 tests with warnings as errors, ruff lint and format, fingerprint, empty contract diff, comment greps and secret scan. The live server matched the contract for success (200 after 0.82 s), empty (200 in 0.004 s), error (503), blank message (422) and the CORS preflight.
