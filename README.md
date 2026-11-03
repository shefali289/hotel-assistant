# Hotel Assistant

A traveller asks for a hotel, reviews the assistant's fixture-backed recommendations, and chooses one.

The repo has three parts: a FastAPI service in `api/` that serves `POST /recommendations` from fixtures, a Next.js web app in `web/` for the ask, review and select journey, and Playwright end-to-end tests in `e2e/` that run both together. `openapi.yaml` is the API contract. `APPROACH.md` explains the scope, decisions and limits.

## Submitted branch and commit
- **Branch:** `main`
- **Commit:** `63ee0c6` (merge: T4 Evidence and documentation). A later docs-only commit on `main` records this hash; it changes no code.

## Runtime versions
Read on the development machine (Windows 11) from the commands shown.

| Runtime or package | Version | Read with |
|---|---|---|
| Node.js | 23.1.0 | `node -v` |
| npm | 11.15.0 | `npm -v` |
| Python | 3.12.7 | `api/.venv/Scripts/python --version` |
| next | 16.4.4 | `npm ls next react vitest --depth=0` (in `web/`) |
| react | 19.3.0 | same |
| vitest | 3.2.7 | same |
| fastapi | 0.162.0 | `pip show fastapi pydantic uvicorn pytest` (in the api venv) |
| pydantic | 2.14.2 | same |
| uvicorn | 0.54.0 | same |
| pytest | 9.2.0 | same |
| @playwright/test | 1.64.1 | `npx playwright --version` (in `e2e/`) |
| Chromium for Playwright | Chrome Headless Shell 156.0.8078.4 | installed by `npx playwright install chromium` |

Exact pins are in `api/requirements.txt`, `web/package-lock.json` and `e2e/package-lock.json`. Python 3.12 and Node 23 are the tested versions; other versions are not checked.

## Environment setup
No secrets are needed. Each app reads only one variable, and both have working defaults, so the app runs without any setup. `.env.example` lists the two variables with their local defaults; it is not loaded by anything itself.

| Variable | Read by | Where to set it | Default |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | web (browser calls) | `web/.env.local` (copy the line from `.env.example`); Next.js reads it at dev start | `http://localhost:8000` |
| `FIXTURE_DELAY_MS` | api (success scenario delay, DEC-5) | the shell that starts uvicorn, for example `FIXTURE_DELAY_MS=0 uvicorn ...` in Git Bash or `$env:FIXTURE_DELAY_MS=0` in PowerShell | `800` |

The API allows browser calls only from `http://localhost:3000` and `http://127.0.0.1:3000`, so run the web app on port 3000. Never commit `.env` or `.env.local`; both are in `.gitignore`.

## Install
Clone the repo, then install each part from its own folder.

**api** (from `api/`):
```
python -m venv .venv
.venv\Scripts\activate            # Windows cmd or PowerShell
# source .venv/Scripts/activate   # Windows Git Bash
# source .venv/bin/activate       # macOS or Linux
pip install -r requirements.txt
```

**web** (from `web/`):
```
npm install
```

**e2e** (from `e2e/`; needs the api venv and `web/node_modules` above):
```
npm install
npx playwright install chromium
```

## Run
Start the API, then the web app, each in its own terminal.

```
# api (from api/, venv active)
uvicorn app.main:app --reload --port 8000

# web (from web/)
npm run dev
```

Open http://localhost:3000.

## Checks
```
# api (from api/, venv active)
pytest -q
ruff check
ruff format --check

# web (from web/)
npm test
npm run lint
npx next typegen   # once in a fresh clone: generates Next.js route types (LayoutProps) for tsc
npx tsc --noEmit

# e2e (from e2e/)
npx playwright test
npx tsc --noEmit
```

