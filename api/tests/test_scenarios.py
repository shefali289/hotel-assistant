"""Scenario outcomes and hotel shape for POST /recommendations (A4-A8, DEC-2, DEC-4).

Expected values are the AGENTS.md fixtures and the openapi.yaml example strings (question 3).
"""

import re

import pytest
from fastapi.testclient import TestClient
from httpx2 import Response

URL = "/recommendations"

EXPECTED_HOTELS = [
    {
        "id": "h1",
        "name": "Harbour House",
        "nightlyPrice": 220,
        "currency": "NZD",
        "breakfastIncluded": True,
        "explanation": "Within budget; breakfast included.",
    },
    {
        "id": "h2",
        "name": "City Garden",
        "nightlyPrice": 245,
        "currency": "NZD",
        "breakfastIncluded": True,
        "explanation": "Near the meeting district.",
    },
    {
        "id": "h3",
        "name": "Quay Rooms",
        "nightlyPrice": 195,
        "currency": "NZD",
        "breakfastIncluded": False,
        "explanation": "Lower price; breakfast costs extra.",
    },
]
HOTEL_KEYS = {"id", "name", "nightlyPrice", "currency", "breakfastIncluded", "explanation"}
SUCCESS_MESSAGE = "Here are three Wellington hotels for your stay."
EMPTY_MESSAGE = "No hotels matched your request."
ERROR_DETAIL = "Recommendations are temporarily unavailable. Please try again."


def post_scenario(client: TestClient, scenario: str, message: str = "Find a hotel") -> Response:
    """POST a valid request for the given scenario and return the response."""
    return client.post(URL, json={"message": message, "scenario": scenario})


def test_A4_success_returns_exactly_three_fixture_hotels_in_order(client: TestClient) -> None:
    response = post_scenario(client, "success")

    assert response.status_code == 200
    assert response.json()["hotels"] == EXPECTED_HOTELS


def test_A4_success_returns_assistant_message(client: TestClient) -> None:
    response = post_scenario(client, "success")

    assert response.json()["message"] == SUCCESS_MESSAGE


@pytest.mark.parametrize(
    "message",
    [
        # The brief's example and an unrelated request: fixtures do not depend on the text.
        pytest.param(
            "Find a Wellington hotel for two nights, up to NZD 250 per night; breakfast preferred.",
            id="brief-example",
        ),
        pytest.param("Cheapest hostel in Auckland, no breakfast", id="unrelated"),
    ],
)
def test_A4_success_hotels_ignore_message_text(client: TestClient, message: str) -> None:
    response = post_scenario(client, "success", message)

    assert response.json()["hotels"] == EXPECTED_HOTELS


def test_A5_empty_returns_200_with_no_hotels(client: TestClient) -> None:
    response = post_scenario(client, "empty")

    # DEC-2: empty is a successful outcome, not an error.
    assert response.status_code == 200
    assert response.json() == {"message": EMPTY_MESSAGE, "hotels": [], "source": "fixture"}


def test_A6_error_returns_503_with_user_safe_detail(client: TestClient) -> None:
    response = post_scenario(client, "error")

    assert response.status_code == 503
    assert response.json()["detail"] == ERROR_DETAIL


def test_A6_error_body_has_only_detail_without_internals(client: TestClient) -> None:
    response = post_scenario(client, "error")

    # DEC-4: nothing beyond the user-safe message may leak to the client.
    assert set(response.json().keys()) == {"detail"}
    for internal in ("Traceback", "Exception", "app.", ".py"):
        assert internal not in response.text


def test_A7_hotel_keys_match_contract_names(client: TestClient) -> None:
    hotels = post_scenario(client, "success").json()["hotels"]

    assert hotels
    for hotel in hotels:
        assert set(hotel.keys()) == HOTEL_KEYS


def test_A7_hotel_field_types_are_number_and_boolean(client: TestClient) -> None:
    hotels = post_scenario(client, "success").json()["hotels"]

    assert hotels
    for hotel in hotels:
        # bool is a subclass of int in Python, so it is excluded explicitly.
        assert isinstance(hotel["nightlyPrice"], int | float)
        assert not isinstance(hotel["nightlyPrice"], bool)
        assert hotel["nightlyPrice"] >= 0
        assert isinstance(hotel["breakfastIncluded"], bool)
        assert re.fullmatch(r"[A-Z]{3}", hotel["currency"])
        for text_field in ("id", "name", "explanation"):
            assert isinstance(hotel[text_field], str)


@pytest.mark.parametrize("scenario", ["success", "empty"])
def test_A8_response_labelled_fixture(client: TestClient, scenario: str) -> None:
    response = post_scenario(client, scenario)

    assert response.json()["source"] == "fixture"
