# Review: T3

Task doc: [T3-web-states-accessibility](../tasks/completed/T3-web-states-accessibility.md)

## Findings
Severity: blocker | should | nit.
Category: requirement | contract | tests/TDD | accessibility | comments/code quality | security | scope.

| # | Severity | Category | File:line | Requirement ID | Finding | Suggested fix | Owner verdict (fix / accept / won't fix + reason) |
|---|---|---|---|---|---|---|---|
| 1 | should | tests/TDD | web/lib/recommendations.ts:73-84, 110-111; web/components/HotelAssistant.tsx:27-33 | U8 | The owner-approved fallback for a 503 with no usable `detail` (non-JSON body, missing `detail`, or a non-string `detail`) has no test. It should show "The hotel service is not available right now. Please try again." Only the 503-with-detail and 500 paths are tested. The code looks right, but this branch is unguarded. | Add one U8 page test, for example `mockFetch503({})` expecting the fixed copy. That edits a test file after G2, so it needs owner approval and a new fingerprint. Or accept it and record it in section 16. | fix (owner, 2026-11-03): tester adds the test; G2 fingerprint re-saved; G3 checks rerun |
| 2 | should | tests/TDD | web/app/states.test.tsx:100-115, 256-273 | U7, U8 | The criteria say the empty or failure state is cleared *while loading* on a new submit. The resubmit tests only check after the new response arrives. Clearing during the pending state is tested only on the Retry path (states.test.tsx:210-226). Both paths share `send()`, so the risk is low. | Accept, since both paths share `send()`. Or add a pending-resubmit assertion (needs owner approval after G2). | accept (owner, 2026-11-03): resubmit and Retry share `send()`; Retry test covers clearing while pending; recorded in section 16 |
| 3 | nit | tests/TDD | web/app/keyboard.test.tsx:61-72 | U10 | U10 says Tab reaches "the checked radio, or the first when none is checked". Only the none-checked case is tested. | Accept: this is native radio behaviour, and section 16 already notes the limits of user-event. | accept (owner, 2026-11-03): native radio behaviour; recorded in section 16 |
| 4 | nit | tests/TDD | web/app/states.test.tsx:189 | U8 | The criterion asks for the same headers as the failed request. The test checks the retry's Content-Type equals the literal "application/json" instead of comparing it with the first call's headers. The two are equivalent today. | Accept, or compare the two calls' headers directly in a later edit. | accept (owner, 2026-11-03): equivalent today; both calls built by the same client function |
| 5 | nit | requirement | docs/requirements.md:28-31, 37, 42, 44; task doc section 4 Status column | U7–U10, Q1, Q6, Q8 | The requirement statuses and evidence still say Not started / In progress. This is expected before G4 Part A. | At G4 Part A: set U7–U10, Q1 and Q6 to Done with evidence, and add T3 to the Q8 evidence (Q8 closes in T4). | fix (owner, 2026-11-03): done at G4 Part A |
| 6 | nit | comments/code quality | web/components/HotelAssistant.tsx:32; task doc section 16 | U8 | Section 16 covers a 200 body that isn't JSON. A 200 that is valid JSON but the wrong shape (for example no `hotels`) would throw during render of `Results`, outside the catch, so the failure state would not show. This is outside the contract and can't happen with the fixture API. | Widen the section 16 risk line to "a 200 with invalid JSON or a body that does not match the schema". No code change. | fix (owner, 2026-11-03): section 16 risk line widened |

## Not verified
- Screen-reader output for the empty and failure sections; no assistive technology was run.
- Native `<select>` keyboard behaviour, beyond the browser default.
- Contrast ratios: the Retry focus ring was judged by eye from the screenshots, not measured.
- The reviewer viewed 3 of the 15 screenshots (T3-375-failure, T3-1280-empty, T3-focus-retry); the main session viewed the rest at G3.
- End-to-end runs: `e2e/` is created in T4.

## Summary
T3 delivers the empty state (U7) and the recoverable failure with Retry (U8), and hardens the journey for 375px screens (U9) and keyboard use (U10), all to the section 4 criteria with Option A. `openapi.yaml` is unchanged, and the client reads only a 503's string `detail` (DEC-4). The 22 red tests were logged before green. The test files are unchanged since the G2 fingerprint. All checks pass (api 45, web 59, lint, format, typecheck). The comment greps and secret scan are clean. There are no blockers: 2 shoulds, both small test gaps, and 4 nits.
