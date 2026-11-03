# T1: API recommendations

> Single source of truth for this task. Every agent reads it first and appends to it.

## 1. Header
| Field | Value |
|---|---|
| ID | T1 |
| Title | API recommendations |
| Branch | task/T1-api-recommendations |
| Status | Done |
| Phase | close |
| Current agent | none |
| Last updated | 2026-11-03 |
| Location | completed |
| Skills used | api-testing, code-comments, gate-check |

## 2. Goal
Deliver the FastAPI `POST /recommendations` endpoint so that it matches `openapi.yaml`, proven by pytest unit and contract tests.

## 3. In scope / Out of scope
**In scope:** FastAPI app, fixtures, validation, scenarios, CORS, pytest unit and contract tests.

**Out of scope:** any UI.

## 4. Requirements
Acceptance criteria are written by the planner.
| ID | Requirement | Acceptance criteria (Given/When/Then) | Status |
|---|---|---|---|
| A1 | Accepts `{message, scenario}` JSON | **Given** the API is running, **when** a client POSTs JSON with a `message` (1–1000 chars, at least one non-whitespace) and a `scenario` of `success`, `empty` or `error` to `/recommendations`, **then** validation passes and the scenario's outcome is returned (200 or 503, never 422). **Given** a body that is not valid JSON, lacks `message`, or has a non-string `message` (`123`, `null`), **then** 422 in FastAPI's default shape (DEC-3). **Given** unknown extra keys, **then** they are ignored and the request succeeds (owner decision, question 5). | Done |
| A2 | Empty, whitespace-only or too-long message → 422 | **Given** a valid `scenario`, **when** `message` is `""`, whitespace only (spaces, tabs, newlines) or 1001+ characters, **then** 422 and `detail` has an item with `loc == ["body","message"]` (DEC-3). **Given** `message` is exactly 1000 characters, or `"  hi  "`, **then** 200 (boundaries). | Done |
| A3 | Missing or invalid scenario → 422 | **Given** a valid `message`, **when** `scenario` is missing, `null`, `""`, `"nope"` or `"SUCCESS"`, **then** 422 with an item whose `loc == ["body","scenario"]`; no default is applied (DEC-1). | Done |
| A4 | Success → 200, message + exactly the 3 fixtures, after delay | **Given** `scenario: "success"`, **then** 200 with `message` "Here are three Wellington hotels for your stay." and `hotels` equal, in order, to h1, h2, h3 with exactly the AGENTS.md values, whatever the request `message` says. **Given** `FIXTURE_DELAY_MS=50`, **then** the request takes at least 50 ms. **Given** it is unset, or not a non-negative integer, **then** the delay is 800 ms (DEC-5). The value is read on every request. **Given** a large delay, **then** `empty` and `error` are not delayed. | Done |
| A5 | Empty → 200, hotels `[]` | **Given** `scenario: "empty"`, **then** 200 with `message` "No hotels matched your request.", `hotels == []` and `source == "fixture"` (DEC-2). | Done |
| A6 | Error → 503 with useful detail | **Given** `scenario: "error"`, **then** 503 and the body has only the key `detail`, equal to "Recommendations are temporarily unavailable. Please try again.", with no traceback, exception class or module names (DEC-4). | Done |
| A7 | Hotel field names and types (nightlyPrice number, breakfastIncluded boolean) | **Given** a success response, **then** each hotel's keys are exactly `id, name, nightlyPrice, currency, breakfastIncluded, explanation`; `nightlyPrice` is a JSON number >= 0 (not a string or bool); `breakfastIncluded` is a bool; `currency` matches `^[A-Z]{3}$`; `id`, `name`, `explanation` are strings. | Done |
| A8 | Response labelled as fixture | **Given** scenario `success` or `empty`, **then** `source == "fixture"` (DEC-2). | Done |
| A9 | Responses validated against `openapi.yaml` (contract test) | **Given** `openapi.yaml` loaded as Draft 2020-12 with `$ref`s resolved, **when** real responses for success, empty, error and invalid input are validated, **then** they match `RecommendationResponse`, `RecommendationResponse`, `ServiceUnavailable` and `HTTPValidationError`. **Given** the app's generated OpenAPI, **then** its paths, methods and response codes (200, 422, 503) equal the YAML's. **Given** the YAML request example, **then** it returns 200. | Done |
| A10 | CORS allows the local web origin | **Given** origin `http://localhost:3000` or `http://127.0.0.1:3000`, **when** a preflight OPTIONS asks for POST with `content-type`, **then** `access-control-allow-origin` equals that origin and POST and content-type are allowed; an actual POST also carries the header. **Given** `http://evil.example`, **then** no allow-origin header (no wildcard). | Done |
| Q2 | API validation + contract tests with pytest | **Given** the api venv, **when** `pytest -q` runs from `api/`, **then** the A1–A10 tests run in-process with TestClient, without network, and all pass; `ruff check` and `ruff format --check` pass. | Done |
| Q8 | Code meets the commenting standard (status closed by T4) | **Given** `api/` files, **when** the gate-check greps run and the reviewer inspects, **then** every .py file has a header, exports have docstrings, requirement-driven behaviour cites its ID (`# DEC-3:`, `# A10:`), and there is no commented-out code, no TODO without a task ID and no `print(`. | In progress (T1 part done; T4 closes) |

