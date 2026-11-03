# Review: T2

Task doc: [T2-web-core-journey](../tasks/completed/T2-web-core-journey.md)

## Findings
Severity: blocker | should | nit.
Category: requirement | contract | tests/TDD | accessibility | comments/code quality | security | scope.

| # | Severity | Category | File:line | Requirement ID | Finding | Suggested fix | Owner verdict (fix / accept / won't fix + reason) |
|---|---|---|---|---|---|---|---|
| 1 | should | requirement | docs/requirements.md (U1–U6, U11, Q1, Q8 rows); task doc section 4 and section 18 | U1–U6, U11, Q1, Q8 | The register and section 4 still say "Not started" with no evidence, and section 18 (time) is empty. G4 Part A needs all three. | At G4 Part A: U1–U6 and U11 Done with evidence (page.test.tsx, recommendations.test.ts, 32 passed, T2-G3); Q1 In progress (T3 closes); add T2 to Q8 evidence; log time. || fix (owner, 2026-11-03): fixed at G4 Part A |
| 2 | nit | accessibility | web/components/Results.tsx:36-38 | U5 (U10 in T3) | The focused results section has `focus:outline-none` with no replacement, which goes against the accessible-ui convention. This is the owner's recorded decision. Risk is low: the section isn't a tab stop, it scrolls into view, and the next Tab reaches radios that have a visible ring. The accessible-ui manual script still says "focus lands on the results heading". | Accept as recorded. In T3 (U10) and T4 (Q5), word the manual check as "focus lands on the Recommended hotels section (no outline by owner choice); next Tab reaches the hotel radios" and list it as a deviation in docs/manual-checks.md. || accept (owner, 2026-11-03): recorded deviation; T3/T4 manual check worded to match |
| 3 | nit | accessibility | web/components/HotelCard.tsx:39; web/components/RequestForm.tsx:120 | U5, U1 (U10 in T3) | The card hover lift (`hover:-translate-y-0.5`) and the button press (`active:scale-[0.98]`) aren't gated by `motion-safe`, unlike section 8's visual direction. Framer animations and the scroll are gated. | Use `motion-safe:hover:-translate-y-0.5` and `motion-safe:active:scale-[0.98]`, or defer to T3 U10. || fix (owner, 2026-11-03): fixed, run 7 green |
| 4 | nit | comments/code quality | web/lib/recommendations.ts:52 | U1 | The comment says reading the env value per call means "a changed env value is always honoured". Next.js inlines `NEXT_PUBLIC_*` at build or dev start, so that isn't true. The real reason is so tests can stub it. | Reword: "U1: read per call, not at module load, so tests can stub it; Next.js inlines the value at build time." || fix (owner, 2026-11-03): fixed, run 7 green |
| 5 | nit | comments/code quality | web/app/globals.css:10-11,13 | Q8 | This hand-edited scaffold file keeps the unused tokens `--color-background`, `--color-foreground` and `--font-mono`. | Remove them and keep `--font-sans`. || fix (owner, 2026-11-03): fixed, run 7 green |
| 6 | nit | comments/code quality | web/next.config.ts:1 | Q8 | It has no header and is treated as an exempt unmodified scaffold file. That can't be checked from the tree, it contains non-obvious options, and it will be committed. | Add a one-line header so the header grep passes cleanly. || fix (owner, 2026-11-03): fixed, run 7 green |
| 7 | nit | tests/TDD | docs/gates/T2-G3.md item 8 | Q8 | The evidence cites `TODO(T3)` at HotelAssistant.tsx:39; it's at line 51. | Fix the line number. || fix (owner, 2026-11-03): fixed |

## Not verified
- `npm run build` was not rerun by the reviewer (dev server running); it relies on implementer run 6 and T2-G3 item 5.
- Visual layout at 375px and desktop, visible focus rings and the sticky summary rest on the owner's G3 browser review. The reviewer checked only the Tailwind classes.
- Real-browser CORS and the full journey rest on the owner's G3 review; the reviewer only probed with curl (API 200, web 200).
- Colour contrast is estimated from Tailwind palette values, not measured with a tool.
- Screen-reader announcements of the focused results region and the `role="alert"` message; no assistive technology was run.
- Whether `web/next.config.ts` and `web/eslint.config.mjs` are byte-for-byte the create-next-app output.

## Summary
T2 delivers the full ask, wait, review and select journey to the section 4 criteria. The contract types mirror `openapi.yaml`, and DEC-1 and DEC-3 are always respected. Tests use only a fetch stub, cite their IDs, are unchanged since the re-saved G2 fingerprint, and all checks pass. No blockers: one should (G4 Part A bookkeeping) and six nits.
