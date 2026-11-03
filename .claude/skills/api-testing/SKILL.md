---
name: api-testing
description: Use when writing, running or reviewing api/ tests with pytest and FastAPI TestClient, including validation, scenario and delay tests, OpenAPI contract tests with jsonschema, and ruff checks.
---

# API testing

Test names start with `test_` then the requirement ID, because pytest needs the prefix: `test_A2_rejects_whitespace_message`. One behaviour per test.

## Fixtures: `api/tests/conftest.py`
```python
"""Shared pytest fixtures: test client and zero delay (A4, DEC-5)."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(autouse=True)
def no_delay(monkeypatch: pytest.MonkeyPatch) -> None:
    # DEC-5: unit tests run with no delay.
    monkeypatch.setenv("FIXTURE_DELAY_MS", "0")


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
```
The app must read `FIXTURE_DELAY_MS` at request time so `monkeypatch` takes effect.

## Delay test (A4)
```python
def test_A4_success_waits_for_configured_delay(client, monkeypatch):
    # Small non-zero delay: long enough to measure, short enough to stay fast.
    monkeypatch.setenv("FIXTURE_DELAY_MS", "50")
    started = time.perf_counter()
    response = client.post("/recommendations", json={"message": "hi", "scenario": "success"})
    assert response.status_code == 200
    assert time.perf_counter() - started >= 0.05
```

## Parametrised validation (A2, A3)
```python
@pytest.mark.parametrize(
    "payload",
    [
        pytest.param({"message": "", "scenario": "success"}, id="A2-empty"),
        pytest.param({"message": "   \n", "scenario": "success"}, id="A2-whitespace"),
        pytest.param({"message": "x" * 1001, "scenario": "success"}, id="A2-too-long"),
        pytest.param({"message": "hi"}, id="A3-missing-scenario"),
        pytest.param({"message": "hi", "scenario": "nope"}, id="A3-invalid-scenario"),
    ],
)
def test_A2_A3_invalid_input_returns_422(client, payload):
    assert client.post("/recommendations", json=payload).status_code == 422
```
Also test the boundary: exactly 1000 characters returns 200.

## Scenario tests (A4–A8)
- `success`: 200, exactly h1, h2 and h3 with the values in `AGENTS.md`, and `source == "fixture"`.
- `empty`: 200, `hotels == []`, `source == "fixture"`.
- `error`: 503, non-empty string `detail`, no stack trace or internal names.
- Types: `nightlyPrice` is a number and `breakfastIncluded` is a bool, not strings.

## CORS (A10)
```python
def test_A10_preflight_allows_local_web_origin(client):
    response = client.options(
        "/recommendations",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
```

## Contract tests (A9): `api/tests/test_contract.py`
Load the YAML, resolve component `$ref`s through a registry, and validate real bodies with Draft 2020-12.
```python
"""Validates real responses against openapi.yaml (A9, D5)."""

from pathlib import Path

import pytest
import yaml
from jsonschema import Draft202012Validator
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

SPEC = yaml.safe_load(
    (Path(__file__).resolve().parents[2] / "openapi.yaml").read_text(encoding="utf-8")
)
REGISTRY = Registry().with_resource(
    "urn:openapi", Resource(contents=SPEC, specification=DRAFT202012)
)


def assert_matches(schema_name: str, body: object) -> None:
    schema = {"$ref": f"urn:openapi#/components/schemas/{schema_name}"}
    Draft202012Validator(schema, registry=REGISTRY).validate(body)


@pytest.mark.parametrize(
    ("payload", "status", "schema_name"),
    [
        ({"message": "hi", "scenario": "success"}, 200, "RecommendationResponse"),
        ({"message": "hi", "scenario": "empty"}, 200, "RecommendationResponse"),
        ({"message": "hi", "scenario": "error"}, 503, "ServiceUnavailable"),
        ({"message": " ", "scenario": "success"}, 422, "HTTPValidationError"),
    ],
)
def test_A9_response_matches_contract(client, payload, status, schema_name):
    response = client.post("/recommendations", json=payload)
    assert response.status_code == status
    assert_matches(schema_name, response.json())
```
Also assert that what the app exposes matches the YAML. FastAPI only lists 503 if the route declares it in `responses=`.
```python
def test_A9_paths_methods_and_status_codes_match_contract(client):
    exposed = client.app.openapi()["paths"]
    assert exposed.keys() == SPEC["paths"].keys()
    for path, operations in SPEC["paths"].items():
        assert exposed[path].keys() == operations.keys()
        for method, operation in operations.items():
            assert exposed[path][method]["responses"].keys() == operation["responses"].keys()
```

## Commands (from `api/`, with the venv active)
```
pytest -q
ruff check
ruff format --check
```