## 5. Assumptions & dependencies
**Assumptions:** `openapi.yaml` is committed and pushed on main before this task starts (true: `70661f6`). One pinned `api/requirements.txt` (exact `==` pins), Python 3.12. `FIXTURE_DELAY_MS` is read per request; `api/tests/conftest.py` sets it to 0 for every test by default. API on port 8000, web on port 3000. pytest and ruff settings live in `api/pyproject.toml` (`[tool.pytest.ini_options]` with `pythonpath=["."]` and `testpaths=["tests"]`; `[tool.ruff]`); no extra package needed for that.

**Builds on (completed task docs):** none.

**New packages and owner approval:**
| Package | Why | Approved by owner |
|---|---|---|
| fastapi, pydantic, uvicorn | API runtime | Yes, 2026-11-03 |
| pytest, httpx | Tests with TestClient (httpx later replaced by httpx2, see section 7) | Yes, 2026-11-03 |
| jsonschema, PyYAML | Contract tests | Yes, 2026-11-03 |
| referencing | `$ref` resolution in the contract test; already transitive via jsonschema, pinned explicitly | Yes, 2026-11-03 |
| ruff | Lint and format | Yes, 2026-11-03 |
| httpx2 | Replaces deprecated httpx use in starlette.testclient (warning in red run 1) | Yes, 2026-11-03 |

Not needed: pytest-asyncio (TestClient is synchronous), python-dotenv (env read via `os.environ`), uvicorn[standard].

## 6. Clarifications
**Open**
| Question | Asked by | Why it matters |
|---|---|---|
| none | | |

**Resolved**
| Question | Owner's answer | Date |
|---|---|---|
| 1. Which web origins does CORS allow (A10)? | Fixed list `http://localhost:3000` and `http://127.0.0.1:3000`; no wildcard, no env variable. | 2026-11-03 |
| 2. How is `FIXTURE_DELAY_MS` tested and parsed (A4, DEC-5)? | One real 50 ms wait test; the 800 ms default tested by patching the app's sleep call and asserting 0.8 s; non-integer or negative values fall back to 800. | 2026-11-03 |
| 3. Exact wording of the assistant messages and error detail (A4–A6)? | The `openapi.yaml` examples verbatim: success "Here are three Wellington hotels for your stay."; empty "No hotels matched your request."; 503 "Recommendations are temporarily unavailable. Please try again." | 2026-11-03 |
| 4. Python version and pinning? | Python 3.12; exact `==` pins in one `api/requirements.txt`. | 2026-11-03 |
| 5. Unknown extra request keys: ignore or reject (A1)? | Ignore (Pydantic default; `RecommendationRequest` has no `additionalProperties: false`), with a test asserting 200. | 2026-11-03 |

