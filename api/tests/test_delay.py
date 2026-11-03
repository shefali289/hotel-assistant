"""FIXTURE_DELAY_MS handling for the success scenario (A4, DEC-5).

Seam: the success path awaits `app.main.sleep(seconds)`, where `sleep` is `asyncio.sleep`
imported by name, so the default and fallback tests can record its argument without waiting.
"""

import time

import pytest
from fastapi.testclient import TestClient

URL = "/recommendations"
SUCCESS = {"message": "Find a hotel", "scenario": "success"}


@pytest.fixture
def sleep_calls(monkeypatch: pytest.MonkeyPatch) -> list[float]:
    """Replace the app's sleep with a recorder and return the list of requested seconds."""
    calls: list[float] = []

    async def record_sleep(seconds: float) -> None:
        calls.append(seconds)

    # Owner decision (question 2): patch the app's sleep call instead of waiting 800 ms.
    monkeypatch.setattr("app.main.sleep", record_sleep)
    return calls


def test_A4_success_waits_for_configured_delay(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Small non-zero delay: long enough to measure, short enough to keep the suite fast.
    monkeypatch.setenv("FIXTURE_DELAY_MS", "50")
    started = time.perf_counter()

    response = client.post(URL, json=SUCCESS)

    assert response.status_code == 200
    assert time.perf_counter() - started >= 0.05


def test_A4_delay_defaults_to_800_ms_when_unset(
    client: TestClient, monkeypatch: pytest.MonkeyPatch, sleep_calls: list[float]
) -> None:
    # DEC-5: with no variable set, the default of 800 ms applies.
    monkeypatch.delenv("FIXTURE_DELAY_MS", raising=False)

    response = client.post(URL, json=SUCCESS)

    assert response.status_code == 200
    assert sleep_calls == [pytest.approx(0.8)]


@pytest.mark.parametrize("raw_value", ["abc", "-5"])
def test_A4_invalid_delay_falls_back_to_800_ms(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    sleep_calls: list[float],
    raw_value: str,
) -> None:
    # Owner decision (question 2): non-integer or negative values fall back to 800 ms.
    monkeypatch.setenv("FIXTURE_DELAY_MS", raw_value)

    response = client.post(URL, json=SUCCESS)

    assert response.status_code == 200
    assert sleep_calls == [pytest.approx(0.8)]


@pytest.mark.parametrize(("scenario", "status"), [("empty", 200), ("error", 503)])
def test_A4_empty_and_error_are_not_delayed(
    client: TestClient, monkeypatch: pytest.MonkeyPatch, scenario: str, status: int
) -> None:
    # A large delay makes any wrongly applied wait obvious against the 0.5 s bound.
    monkeypatch.setenv("FIXTURE_DELAY_MS", "1000")
    started = time.perf_counter()

    response = client.post(URL, json={"message": "Find a hotel", "scenario": scenario})

    assert response.status_code == status
    assert time.perf_counter() - started < 0.5
