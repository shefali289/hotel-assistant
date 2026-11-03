"""Request validation for POST /recommendations (A1-A3, DEC-1, DEC-3).

Covers the body shape, message length and whitespace rules, and the required scenario.
"""

import pytest
from fastapi.testclient import TestClient

URL = "/recommendations"


def has_error_at(body: dict[str, list[dict[str, object]]], field: str) -> bool:
    """Return True if a FastAPI 422 body reports an error for the given body field."""
    return any(item.get("loc") == ["body", field] for item in body["detail"])


def test_A1_accepts_message_and_scenario_json(client: TestClient) -> None:
    response = client.post(URL, json={"message": "Find a hotel", "scenario": "success"})

    assert response.status_code == 200


@pytest.mark.parametrize(
    "request_kwargs",
    [
        # Raw text sent as JSON so the parser, not the model, rejects it.
        pytest.param(
            {"content": "{not json", "headers": {"content-type": "application/json"}},
            id="malformed-json",
        ),
        pytest.param({"json": {"scenario": "success"}}, id="missing-message"),
        pytest.param({"json": {"message": 123, "scenario": "success"}}, id="message-int"),
        pytest.param({"json": {"message": None, "scenario": "success"}}, id="message-null"),
    ],
)
def test_A1_invalid_body_returns_422(client: TestClient, request_kwargs: dict[str, object]) -> None:
    response = client.post(URL, **request_kwargs)

    # DEC-3: FastAPI's default shape, a list under "detail".
    assert response.status_code == 422
    assert isinstance(response.json()["detail"], list)


def test_A1_ignores_unknown_request_fields(client: TestClient) -> None:
    # Owner decision (question 5): extra keys are ignored, not rejected.
    payload = {"message": "Find a hotel", "scenario": "success", "nights": 2}

    response = client.post(URL, json=payload)

    assert response.status_code == 200


@pytest.mark.parametrize(
    "message",
    [
        pytest.param("", id="empty"),
        pytest.param("   ", id="spaces"),
        pytest.param("\t\n \r\n", id="tabs-newlines"),
        pytest.param("x" * 1001, id="1001-chars"),
    ],
)
def test_A2_invalid_message_returns_422(client: TestClient, message: str) -> None:
    response = client.post(URL, json={"message": message, "scenario": "success"})

    assert response.status_code == 422
    assert has_error_at(response.json(), "message")


def test_A2_accepts_message_of_exactly_1000_chars(client: TestClient) -> None:
    # Upper boundary of DEC-3: 1000 is allowed, 1001 is not.
    response = client.post(URL, json={"message": "x" * 1000, "scenario": "success"})

    assert response.status_code == 200


def test_A2_accepts_message_with_surrounding_whitespace(client: TestClient) -> None:
    # DEC-3: only whitespace-only messages are invalid; padding around text is fine.
    response = client.post(URL, json={"message": "  hi  ", "scenario": "success"})

    assert response.status_code == 200


@pytest.mark.parametrize(
    "payload",
    [
        pytest.param({"message": "hi"}, id="missing"),
        pytest.param({"message": "hi", "scenario": None}, id="null"),
        pytest.param({"message": "hi", "scenario": ""}, id="empty"),
        pytest.param({"message": "hi", "scenario": "nope"}, id="unknown"),
        pytest.param({"message": "hi", "scenario": "SUCCESS"}, id="wrong-case"),
    ],
)
def test_A3_invalid_scenario_returns_422(client: TestClient, payload: dict[str, object]) -> None:
    response = client.post(URL, json=payload)

    # DEC-1: no default scenario is applied, so each case is a validation error.
    assert response.status_code == 422
    assert has_error_at(response.json(), "scenario")