## 7. Decisions & deviations
Includes overrides and gate waivers.
| Agent proposed | Owner chose | Why | Impact |
|---|---|---|---|
| Planner's task-doc write was rejected at the permission prompt; main session asked the owner | Owner allowed the main session to write the planner's plan | The earlier rejection came from an interrupted session | None; plan content is the planner's, plus the recorded answers |
| Planner defaults for questions 1–5 | Accepted all five | Defaults fit the contract and scope | Section 4 criteria fixed to those answers |
| Explicit pin of `referencing` | Approved | Contract test imports it directly | One extra line in `requirements.txt` |
| main advanced after G0 (owner-approved harness commit `fd04384`: visibility rule, handoff format) | Owner asked to pull main; branch already at `fd04384`, nothing to pull | Keep the branch on current main | G0 items still hold at `fd04384`; plan follows the new visibility format from here |
| Owner edited the harness during the tester run (nothing committed during a task; owner runs printed close commands; G2 fingerprint replaces the test commit) | Owner commits the harness straight to main from printed commands; task branch rebased onto main | Harness-only changes go to main (branching rule) | Harness landed as `46337d2`; plan commit rebased to `adfa6bd`; G2 item 2 rerun after the rebase; no `test(api)` commit in this phase |
| Plan commit `b6c1a22` (now `adfa6bd` after the rebase) was made under the old rule | Keep it unpushed; record as a deviation | Already made before the rule change | G4 Part B expects plan, test, feat, docs commits on the branch (not only test, feat, docs) |
| Tests emit `StarletteDeprecationWarning` (httpx with starlette.testclient) | Add `httpx2` as a new dependency | Remove the deprecation warning | Tester adds an exact pin to `api/requirements.txt` and reruns; package approved 2026-11-03 |
| Tester also removed `httpx==0.28.1`: starlette 1.10.0 imports httpx2 first and nothing else needs httpx | Owner accepted the removal, 2026-11-03 | Avoid an unused pin | `requirements.txt` has `httpx2==2.16.0`, no httpx |
| Reviewer nits 2 and 3: type test helpers and add one arrange comment in fingerprinted test files | Fix both (owner approved test edit in green, 2026-11-03) | Code-quality rule: type everything; comment standard | Tester edits typing and comments only; G2 fingerprint refreshed; G3 rerun |
| Reviewer nit 1 (`nightlyPrice` 220.0) | Accept | Valid JSON number per contract | T2 formats prices |
| Reviewer nit 4 (proxy intercepts localhost curl) | Defer to T4 README | Environment, not T1 code | Note added to T4 task doc section 5 |

## 8. UI co-creation
Not applicable.

## 9. Contract impact
None: `openapi.yaml` stays unchanged. Notes from comparing it with AGENTS.md (no change needed):
- The contract gives message wording only as examples; the owner fixed them as the expected strings (question 3).
- Only `success` is delayed; AGENTS.md agrees and A4 tests it.
- `RecommendationRequest` allows extra keys (no `additionalProperties: false`); the response schemas forbid them (question 5).
- The 422 example's `msg` and `type` depend on the Pydantic version (an empty string gives `string_too_short`, not `string_pattern_mismatch`). The example is not normative, so tests assert status and `loc`, not `msg`.
- FastAPI's generated OpenAPI will not match the YAML byte for byte, so A9 compares paths, methods and status codes, and validates bodies against the schemas. The route must declare `responses={503: ...}`.

## 10. Test plan
Type: unit | contract | e2e | inspection | manual. Inspection and manual rows are for what a test cannot cover; they name the check and are not part of G2.

