# JavaScriptPlaywright — Test Framework Overview

This repository contains a lightweight Playwright-based test framework organized with Page Object Models (POM), centralized test data, logging, video recording, and Allure-compatible results. The project is intentionally opinionated to keep tests maintainable and easy to extend.

This README explains the project structure, key classes, how to run tests, where to change values (URLs / test data), and recommended best practices.

## Quick start

- Install dependencies:
  ```bash
  npm install
  ```
- Run a single spec (Chromium, headed):
  ```bash
  npx playwright test tests/novice/novice-practice.spec.ts --project=chromium
  ```
- Run all category tests:
  ```bash
  npx playwright test tests/novice tests/intermediate tests/expert --project=chromium
  ```
- Open the Playwright HTML report produced by the last run:
  ```bash
  npx playwright show-report
  ```
- Generate & open Allure report (after tests produced `allure-results`):
  ```bash
  npx allure generate allure-results --clean -o allure-report
  npx allure open allure-report
  ```

## Repository layout

Top-level important files/folders:

- `package.json` — scripts and devDependencies (Playwright, Allure, logging libs).
- `playwright.config.ts` — Playwright configuration (projects, reporters, headed mode).
- `tests/` — all test code, POMs, fixtures, and test data.
- `allure-results/`, `allure-report/` — generated test artifact directories.
- `logs/`, `videos/` — runtime artifacts (per-run logs and recordings).

Inside `tests/`:

- `pages/` — Page Object Models (POMs). Each file represents a page or a component.
  - `LandingPage.ts` — landing page POM (click Novice/Intermediate/Expert, read launch URL attribute).
  - `PracticeFormPage.ts` — POM for the form inside an iframe. Methods:
    - `goto(url)` — navigate page (used for fixtures or real site)
    - `switchToFrame()` — locate & switch to the iframe
    - `selectLevel(level)`, `fillName(name)`, `fillEmail(email)` — basic inputs
    - `setSubscribe(value)`, `chooseExperience(value)` — checkbox & radio
    - `selectCategory(value)`, `setStartDate(value)` — select/date
    - `uploadFile(path)`, `dragToTarget()` — file upload & drag/drop support
    - `fillTextBox(text)`, `submit()`, `getResultText()` — other interactions
  - `HomePage.ts` — (legacy) helper that was used earlier — can be reused or removed.

- `fixtures/` — static HTML fixtures used by tests (local, deterministic). Key files:
  - `landing.html` — simple landing with `#novice`, `#intermediate`, `#expert` buttons and a `#launchUrl` element storing the launch URL in `data-url`.
  - `practice-form.html` + `practice-form-iframe.html` — container + iframe with the practice form (many controls).

- `test-data/` — centralized JSON files representing test payloads.
  - `novice.json`, `intermediate.json`, `expert.json` — example data used by their respective specs.

- `helpers/` — shared helpers and utilities.
  - `testUtils.ts` — centralizes per-test setup/teardown, logger creation, video folder setup, and attaching artifacts to the test result. Use `createTestContext(browser, testInfo, prefix)` to get a test context.

- `novice/`, `intermediate/`, `expert/` — folder-per-skill-level containing related specs.
  - `novice/novice-practice.spec.ts` — full practice flow (fills form from `test-data/novice.json`) and attaches logs/video.
  - `intermediate/intermediate-practice.spec.ts` — minimal sample that exercises the first option (structure to build upon).
  - `expert/expert-practice.spec.ts` — minimal sample that exercises the first option (structure to build upon).

## Key classes and responsibilities

- LandingPage (POM): simple page interactions for selecting category and exposing the target `data-url`.
- PracticeFormPage (POM): encapsulates all interactions with the iframe-hosted practice form (selects, fills, uploads, drag/drop, etc.). Throwing errors if frame isn't initialized helps detect incorrect navigation.
- testUtils.createTestContext: central helper that creates a video-enabled context, page, logger (Winston-based), and returns a `closeAndAttach()` function that safely closes the context and attaches logs/video to the Playwright test artifacts.

