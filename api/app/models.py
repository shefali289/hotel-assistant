"""Pydantic request and response models for POST /recommendations (A1-A3, A7, A8, A9)."""

from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class Scenario(StrEnum):
    """Demo control that selects the endpoint's outcome (A3, DEC-1).

    It is not a traveller preference, and it has no default.
    """

    SUCCESS = "success"
    EMPTY = "empty"
    ERROR = "error"


class RecommendationRequest(BaseModel):
    """Traveller message and demo scenario (A1-A3).

    Attributes:
        message: Traveller's request; 1 to 1000 characters with a non-whitespace character.
        scenario: Demo control selecting the outcome; required by DEC-1.
    """

    # DEC-3: the pattern rejects whitespace-only messages, which min_length alone allows.
    message: str = Field(min_length=1, max_length=1000, pattern=r"\S")
    scenario: Scenario


class Hotel(BaseModel):
    """A recommended fixture hotel, serialised with camelCase keys (A7).

    Attributes:
        id: Stable identifier.
        name: Hotel name shown to the traveller.
        nightly_price: Price per night in `currency` (JSON `nightlyPrice`).
        currency: ISO 4217 code.
        breakfast_included: Whether breakfast is included (JSON `breakfastIncluded`).
        explanation: Short reason for the recommendation.
    """

    # A7: the contract uses camelCase keys; the generator keeps Python names snake_case.
    model_config = ConfigDict(alias_generator=to_camel, validate_by_name=True)

    id: str
    name: str
    nightly_price: float = Field(ge=0)
    currency: str = Field(pattern=r"^[A-Z]{3}$")
    breakfast_included: bool
    explanation: str


class RecommendationResponse(BaseModel):
    """The assistant's reply and its hotels for the success and empty scenarios (A4, A5, A8).

    Attributes:
        message: Assistant's message to the traveller.
        hotels: Three hotels for success, none for empty (DEC-2).
        source: Always "fixture", labelling the data as non-live (A8).
    """

    message: str
    hotels: list[Hotel]
    source: Literal["fixture"] = "fixture"


class ServiceUnavailable(BaseModel):
    """Body of the 503 error scenario: one user-safe message (A6, DEC-4).

    Attributes:
        detail: Message that is safe to show the traveller.
    """

    detail: str
