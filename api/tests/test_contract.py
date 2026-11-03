"""Validates real responses and the exposed routes against openapi.yaml (A9).

Schemas are resolved through a referencing registry and checked with Draft 2020-12.
"""

from pathlib import Path

import pytest
import yaml
from fastapi.testclient import TestClient
from jsonschema import Draft202012Validator
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

URL = "/recommendations"
SPEC = yaml.safe_load(
    (Path(__file__).resolve().parents[2] / "openapi.yaml").read_text(encoding="utf-8")
)
# The whole spec is one resource so "#/components/..." refs inside it resolve.
REGISTRY = Registry().with_resource(
    "urn:openapi", Resource(contents=SPEC, specification=DRAFT202012)
)


def assert_matches(schema_name: str, body: object) -> None:
    """Validate a response body against a named component schema in openapi.yaml."""
    schema = {"$ref": f"urn:openapi#/components/schemas/{schema_name}"}
    Draft202012Validator(schema, registry=REGISTRY).validate(body)


@pytest.mark.parametrize(
    ("payload", "status", "schema_name"),
    [
        pytest.param(
            {"message": "hi", "scenario": "success"}, 200, "RecommendationResponse", id="success"
        ),
        pytest.param(
            {"message": "hi", "scenario": "empty"}, 200, "RecommendationResponse", id="empty"
        ),
        pytest.param({"message": "hi", "scenario": "error"}, 503, "ServiceUnavailable", id="error"),
        pytest.param(
            {"message": " ", "scenario": "success"},
            422,
            "HTTPValidationError",
            id="blank-message-422",
        ),
        pytest.param({"message": "hi"}, 422, "HTTPValidationError", id="missing-scenario-422"),
    ],
)
def test_A9_response_matches_contract(
    client: TestClient, payload: dict[str, object], status: int, schema_name: str
) -> None:
    response = client.post(URL, json=payload)

    assert response.status_code == status
    assert_matches(schema_name, response.json())


def test_A9_paths_methods_and_status_codes_match_contract(client: TestClient) -> None:
    # FastAPI's generated spec differs in detail, so only structure is compared (section 9).
    exposed = client.app.openapi()["paths"]

    assert exposed.keys() == SPEC["paths"].keys()
    for path, operations in SPEC["paths"].items():
        assert exposed[path].keys() == operations.keys()
        for method, operation in operations.items():
            assert exposed[path][method]["responses"].keys() == operation["responses"].keys()


def test_A9_contract_request_example_is_accepted(client: TestClient) -> None:
    # The request example from openapi.yaml, used verbatim.
    examples = SPEC["paths"][URL]["post"]["requestBody"]["content"]["application/json"]["examples"]

    response = client.post(URL, json=examples["wellington"]["value"])

    assert response.status_code == 200
