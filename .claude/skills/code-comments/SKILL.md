---
name: code-comments
description: The project's commenting standard (Q8). Use when writing, editing or reviewing any source or test file in web/, api/ or e2e/.
---

# Commenting standard

## Required
- **File header:** every source file starts with a short comment giving its purpose and the requirement IDs it serves. In Python, use the module docstring. In Next.js client components, the comment goes above `"use client"`, which is allowed.
- **Exports:** every exported function, component, hook, type, Pydantic model and endpoint has a TSDoc or docstring covering what it does, params, return and errors.
- **Inline comments:** explain WHY (decisions, edge cases, accessibility reasons), not WHAT. Cite IDs where behaviour comes from a requirement or decision: `// U8: Retry re-sends the last request`, `# DEC-3: whitespace-only is invalid`.
- **Tests:** a header comment per file, and a brief comment on each mock or arrange step.

## Forbidden
- Commented-out code.
- A TODO without a task ID. Allowed form: `TODO(T3): ...`.
- Debug `console.log` or `print`.
- Comments on obvious lines.

Exempt: generated files such as `next-env.d.ts`, and empty `__init__.py` files.

## TypeScript
Good:
```ts
// Calls POST /recommendations and maps failures to user-safe errors (A1, U8).

/**
 * Requests hotel recommendations.
 * @param request - The message and demo scenario to send.
 * @returns The parsed recommendation response.
 * @throws RecommendationError on a 503 or network failure.
 */
export async function fetchRecommendations(
  request: RecommendationRequest,
): Promise<RecommendationResponse> {
  // U8: fetch rejects on network failure, so it is caught and shown the same way as a 503.
  ...
}
```
Bad:
```ts
// api stuff
export async function fetchRecommendations(request: any) {
  // call fetch
  console.log(request);
  // const old = await legacyFetch(request);
  // TODO fix errors
  ...
}
```

## Python
Good:
```python
"""POST /recommendations endpoint and fixture scenarios (A1, A4-A6)."""


class RecommendationRequest(BaseModel):
    """Traveller message and demo scenario (A1-A3).

    Attributes:
        message: Traveller's request; 1000 characters at most.
        scenario: Demo control selecting the outcome; required by DEC-1.
    """

    # DEC-3: the pattern rejects whitespace-only messages, which min_length alone allows.
    message: str = Field(min_length=1, max_length=1000, pattern=r"\S")
    scenario: Scenario
```
Bad:
```python
class Req(BaseModel):
    # the message
    message: str
    # scenario: str = "success"
    scenario: str  # TODO validate
    print("loaded")
```