Mock boundary unless stated: in-process FastAPI TestClient, real app and fixtures, env via `monkeypatch` (conftest autouse sets `FIXTURE_DELAY_MS=0`), no network. Shared fixtures in `api/tests/conftest.py`.
| Test or check (with ID) | Type | File | Mock boundary |
|---|---|---|---|
| test_A1_accepts_message_and_scenario_json | unit | api/tests/test_validation.py | TestClient |
| test_A1_invalid_body_returns_422 [malformed-json, missing-message, message-int, message-null] | unit | api/tests/test_validation.py | TestClient |
| test_A1_ignores_unknown_request_fields | unit | api/tests/test_validation.py | TestClient |
| test_A2_invalid_message_returns_422 [empty, spaces, tabs-newlines, 1001-chars] (asserts `loc` body.message) | unit | api/tests/test_validation.py | TestClient |
| test_A2_accepts_message_of_exactly_1000_chars | unit | api/tests/test_validation.py | TestClient |
| test_A2_accepts_message_with_surrounding_whitespace | unit | api/tests/test_validation.py | TestClient |
| test_A3_invalid_scenario_returns_422 [missing, null, empty, unknown, wrong-case] (asserts `loc` body.scenario) | unit | api/tests/test_validation.py | TestClient |
| test_A4_success_returns_exactly_three_fixture_hotels_in_order | unit | api/tests/test_scenarios.py | TestClient |
| test_A4_success_returns_assistant_message | unit | api/tests/test_scenarios.py | TestClient |
| test_A4_success_hotels_ignore_message_text [two messages] | unit | api/tests/test_scenarios.py | TestClient |
| test_A4_success_waits_for_configured_delay (50 ms, real wait) | unit | api/tests/test_delay.py | TestClient + env |
| test_A4_delay_defaults_to_800_ms_when_unset | unit | api/tests/test_delay.py | env unset; app's sleep call patched to record its argument |
| test_A4_invalid_delay_falls_back_to_800_ms [abc, -5] | unit | api/tests/test_delay.py | env set; app's sleep call patched |
| test_A4_empty_and_error_are_not_delayed [empty, error] (`FIXTURE_DELAY_MS=1000`, under 0.5 s) | unit | api/tests/test_delay.py | TestClient + env |
| test_A5_empty_returns_200_with_no_hotels | unit | api/tests/test_scenarios.py | TestClient |
| test_A6_error_returns_503_with_user_safe_detail | unit | api/tests/test_scenarios.py | TestClient |
| test_A6_error_body_has_only_detail_without_internals | unit | api/tests/test_scenarios.py | TestClient |
| test_A7_hotel_keys_match_contract_names | unit | api/tests/test_scenarios.py | TestClient |
| test_A7_hotel_field_types_are_number_and_boolean | unit | api/tests/test_scenarios.py | TestClient |
| test_A8_response_labelled_fixture [success, empty] | unit | api/tests/test_scenarios.py | TestClient |
| test_A9_response_matches_contract [success, empty, error, blank-message 422, missing-scenario 422] | contract | api/tests/test_contract.py | TestClient + `openapi.yaml` via jsonschema and referencing |
| test_A9_paths_methods_and_status_codes_match_contract | contract | api/tests/test_contract.py | `app.openapi()` vs YAML |
| test_A9_contract_request_example_is_accepted | contract | api/tests/test_contract.py | TestClient + YAML example |
| test_A10_preflight_allows_local_web_origin [localhost:3000, 127.0.0.1:3000] | unit | api/tests/test_cors.py | TestClient OPTIONS |
| test_A10_post_response_carries_allow_origin | unit | api/tests/test_cors.py | TestClient |
| test_A10_unknown_origin_is_not_allowed | unit | api/tests/test_cors.py | TestClient |
| Q2 suite check: `pytest -q`, `ruff check`, `ruff format --check` from `api/`, all green, logged in section 11 | inspection (run at G3) | api/tests/ | none |
| Q8 comment standard: gate-check greps (TODO without ID, `print(`, commented-out code, missing headers) plus reviewer inspection of docstrings and ID references | inspection | api/**/*.py | none |

