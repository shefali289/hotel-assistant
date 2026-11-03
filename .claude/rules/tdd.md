# TDD

- Write no app code without a failing test first.
- The tester writes tests; the implementer writes code.
- Do not edit tests in green without the owner's approval.
- Map every test to a requirement ID.
- Refactor only on green.
- Exception: layout and visible focus (U9, the focus part of U10) cannot fail in jsdom. Verify them by manual check and screenshot; everything else still needs a failing test first.
