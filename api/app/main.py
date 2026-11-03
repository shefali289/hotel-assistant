"""FastAPI app: POST /recommendations with fixture scenarios, delay and CORS (A1-A10)."""

import os
from asyncio import sleep

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.fixtures import EMPTY_MESSAGE, ERROR_DETAIL, HOTELS, SUCCESS_MESSAGE
from app.models import RecommendationRequest, RecommendationResponse, Scenario, ServiceUnavailable

DEFAULT_DELAY_MS = 800

app = FastAPI(title="Hotel Assistant API", version="1.0.0")

# A10: fixed list of local web origins (owner decision, question 1); no wildcard.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST"],
    allow_headers=["content-type"],
)


def fixture_delay_seconds() -> float:
    """Return the success-scenario delay in seconds from FIXTURE_DELAY_MS (A4, DEC-5).

    Returns:
        The configured delay, or 0.8 when the variable is unset, not an integer or negative.
    """
    # DEC-5: read on every request so the value can change without a restart.
    raw = os.environ.get("FIXTURE_DELAY_MS")
    try:
        delay_ms = int(raw) if raw is not None else DEFAULT_DELAY_MS
    except ValueError:
        delay_ms = DEFAULT_DELAY_MS
    # Owner decision, question 2: negative values fall back to the default too.
    if delay_ms < 0:
        delay_ms = DEFAULT_DELAY_MS
    return delay_ms / 1000


@app.post(
    "/recommendations",
    response_model=RecommendationResponse,
    # A9: declared so the generated OpenAPI lists 503 like openapi.yaml.
    responses={503: {"model": ServiceUnavailable, "description": "Recoverable failure."}},
)
async def create_recommendations(request: RecommendationRequest) -> RecommendationResponse:
    """Return the outcome selected by the request's demo scenario (A4-A6).

    Args:
        request: Validated traveller message and scenario; invalid bodies get FastAPI's 422.

    Returns:
        Three fixture hotels for success (after the delay), or none for empty.

    Raises:
        HTTPException: 503 with a user-safe detail for the error scenario (DEC-4).
    """
    if request.scenario is Scenario.ERROR:
        raise HTTPException(status_code=503, detail=ERROR_DETAIL)
    if request.scenario is Scenario.EMPTY:
        # DEC-2: empty is a successful, undelayed outcome.
        return RecommendationResponse(message=EMPTY_MESSAGE, hotels=[])
    # A4: only success is delayed; `sleep` is module-level so tests can patch it.
    await sleep(fixture_delay_seconds())
    return RecommendationResponse(message=SUCCESS_MESSAGE, hotels=list(HOTELS))