`npx playwright test` starts the API (with the venv's Python, so no activation is needed) and the web app itself, or reuses them if they are already running on ports 8000 and 3000. It runs the Q3 main journey and the Q4 failure and Retry specs in Chromium at 1280 by 900 and at 375 by 812, against the real servers with no mocked responses.

To refresh the evidence screenshots in `docs/evidence/`, set `E2E_SCREENSHOTS=1` (Git Bash):
```
E2E_SCREENSHOTS=1 npx playwright test
```
In PowerShell:
```
$env:E2E_SCREENSHOTS="1"; npx playwright test
Remove-Item Env:E2E_SCREENSHOTS
```
Without the variable, test runs leave the tracked screenshots alone.

## Fixture and demo path
The API does not interpret the message: every request returns fixed fixture data, chosen by the **Demo scenario (test control)** select. The results carry a "Demo data (fixture)" label.

1. Open http://localhost:3000 and type the brief's example into **What are you looking for?**:
   `Find a Wellington hotel for two nights, up to NZD 250 per night; breakfast preferred.`
2. **Success:** select **Find hotels**. "Finding hotels..." shows for about 800 ms, then the assistant message and three hotels: Harbour House (NZD 220, breakfast included), City Garden (NZD 245, breakfast included) and Quay Rooms (NZD 195, breakfast extra). Select a hotel (click the card, or Tab to the options and use the arrow keys) and "Your selection" summarises it. No booking is made.
3. **Empty results:** change the scenario and select **Find hotels**. "No hotels to show" appears.
4. **Service error:** change the scenario and select **Find hotels**. The API returns 503, and the page shows "We could not get recommendations" with the API's message and a **Retry** button. Under this scenario Retry re-sends the same request, so it fails again by design. To recover, change the scenario to Success and select **Find hotels**. The e2e Q4 spec proves that Retry itself recovers once the service answers again.
5. Submitting an empty or whitespace-only message is blocked in the page with a message, and no request is sent.

The whole journey works from the keyboard, and the layout works at 375px wide.

## Evidence
- End-to-end screenshots (Q3, Q4), desktop and 375px:
  - [Journey, hotel selected, desktop](docs/evidence/T4-e2e-journey-selected-desktop.png) and [375px](docs/evidence/T4-e2e-journey-selected-mobile-375.png)
  - [Service failure, desktop](docs/evidence/T4-e2e-failure-desktop.png) and [375px](docs/evidence/T4-e2e-failure-mobile-375.png) (the Q4 spec forces the 503 in transit, so the scenario control shows Success)
  - [Recovered after Retry, desktop](docs/evidence/T4-e2e-retry-recovered-desktop.png) and [375px](docs/evidence/T4-e2e-retry-recovered-mobile-375.png)
- Small-screen and focus screenshots from the T3 review: `docs/evidence/T3-375-*.png`, `docs/evidence/T3-1280-*.png`, `docs/evidence/T3-focus-*.png` (in [docs/evidence](docs/evidence/))
- [AGENTS.md loaded in Claude Code](docs/evidence/T4-agents-md-loaded.png) (D4)
- [Manual keyboard and small-screen checks](docs/manual-checks.md)
- [Requirement register and coverage](docs/requirements.md)
- Gate reports in [docs/gates](docs/gates/), reviews in [docs/reviews](docs/reviews/), task docs in [docs/tasks/completed](docs/tasks/completed/)

## Troubleshooting
- **A proxy intercepts localhost.** On networks with a proxy, requests to localhost may go to the proxy. Set `NO_PROXY=localhost,127.0.0.1` in the shell before running the e2e tests or the servers, and use `curl --noproxy '*' ...` for manual API calls. The list must use commas: Node ignores a semicolon-separated value such as `localhost;127.0.0.1`. The symptom is that every e2e test fails at `page.goto` with `net::ERR_CONNECTION_REFUSED` and no `[WebServer]` lines appear in the output, because the proxy answers Playwright's health checks and Playwright then reuses servers that are not running. In Git Bash:
  ```
  NO_PROXY=localhost,127.0.0.1 no_proxy=localhost,127.0.0.1 npx playwright test
  ```
  In PowerShell:
  ```
  $env:NO_PROXY="localhost,127.0.0.1"; $env:no_proxy=$env:NO_PROXY; npx playwright test
  ```
- **The browser shows a network error.** Check that the API is running on port 8000 and the web app on port 3000 (the API's CORS list allows only that port), and that `NEXT_PUBLIC_API_BASE_URL`, if set, is `http://localhost:8000`. Restart `npm run dev` after changing `web/.env.local`.
- **Q3 fails on the progress check.** If an API started with `FIXTURE_DELAY_MS=0` is already running on port 8000, e2e reuses it and Q3's progress assertions can race the instant response. Stop that API first, so Playwright starts it with the default 800 ms delay.
- **`tsc` reports `Cannot find name 'LayoutProps'`.** Run `npx next typegen` in `web/` (or start `npm run dev` once); Next.js generates these types into the gitignored `.next/` folder.
- **The e2e run times out starting the servers.** The api venv must exist at `api/.venv` with the requirements installed, and `web/node_modules` must be installed. The first Next.js compile can take a while; the timeout is 120 s.