## 11. Test results log
Append only.
| Run # | Phase | Command | Passed | Failed | Failing tests + reason | Date |
|---|---|---|---|---|---|---|
| 1 | test (red) | `.venv/Scripts/python -m pytest -q` (from `api/`) | 0 | 45 errors (26 test functions, 45 items) | All 45 error at fixture setup with `ModuleNotFoundError: No module named 'app'` (`app.main` is not written yet, and this task creates it). This is a right-reason failure under the web-testing rule used by G2. No syntax, config or other errors. `ruff check` and `ruff format --check` exit 0. Sanity check: the same tests ran against a throwaway reference app in the scratchpad (outside the repo, then deleted): 45 passed, and 7 failed as expected with wildcard CORS and a 0 s default delay. | 2026-11-03 |
| 2 | test (red) | `pytest -q -W error::DeprecationWarning`, `-W error::starlette.exceptions.StarletteDeprecationWarning`, `-W error`, plain `pytest -q` (from `api/`) | 0 | 45 errors each | Same right-reason failure as run 1: all 45 items fail with `ModuleNotFoundError: No module named 'app'`. The starlette warning is gone; no run reports any warning. Fix: `httpx2==2.16.0` pinned in `requirements.txt`, and `httpx==0.28.1` removed. Starlette 1.10.0 imports httpx2 first and uses httpx only as a deprecated fallback, and no installed package or test needs httpx (`pip check` clean after uninstalling it). Note: `StarletteDeprecationWarning` subclasses `UserWarning`, so `-W error::DeprecationWarning` alone cannot detect it; the class-specific and `-W error` runs are the proof. Tests unchanged. `ruff check` and `ruff format --check` exit 0. Sanity check against a throwaway scratchpad reference app with `-W error`: 45 passed; app then deleted. | 2026-11-03 |
| 3 | implement (green) | From `api/`: `.venv/Scripts/python -m pytest -q -W error`, `.venv/Scripts/python -m pytest -q`, `.venv/Scripts/ruff check`, `.venv/Scripts/ruff format --check`. From the repo root: `sha256sum -c --quiet docs/gates/T1-G2.sha256` | 45 | 0 | None. Both pytest runs: 45 passed, no warnings, exit 0. `ruff check`: all checks passed. `ruff format --check`: 10 files already formatted. Fingerprint: exit 0, so the tests, `pyproject.toml` and `requirements.txt` are unchanged since G2. `git diff -- openapi.yaml` is empty. Note: the fingerprint holds repo-root paths (`api/...`), so running it from `api/` as `../docs/gates/T1-G2.sha256` reports 8 files it cannot read (exit 1). Running it from the root passes. | 2026-11-03 |
| 4 | review loop (owner-approved test edits, reviewer nits 2 and 3) | From `api/`: `.venv/Scripts/python -m pytest -q -W error`, `.venv/Scripts/ruff check`, `.venv/Scripts/ruff format --check`. From the root: `sha256sum -c --quiet docs/gates/T1-G2.sha256` | 45 | 0 | None. 45 passed, no warnings, exit 0. Ruff: all checks passed, 10 files formatted. Typing and comment only; no behaviour, assertion or name changes. Lines changed (post-edit numbers): `test_cors.py:8` adds `from httpx2 import Response` (the type `starlette.testclient` uses with httpx2 installed). `test_cors.py:14` `preflight(...) -> Response`. `test_cors.py:43-44`: the why-comment moved above `origin = "http://evil.example"` and now reads "No wildcard: an unlisted origin must get no allow-origin header at all.", with the old comment above the asserts removed. `test_scenarios.py:10` adds `from httpx2 import Response`. `test_scenarios.py:46` `post_scenario(...) -> Response`. `test_validation.py:12` `body: dict[str, list[dict[str, object]]]`. `test_validation.py:36` `request_kwargs: dict[str, object]`. `test_validation.py:93` `payload: dict[str, object]`. `test_contract.py:51` `payload: dict[str, object]`. No other untyped helpers in `api/tests/`. Fingerprint: exit 1, and 4 files (test_contract, test_cors, test_scenarios, test_validation) no longer match. This is expected from the approved edits, so the main session must refresh or annotate `T1-G2.sha256`. | 2026-11-03 |

## 12. Implementation notes
**Files:**
- `api/app/__init__.py`: package docstring only.
- `api/app/models.py`: `Scenario` (StrEnum), `RecommendationRequest`, `Hotel`, `RecommendationResponse`, `ServiceUnavailable`.
- `api/app/fixtures.py`: the three fixture hotels plus the success, empty and error strings.
- `api/app/main.py`: the FastAPI `app`, CORS, `fixture_delay_seconds()` and the `POST /recommendations` route.

**Key choices:**
- DEC-3 validation is all in the Pydantic field: `Field(min_length=1, max_length=1000, pattern=r"\S")`. Pydantic's pattern uses search semantics, so `"  hi  "` passes and whitespace-only input fails. Non-string input gets a 422 because Pydantic v2 does not coerce int or null to str.
- DEC-1: `scenario` is a required `StrEnum` with no default, so a missing, null, empty, unknown or wrong-case value gets a 422 at `["body","scenario"]`. Extra keys are ignored because the Pydantic default `extra="ignore"` applies (question 5).
- A7: `Hotel` uses snake_case Python names with a `to_camel` alias generator. FastAPI serialises response models by alias, so the JSON keys are `nightlyPrice` and `breakfastIncluded`. `nightly_price` is a `float` with `ge=0`, so the generated schema type is `number`, as in the contract.
- A6, DEC-4: the error scenario raises `HTTPException(503, detail=ERROR_DETAIL)`. FastAPI's default handler returns exactly `{"detail": "..."}`. The route declares `responses={503: {"model": ServiceUnavailable}}` so the generated OpenAPI lists 200, 422 and 503 (A9).
- A4, DEC-5: `fixture_delay_seconds()` reads `FIXTURE_DELAY_MS` on every request. An unset, non-integer or negative value gives 800 ms. Only the success branch awaits the module-level `sleep` (`from asyncio import sleep`), which the delay tests patch. Empty and error return before the sleep.
- A10: `CORSMiddleware` has the fixed origins `http://localhost:3000` and `http://127.0.0.1:3000`, `allow_methods=["POST"]` and `allow_headers=["content-type"]`. There is no wildcard and no credentials. Starlette leaves out the allow-origin header for an unlisted origin.
- Fixtures are a module-level tuple, copied into a list per response, so no request can change the shared data.
- No new packages. Tests, `openapi.yaml`, `pyproject.toml` and `requirements.txt` are untouched (fingerprint verified).

