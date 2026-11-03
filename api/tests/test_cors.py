"""CORS for the local web app (A10).

Owner decision (question 1): only http://localhost:3000 and http://127.0.0.1:3000; no wildcard.
"""

import pytest
from fastapi.testclient import TestClient
from httpx2 import Response

URL = "/recommendations"
VALID_BODY = {"message": "Find a hotel", "scenario": "success"}


def preflight(client: TestClient, origin: str) -> Response:
    """Send a browser-style preflight for a JSON POST from the given origin."""
    return client.options(
        URL,
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )


@pytest.mark.parametrize("origin", ["http://localhost:3000", "http://127.0.0.1:3000"])
def test_A10_preflight_allows_local_web_origin(client: TestClient, origin: str) -> None:
    response = preflight(client, origin)

    assert response.headers.get("access-control-allow-origin") == origin
    assert "POST" in response.headers.get("access-control-allow-methods", "")
    assert "content-type" in response.headers.get("access-control-allow-headers", "").lower()


def test_A10_post_response_carries_allow_origin(client: TestClient) -> None:
    # The browser also checks the header on the actual response, not only on the preflight.
    response = client.post(URL, json=VALID_BODY, headers={"Origin": "http://localhost:3000"})

    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_A10_unknown_origin_is_not_allowed(client: TestClient) -> None:
    # No wildcard: an unlisted origin must get no allow-origin header at all.
    origin = "http://evil.example"

    preflight_response = preflight(client, origin)
    post_response = client.post(URL, json=VALID_BODY, headers={"Origin": origin})

    assert "access-control-allow-origin" not in preflight_response.headers
    assert "access-control-allow-origin" not in post_response.headers
