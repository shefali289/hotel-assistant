# Manual checks

Script: see the accessible-ui skill. Only the project owner records a Pass.

Browser and version: Chrome 156.0.8078.80 (Windows 11), against the real local API
Date: 2026-11-03 (T3 G3 browser review; owner confirmed all checks pass on 2026-11-04: "pass all manual checks - verified")

## Keyboard
| # | Check | Result (Pass/Fail) | Notes |
|---|---|---|---|
| 1 | Tab reaches message, scenario and submit in order, with a visible focus ring | Pass | `docs/evidence/T3-focus-message.png`, `T3-focus-scenario.png`, `T3-focus-find-hotels.png` |
| 2 | Empty submit is blocked and the message is announced | Pass | `docs/evidence/T3-375-validation.png` |
| 3 | Submit from the keyboard; progress is announced and submit is disabled | Pass | `docs/evidence/T3-375-loading.png`; also asserted by e2e Q3 |
| 4 | Focus lands on the results heading | Pass | `docs/evidence/T3-375-results.png`. U10 deviation: the script-focused results heading shows no outline (T2/T3 section 7) |
| 5 | Arrow keys move between hotels; the summary updates | Pass | `docs/evidence/T3-focus-hotel-card.png`, `T3-375-selected.png` |
| 6 | Error scenario: focus lands on the error heading; Retry works with Enter and Space | Pass | `docs/evidence/T3-375-failure.png`, `T3-focus-retry.png`; Retry recovery also proven by e2e Q4. U10 deviation: no outline on the script-focused failure section (T3 section 7) |
| 7 | Empty scenario: the empty message is reachable and announced | Pass | `docs/evidence/T3-375-empty.png`, `T3-1280-empty.png` |

## Small screen (375px)
| # | Check | Result (Pass/Fail) | Notes |
|---|---|---|---|
| 1 | No horizontal scrolling in any state | Pass | `docs/evidence/T3-375-*.png`; `T4-e2e-*-mobile-375.png` |
| 2 | Cards stack in a single column and no text is clipped | Pass | `docs/evidence/T3-375-results.png`, `T4-e2e-journey-selected-mobile-375.png` (the round "N" badge is the Next.js dev indicator, T4 review R6) |
| 3 | Controls are comfortable to tap, and the summary is easy to find | Pass | `docs/evidence/T3-375-selected.png`, `T4-e2e-retry-recovered-mobile-375.png` |