## 13. Review findings
Review link and verdict summary: [T1 review](../../reviews/T1-review.md). 0 blockers, 0 should, 4 nits: 1 accept, 2 and 3 fix, 4 deferred to T4.

## 14. Gate results
| Gate | Pass/Fail | Report | Date |
|---|---|---|---|
| G0 | Pass | [T1-G0](../../gates/T1-G0.md) | 2026-11-03 |
| G1 | Pass | [T1-G1](../../gates/T1-G1.md) | 2026-11-03 |
| G2 | Pass | [T1-G2](../../gates/T1-G2.md), fingerprint [T1-G2.sha256](../../gates/T1-G2.sha256) | 2026-11-03 |
| G3 | Pass | [T1-G3](../../gates/T1-G3.md) | 2026-11-03; rerun after the review loop |

## 15. Handoff log
| From → to | Summary | Approved by owner | Time |
|---|---|---|---|
| planner → owner | Plan written; 5 questions and package approvals asked | Answers and approvals given 2026-11-03 | 2026-11-03 |
| owner → G1 | Plan approved; G1 PASS | Yes | 2026-11-03 |
| planner → tester | Handoff to /task-test after plan commit b6c1a22 | Yes | 2026-11-03 |
| tester → implementer | 26 failing tests (45 items) in `api/tests/`, plus `requirements.txt` and `pyproject.toml`. Red for the right reason (`app` missing). Seams the implementer must provide: `app.main.app`, and the success path awaits `app.main.sleep` (`from asyncio import sleep`), which the delay tests patch. | Yes (G2 PASS; httpx removal accepted) | 2026-11-03 |
| implementer → reviewer | `api/app/` written (`__init__.py`, `models.py`, `fixtures.py`, `main.py`). 45 passed with `-W error`; ruff check and format clean; G2 fingerprint verified from the repo root; `openapi.yaml` unchanged; no new packages; nothing committed. | Yes (G3 PASS) | 2026-11-03 |

## 16. Not verified / risks
- Delay tests depend on wall-clock time: the lower-bound check is safe; the "not delayed" upper bound has a 0.5 s margin.
- A9 compares structure (paths, methods, status codes) rather than the generated request schema, to avoid tying tests to Pydantic internals.
- Not verified (from the review): a real browser cross-origin request (CORS checked with TestClient and a curl preflight only); a fresh `pip install` into a new venv (G5 fresh clone covers it); Linux or macOS venv paths (`bin/`); timing-test stability on a loaded machine.
- Corporate proxy intercepts localhost `curl` without `--noproxy`; deferred to the T4 README (review nit 4).

## 17. Commits & pushes
| Hash | Message | Branch | Pushed | Date |
|---|---|---|---|---|
| b6c1a22 | docs(api): plan T1 | task/T1-api-recommendations | No | 2026-11-03 |
| adfa6bd | docs(api): plan T1 (b6c1a22 rebased onto harness commit 46337d2) | task/T1-api-recommendations | No | 2026-11-03 |

## 18. Time spent
50 minutes, 2026-11-03 16:14 to 17:04, G0 to G4 Part A, including owner harness changes (owner confirmed). Logged in [time-log](../../time-log.md).

## 19. Closure
| Field | Value |
|---|---|
| Date | 2026-11-03 |
| Merge hash | Recorded in CURRENT_TASK.md under Completed tasks; not known when this doc is archived |
| Archived | 2026-11-03, to `docs/tasks/completed/T1-api-recommendations.md` |
