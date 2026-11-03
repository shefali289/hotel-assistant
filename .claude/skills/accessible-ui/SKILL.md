---
name: accessible-ui
description: Use when designing, building or reviewing web/ UI, including UI co-creation with the owner, accessibility and small-screen conventions, and the manual keyboard and 375px check script.
---

# Accessible UI

## UI co-creation procedure
Do this before any UI test or code, and record it in section 8 of the task doc.
1. Draw **2 options** as ASCII wireframes, each at 375px and desktop.
2. List the component breakdown.
3. List every state: idle, validation error, loading, results, selected, empty, failure.
4. Write the exact copy: labels, buttons, status messages, headings.
5. Write the keyboard map: tab order, and what Enter, Space and arrow keys do.
6. List questions for the owner. Subagents return these to the main session, which asks and waits.
7. Record the owner's choice and why. Browser-review changes go in the same section.

Example wireframe fragment:
```
375px                    Desktop
+-----------------+      +---------------------------------+
| Message         |      | Message                         |
| [             ] |      | [                             ] |
| Scenario        |      | Scenario [Success v]   [Find]   |
| [Success      v]|      +---------------------------------+
| [ Find hotels ] |      | ( ) Harbour House    NZD 220    |
+-----------------+      +---------------------------------+
```

## Conventions
- Use semantic HTML: `main`, `form`, `h1`–`h2`, `ul`, `fieldset`, `legend`.
- Label every control with a visible `<label>`.
- Select hotels with a native radio group; arrow keys then work for free.
- Use real `<button>` elements. No clickable divs.
- Keep a single `aria-live="polite"` status region always mounted, so screen readers announce changes.
- After a response, move focus to the results or error heading (`tabIndex={-1}`, then `.focus()`).
- Show visible focus rings: `focus-visible:ring-2 focus-visible:ring-offset-2`. Never remove an outline without a replacement.
- Build mobile-first with Tailwind: a single column at 375px, `md:` for wider layouts, no horizontal scrolling.
- Keep the fixture label visible on results.
- Format prices with the currency: `new Intl.NumberFormat("en-NZ", { style: "currency", currency }).format(price)`.

```tsx
// U6: native radios give single selection and arrow-key support without extra code.
<fieldset>
  <legend>Choose a hotel</legend>
  {hotels.map((hotel) => (
    <label key={hotel.id} className="block rounded border p-4 focus-within:ring-2">
      <input
        type="radio"
        name="hotel"
        value={hotel.id}
        checked={selectedId === hotel.id}
        onChange={() => setSelectedId(hotel.id)}
      />
      <span className="ml-2 font-semibold">{hotel.name}</span>
    </label>
  ))}
</fieldset>
```

## Manual check script
Run it in a real browser and record each result in `docs/manual-checks.md`. Only the owner marks a manual check as Pass.

Keyboard, with the mouse unused:
1. Tab reaches message, scenario and submit in order, with a visible focus ring each time.
2. Empty submit is blocked and the message is announced.
3. Submit from the keyboard; progress is announced and submit is disabled.
4. Focus lands on the results heading.
5. Arrow keys move between hotels; the summary updates.
6. With the error scenario, focus lands on the error heading; Retry works with Enter and Space.
7. With the empty scenario, the empty message is reachable and announced.

Small screen, at 375px in dev tools:
1. There is no horizontal scrolling in any state.
2. Cards stack in a single column and no text is clipped.
3. Controls are comfortable to tap, and the summary is visible without hunting for it.
