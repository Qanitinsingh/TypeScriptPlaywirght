Run the Playwright tests in a single Chrome session and produce an Allure report.

Setup

1. Install new dev dependencies added to package.json:

```bash
npm install
```

2. Run the single-chrome test and generate/open Allure report:

```bash
npm run test:allure
```

Notes
- The tests use a Page Object in `tests/pages/HomePage.ts`.
- Logs are written to `logs/test.log` using Winston.
- The test launches one browser session (serial tests) to run run1, run2, run3.
