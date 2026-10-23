# DemoBlaze + Restful-Booker QA Automation Framework

Ready-to-run Playwright + TypeScript framework containing DemoBlaze UI tests and Restful-Booker API tests.

## Requirements

- Node.js 18 or newer (Node 20 LTS recommended)
- npm (included with Node.js)
- Git (optional)
- Java 8+ only if you want to open the generated Allure report

## Open and run in VS Code

1. Extract the ZIP file.
2. In VS Code, choose **File → Open Folder** and open `demoblaze-qa-assessment`.
3. Open **Terminal → New Terminal**.
4. Install dependencies:

   ```powershell
   npm install
   npx playwright install
   ```

   On Linux CI, use `npx playwright install --with-deps`.

5. (Optional) Copy `.env.example` to `.env` if you need to change URLs or credentials. Defaults work without a `.env` file.
6. Run API tests first:

   ```powershell
   npm run test:api
   ```

7. Run the UI tests on Chromium:

   ```powershell
   npm run test:chromium
   ```

8. Run all projects (API + Chromium + Firefox + WebKit):

   ```powershell
   npm test
   ```

The first full run can take a while because tests run across three browsers. The public demo websites can be slow or temporarily unavailable.

## Useful commands

| Command | Purpose |
|---|---|
| `npm run typecheck` | Type-check the TypeScript source |
| `npm run test:api` | API tests only, no browser required |
| `npm run test:chromium` | UI tests in Chromium |
| `npm run test:firefox` | UI tests in Firefox |
| `npm run test:webkit` | UI tests in WebKit |
| `npm run test:smoke` | Tests tagged `@smoke` |
| `npm run test:headed` | Run tests with visible browsers |
| `npm run test:ui` | Open Playwright's interactive UI |
| `npm run report` | Open Playwright HTML report after a run |
| `npm run allure:generate` | Generate Allure report and add watermark |
| `npm run allure:open` | Open an already generated Allure report |
| `npm run codegen` | Open Playwright code generator for DemoBlaze |

## Project layout

```text
demoblaze-qa-assessment/
├── .github/
│   └── workflows/
│       └── playwright.yml
├── assets/
│   └── watermark.svg
├── docs/
│   └── TEST-PLAN.md
├── scripts/
│   └── brand-allure.mjs
├── src/
│   ├── api/
│   │   └── booker-client.ts
│   ├── config/
│   │   └── env.ts
│   ├── data/
│   │   ├── bookings.ts
│   │   ├── products.ts
│   │   └── users.ts
│   ├── fixtures/
│   │   ├── api-fixtures.ts
│   │   └── test-options.ts
│   └── pages/
│       ├── auth.modal.ts
│       ├── base.page.ts
│       ├── cart.page.ts
│       ├── home.page.ts
│       ├── navbar.component.ts
│       └── product.page.ts
├── tests/
│   ├── api/
│   │   ├── auth.spec.ts
│   │   ├── booking-crud.spec.ts
│   │   └── booking-negative.spec.ts
│   ├── auth.spec.ts
│   ├── cart.spec.ts
│   ├── checkout.spec.ts
│   └── product-browsing.spec.ts
├── .env.example
├── .gitignore
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

## Configuration

- `BASE_URL`: DemoBlaze URL.
- `DEMOBLAZE_USERNAME` / `DEMOBLAZE_PASSWORD`: optional account for future test scenarios. Current signup tests generate unique users.
- `API_BASE_URL`: Restful-Booker API URL.
- `API_USERNAME` / `API_PASSWORD`: Restful-Booker API credentials.
- `HTTPS_PROXY` / `HTTP_PROXY`: optional proxy for API requests.

## Reports

Playwright HTML report:

```powershell
npm test
npm run report
```

Allure report:

```powershell
npm test
npm run allure:generate
npm run allure:open
```

The Allure branding script adds a light watermark to the generated HTML report. It does not alter test results.

## Notes

- This project uses public demo services. They can be rate-limited, reset data, or have transient failures.
- Do not use real passwords or production credentials in `.env`.
- If browsers are missing, run `npx playwright install`.
- If TypeScript reports an issue, run `npm run typecheck` and fix that before running tests.
