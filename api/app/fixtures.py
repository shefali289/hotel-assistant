"""Fixture hotels and fixed messages returned by the scenarios (A4-A6, AGENTS.md table).

Strings are the openapi.yaml examples verbatim (owner decision, question 3).
"""

from app.models import Hotel

SUCCESS_MESSAGE = "Here are three Wellington hotels for your stay."
EMPTY_MESSAGE = "No hotels matched your request."
ERROR_DETAIL = "Recommendations are temporarily unavailable. Please try again."

# A4: always these three, in this order, whatever the traveller's message says.
HOTELS: tuple[Hotel, ...] = (
    Hotel(
        id="h1",
        name="Harbour House",
        nightly_price=220,
        currency="NZD",
        breakfast_included=True,
        explanation="Within budget; breakfast included.",
    ),
    Hotel(
        id="h2",
        name="City Garden",
        nightly_price=245,
        currency="NZD",
        breakfast_included=True,
        explanation="Near the meeting district.",
    ),
    Hotel(
        id="h3",
        name="Quay Rooms",
        nightly_price=195,
        currency="NZD",
        breakfast_included=False,
        explanation="Lower price; breakfast costs extra.",
    ),
)