## Where values live and how to change them

- Launch URL used by landing fixture: `tests/fixtures/landing.html` — element `#launchUrl` has `data-url="https://alphabetaops.com/"`. Edit that attribute if you want to change the launch target.
- Tests that use fixtures navigate to local `file://` URLs (fixtures). To run against the real site, edit the spec to `await landing.goto('https://alphabetaops.com/')` or change the POM usage accordingly.
- Centralized test data: `tests/test-data/*.json`. Update or add new data sets and reference them from spec files.

Note: make sure test-data keys match what the spec expects. If you edited test files manually (for example, newer specs expect `practiceFormLevel` but data uses `level`), update either side to match.

## How tests attach artifacts

- Each spec obtains a TestContext from `testUtils.createTestContext`, which:
  - creates a timestamped log file in `logs/` (Winston)
  - creates a video-enabled BrowserContext that writes `.webm` files under `videos/`
  - returns `closeAndAttach()` which closes the context (finalizing video) and attaches the most recent video and log file to the test via `testInfo.attach(...)`.

This keeps artifacts with the test result for Playwright HTML viewers and Allure (if you generate Allure from `allure-results`).

## Running and generating reports

- Run tests (headless or headed) using the scripts in `package.json` or `npx playwright test` directly. Example:
  ```bash
  npx playwright test --project=chromium
  ```
- Playwright HTML report (default reporter) can be shown with:
  ```bash
  npx playwright show-report
  ```
- Allure report (if you use the Allure reporter and `allure-playwright`):
  ```bash
  npx allure generate allure-results --clean -o allure-report
  npx allure open allure-report
  ```

## Best practices & conventions used

- Page Object Model (POM): POMs are in `tests/pages/` and expose clear methods (no assertions inside POMs). POM methods throw if preconditions aren't met (for example, frame not initialized).
- Centralized test data: use `tests/test-data/*.json` to keep test logic independent from data. Use clear key names like `practiceFormName`, `practiceFormEmail`, etc. Keep keys consistent across data and tests.
- Logging and artifacts: each test gets its own timestamped logger and video capture for debugging. Use `testUtils.createTestContext` for consistent behavior.
- Keep tests small and focused: use per-folder tests for groups of related screens and aggregate in higher-level suites when needed.

## Extending the framework

- Add new POMs under `tests/pages/` and keep methods small and descriptive.
- Add new fixtures under `tests/fixtures/` for deterministic tests.
- Add new data JSON under `tests/test-data/` and reference from specs.
- If you want to run multiple data-driven cases, use Playwright `test.describe()` with `test.step()` or implement a small data-provider loop to run the same spec with different inputs.

## Troubleshooting

- If Allure report shows no tests or empty data, make sure you ran Playwright without overriding reporters on the CLI. Don't pass `--reporter` or use the configured reporters in `playwright.config.ts`.
- If a test fails to find selectors on a real site, double-check selectors in POMs and consider using robust selectors (roles, data-testids, or more specific CSS/XPath) rather than brittle text-based selectors.
- If video files are not attached, ensure the `videos/` folder is writable and that contexts are properly closed (the helper closes contexts in `closeAndAttach`).

## Cleanup tasks and recommended next steps

- Consider moving environment-specific values (like production/staging URLs) into a configuration file or `.env` and read them in tests.
- Implement `recordVideo: 'on-first-retry'` or conditional video recording to save disk space in CI.
- Add a small `tests/helpers/assertions.ts` for common assertions (e.g., waiting for result text format) to keep specs concise.

---

If you'd like, I can:
- generate a `README.md` inside each category folder (`novice`, `intermediate`, `expert`) with examples and how-to for adding tests, or
- create a CI workflow (GitHub Actions) that runs tests, collects artifacts, and publishes the Allure report.

Tell me which follow-up you prefer and I will implement it.
