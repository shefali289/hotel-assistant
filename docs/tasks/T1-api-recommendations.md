# T1: API recommendations

> Single source of truth for this task. Every agent reads it first and appends to it.

## 1. Header
| Field | Value |
|---|---|
| ID | T1 |
| Title | API recommendations |
| Branch | task/T1-api-recommendations |
| Status | In progress |
| Phase | plan |
| Current agent | none (awaiting handoff to tester) |
| Last updated | 2026-11-03 |
| Location | active |
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
| A1 | Accepts `{message, scenario}` JSON | **Given** the API is running, **when** a client POSTs JSON with a `message` (1–1000 chars, at least one non-whitespace) and a `scenario` of `success`, `empty` or `error` to `/recommendations`, **then** validation passes and the scenario's outcome is returned (200 or 503, never 422). **Given** a body that is not valid JSON, lacks `message`, or has a non-string `message` (`123`, `null`), **then** 422 in FastAPI's default shape (DEC-3). **Given** unknown extra keys, **then** they are ignored and the request succeeds (owner decision, question 5). | Not started |
| A2 | Empty, whitespace-only or too-long message → 422 | **Given** a valid `scenario`, **when** `message` is `""`, whitespace only (spaces, tabs, newlines) or 1001+ characters, **then** 422 and `detail` has an item with `loc == ["body","message"]` (DEC-3). **Given** `message` is exactly 1000 characters, or `"  hi  "`, **then** 200 (boundaries). | Not started |
| A3 | Missing or invalid scenario → 422 | **Given** a valid `message`, **when** `scenario` is missing, `null`, `""`, `"nope"` or `"SUCCESS"`, **then** 422 with an item whose `loc == ["body","scenario"]`; no default is applied (DEC-1). | Not started |
| A4 | Success → 200, message + exactly the 3 fixtures, after delay | **Given** `scenario: "success"`, **then** 200 with `message` "Here are three Wellington hotels for your stay." and `hotels` equal, in order, to h1, h2, h3 with exactly the AGENTS.md values, whatever the request `message` says. **Given** `FIXTURE_DELAY_MS=50`, **then** the request takes at least 50 ms. **Given** it is unset, or not a non-negative integer, **then** the delay is 800 ms (DEC-5). The value is read on every request. **Given** a large delay, **then** `empty` and `error` are not delayed. | Not started |
| A5 | Empty → 200, hotels `[]` | **Given** `scenario: "empty"`, **then** 200 with `message` "No hotels matched your request.", `hotels == []` and `source == "fixture"` (DEC-2). | Not started |
| A6 | Error → 503 with useful detail | **Given** `scenario: "error"`, **then** 503 and the body has only the key `detail`, equal to "Recommendations are temporarily unavailable. Please try again.", with no traceback, exception class or module names (DEC-4). | Not started |
| A7 | Hotel field names and types (nightlyPrice number, breakfastIncluded boolean) | **Given** a success response, **then** each hotel's keys are exactly `id, name, nightlyPrice, currency, breakfastIncluded, explanation`; `nightlyPrice` is a JSON number >= 0 (not a string or bool); `breakfastIncluded` is a bool; `currency` matches `^[A-Z]{3}$`; `id`, `name`, `explanation` are strings. | Not started |
| A8 | Response labelled as fixture | **Given** scenario `success` or `empty`, **then** `source == "fixture"` (DEC-2). | Not started |
| A9 | Responses validated against `openapi.yaml` (contract test) | **Given** `openapi.yaml` loaded as Draft 2020-12 with `$ref`s resolved, **when** real responses for success, empty, error and invalid input are validated, **then** they match `RecommendationResponse`, `RecommendationResponse`, `ServiceUnavailable` and `HTTPValidationError`. **Given** the app's generated OpenAPI, **then** its paths, methods and response codes (200, 422, 503) equal the YAML's. **Given** the YAML request example, **then** it returns 200. | Not started |
| A10 | CORS allows the local web origin | **Given** origin `http://localhost:3000` or `http://127.0.0.1:3000`, **when** a preflight OPTIONS asks for POST with `content-type`, **then** `access-control-allow-origin` equals that origin and POST and content-type are allowed; an actual POST also carries the header. **Given** `http://evil.example`, **then** no allow-origin header (no wildcard). | Not started |
| Q2 | API validation + contract tests with pytest | **Given** the api venv, **when** `pytest -q` runs from `api/`, **then** the A1–A10 tests run in-process with TestClient, without network, and all pass; `ruff check` and `ruff format --check` pass. | Not started |
| Q8 | Code meets the commenting standard (status closed by T4) | **Given** `api/` files, **when** the gate-check greps run and the reviewer inspects, **then** every .py file has a header, exports have docstrings, requirement-driven behaviour cites its ID (`# DEC-3:`, `# A10:`), and there is no commented-out code, no TODO without a task ID and no `print(`. | Not started |

## 5. Assumptions & dependencies
**Assumptions:** `openapi.yaml` is committed and pushed on main before this task starts (true: `70661f6`). One pinned `api/requirements.txt` (exact `==` pins), Python 3.12. `FIXTURE_DELAY_MS` is read per request; `api/tests/conftest.py` sets it to 0 for every test by default. API on port 8000, web on port 3000. pytest and ruff settings live in `api/pyproject.toml` (`[tool.pytest.ini_options]` with `pythonpath=["."]` and `testpaths=["tests"]`; `[tool.ruff]`); no extra package needed for that.

**Builds on (completed task docs):** none.

**New packages and owner approval:**
| Package | Why | Approved by owner |
|---|---|---|
| fastapi, pydantic, uvicorn | API runtime | Yes, 2026-11-03 |
| pytest, httpx | Tests with TestClient | Yes, 2026-11-03 |
| jsonschema, PyYAML | Contract tests | Yes, 2026-11-03 |
| referencing | `$ref` resolution in the contract test; already transitive via jsonschema, pinned explicitly | Yes, 2026-11-03 |
| ruff | Lint and format | Yes, 2026-11-03 |

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

## 12. Implementation notes
**Files:**

**Key choices:**

## 13. Review findings
Review link and verdict summary:

## 14. Gate results
| Gate | Pass/Fail | Report | Date |
|---|---|---|---|
| G0 | Pass | [T1-G0](../gates/T1-G0.md) | 2026-11-03 |
| G1 | Pass | [T1-G1](../gates/T1-G1.md) | 2026-11-03 |

## 15. Handoff log
| From → to | Summary | Approved by owner | Time |
|---|---|---|---|
| planner → owner | Plan written; 5 questions and package approvals asked | Answers and approvals given 2026-11-03 | 2026-11-03 |
| owner → G1 | Plan approved; G1 PASS | Yes | 2026-11-03 |

## 16. Not verified / risks
- Delay tests depend on wall-clock time: the lower-bound check is safe; the "not delayed" upper bound has a 0.5 s margin.
- A9 compares structure (paths, methods, status codes) rather than the generated request schema, to avoid tying tests to Pydantic internals.

## 17. Commits & pushes
| Hash | Message | Branch | Pushed | Date |
|---|---|---|---|---|

## 18. Time spent

## 19. Closure
| Field | Value |
|---|---|
| Date | |
| Merge hash | Recorded in CURRENT_TASK.md under Completed tasks; not known when this doc is archived |
| Archived | |
