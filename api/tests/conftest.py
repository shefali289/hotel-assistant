"""Shared pytest fixtures: in-process test client and zero fixture delay (Q2, A4, DEC-5)."""

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def no_delay(monkeypatch: pytest.MonkeyPatch) -> None:
    """Run every test with no success delay unless the test overrides it."""
    # DEC-5: the app reads FIXTURE_DELAY_MS per request, so monkeypatch takes effect.
    monkeypatch.setenv("FIXTURE_DELAY_MS", "0")


@pytest.fixture
def client() -> Iterator[TestClient]:
    """Yield a TestClient bound to the real FastAPI app, with no network."""
    # Imported here so a missing app fails each test at setup, not the whole collection.
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client
