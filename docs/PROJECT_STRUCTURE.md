# Project Structure — High-Level Reference
 
This document maps **every folder and file** in the `demoblaze-qa-assessment` framework and explains, at a high level, what each one does and why it exists.
 
The project is a Playwright + TypeScript QA automation framework that tests:
- **UI**: the [DemoBlaze](https://www.demoblaze.com) e-commerce demo site
- **API**: the [Restful-Booker](https://restful-booker.herokuapp.com) booking service
 
---
 
## Directory Tree (at a glance)
 
```
demoblaze-qa-assessment/
├── .github/workflows/      CI pipeline (GitHub Actions)
├── assets/                 Branding media (logo, watermark)
├── docs/                   Project documentation
├── scripts/                Build/automation scripts
├── src/                    Test infrastructure (framework code)
│   ├── api/                Typed API client
│   ├── config/             Centralized environment config
│   ├── data/               Test data factories & constants
│   ├── fixtures/           Custom Playwright fixtures (DI)
│   └── pages/              Page Object Model (UI layer)
├── tests/                  Test specifications
│   └── api/                API test specs
├── .env.example            Environment variable template
├── .gitignore              Git exclusions
├── package.json            Scripts & dependencies
├── playwright.config.ts    Playwright runner configuration
├── tsconfig.json           TypeScript compiler settings
└── README.md               Project overview
```
 
Generated (git-ignored) output folders: `playwright-report/`, `allure-results/`, `allure-report/`, `test-results/`.
 
---
 
## Root Configuration Files
 
| File | High-level purpose |
|------|--------------------|
| [package.json](../package.json) | Project metadata, npm scripts (`test`, `test:headed`, `test:ui`, `test:chromium`, `test:api`, `test:smoke`, `report`, `allure:generate`, `codegen`), and dev dependencies (`@playwright/test`, `typescript`, `dotenv`, `allure-playwright`, `allure-commandline`). |
| [playwright.config.ts](../playwright.config.ts) | Test runner configuration: timeouts, retries, parallel execution, HTML + Allure reporters, and 4 projects — `chromium`, `firefox`, `webkit` (UI) plus an `api` project. Base URL comes from the central env config. |
| [tsconfig.json](../tsconfig.json) | TypeScript compiler settings: ES2022 target, strict mode, DOM libs, no unused vars/params, JSON imports allowed. |
| [.env.example](../.env.example) | Template for environment variables (`BASE_URL`, `API_BASE_URL`, `API_USERNAME`/`API_PASSWORD`, optional DemoBlaze creds). Copy to `.env` and fill in; real secrets are never committed. |
| [.gitignore](../.gitignore) | Excludes `node_modules`, report/result folders, `.env` files, and OS/editor artifacts from version control. |
| [README.md](../README.md) | Entry-point overview: tech stack, prerequisites, setup steps, test commands, project structure, and key design decisions. |
 
---
 
## `.github/workflows/` — CI/CD Pipeline
 
| File | High-level purpose |
|------|--------------------|
| `playwright.yml` | GitHub Actions workflow (on push/PR to `main`). Checks out code, sets up Node 20, installs deps and browsers, runs the full suite (API + 3 browsers), and uploads the Playwright HTML report as an artifact. Honors the configured retries to absorb flakiness. |
 
---
 
## `assets/` — Branding Media
 
| File | High-level purpose |
|------|--------------------|
| `logo.svg` | Logo image available for report/branding use. |
| `watermark.svg` | Light-grey watermark injected into the Allure report by the branding script. |
 
---
 
## `src/` — Test Infrastructure (Framework Code)
 
Reusable building blocks consumed by the tests. Nothing here is a test itself.
 
### `src/config/`
 
| File | High-level purpose |
|------|--------------------|
| `env.ts` | **Single source of truth** for all environment config. Loads `.env` via dotenv and exports a `config` object (web base URL, API base URL, API credentials, optional DemoBlaze credentials, proxy). Everything else imports from here instead of hard-coding values. |
 
### `src/pages/` — Page Object Model (UI Layer)
 
Each class encapsulates a page/component so tests read as business narratives, decoupled from locators.
 
| File | High-level purpose |
|------|--------------------|
| `base.page.ts` | Abstract base for all page objects. Provides `captureDialog()`, which registers a native-alert handler **before** the triggering action (avoids race conditions) and returns the dialog message. |
| `navbar.component.ts` | Top navigation bar present on every page. Methods: `openLogin()`, `openSignUp()`, `openCart()`, `logout()`, plus the "Welcome &lt;user&gt;" locator. |
| `auth.modal.ts` | Login and Sign-up Bootstrap modals. `signUp()` returns the alert text; `login()` returns `null` on success or the error text on failure. Waits for modal backdrops to clear to avoid stale state. |
| `home.page.ts` | Product catalogue / home page. Methods: `goto()`, `filterByCategory()` (waits for the category AJAX response), `productTitles()`, `openProduct()`, `hasNextPage()`. |
| `product.page.ts` | Single product detail page. Exposes name/price/description/add-to-cart, `addToCart()` (captures the "Product added" alert), and `priceValue()` (parses the numeric price). |
| `cart.page.ts` | Shopping cart and Place Order modal. Methods to read items/total, delete items, place orders, complete a purchase, and submit an incomplete order expecting validation. |
 
### `src/api/`
 
| File | High-level purpose |
|------|--------------------|
| `booker-client.ts` | **Typed wrapper** for the Restful-Booker API. Exports `Booking`-related types and methods: `healthCheck()`, `authenticate()`/`getToken()`, `createBooking()`, `getBooking()`, `listBookingIds()`, `updateBooking()` (PUT), `partiallyUpdateBooking()` (PATCH), `deleteBooking()`. Returns raw `APIResponse` so tests can assert on status and body. |
 
### `src/data/`
 
| File | High-level purpose |
|------|--------------------|
| `users.ts` | User-generation utilities. `generateUser()` creates unique throwaway accounts; `credentialsFromEnv()` pulls an optional reusable account from the central config. |
| `products.ts` | Product constants (`PRODUCTS`, `CATEGORIES`) and a sample `VALID_ORDER`. Prices are intentionally **not** hard-coded — tests read live prices and compute expected totals. |
| `bookings.ts` | API test data. `ADMIN_CREDENTIALS` from central config and a `buildBooking(overrides)` factory that produces valid booking payloads with sensible defaults. |
 
### `src/fixtures/`
 
Custom Playwright fixtures inject ready-to-use dependencies into tests (no boilerplate).
 
| File | High-level purpose |
|------|--------------------|
| `test-options.ts` | **UI test fixture.** Extends the base `test` and provides initialized page objects: `nav`, `auth`, `home`, `product`, `cart`. Re-exports `expect`. |
| `api-fixtures.ts` | **API test fixture.** Provides `api` (a configured `BookerClient`) and `apiToken` (a valid admin token provisioned once per test for write operations). Re-exports `expect`. |
 
---
 
## `tests/` — Test Specifications
 
### UI Tests (root level)
 
| File | High-level purpose |
|------|--------------------|
| [auth.spec.ts](../tests/auth.spec.ts) | Authentication tests (`@smoke`): successful sign-up/login plus rejection of wrong password, non-existent user, and duplicate username. |
| [product-browsing.spec.ts](../tests/product-browsing.spec.ts) | Catalogue tests: home page lists products, filtering by each category returns products, product detail page shows name/price/add-to-cart. |
| [cart.spec.ts](../tests/cart.spec.ts) | Cart tests (`@smoke`): add single/multiple products (total = sum of live prices), delete item and verify removal. Uses `expect.poll` for async updates. |
| [checkout.spec.ts](../tests/checkout.spec.ts) | Checkout tests (`@smoke`): full purchase with valid details (confirmation + amount match) and purchase blocked when required fields are empty. |
 
### `tests/api/` — API Tests
 
| File | High-level purpose |
|------|--------------------|
| [api/auth.spec.ts](../tests/api/auth.spec.ts) | API auth tests: health check (`/ping`), token issued for valid credentials, and rejection of invalid credentials. |
| [api/booking-crud.spec.ts](../tests/api/booking-crud.spec.ts) | API positive CRUD tests: create echoes payload, list returns ids, PATCH updates only provided fields, and a full lifecycle chain (auth → create → retrieve → update → delete → verify 404). |
| [api/booking-negative.spec.ts](../tests/api/booking-negative.spec.ts) | API negative tests: retrieve missing booking (404), update/delete without token (403), and create with invalid payload (4xx). |
 
---
 
## `scripts/` — Build & Automation
 
| File | High-level purpose |
|------|--------------------|
| `brand-allure.mjs` | Post-generate script that injects the corporate watermark into `allure-report/index.html`. Idempotent — skips if branding is already applied. Used by `npm run allure:generate`. |
 
---
 
## `docs/` — Documentation
 
| File | High-level purpose |
|------|--------------------|
| [TEST-PLAN.md](TEST-PLAN.md) | Requirement analysis & test design: capabilities, scenario catalogue with coverage matrix, automation strategy, assumptions, and limitations. |
| [COMPLETE-BUILD-GUIDE.md](COMPLETE-BUILD-GUIDE.md) | Step-by-step build guide showing every file with complete code and reasoning — recreate the framework from scratch. |
| [LINE-BY-LINE-GUIDE.md](LINE-BY-LINE-GUIDE.md) | Beginner-friendly deep dive explaining *why* each line does what it does (companion to the build guide). |
| [SETUP-FROM-SCRATCH.md](SETUP-FROM-SCRATCH.md) | Quick setup checklist for recreating the framework on a fresh machine. |
| [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) | **This document** — high-level map of every folder and file. |
 
---
 
## Generated Output Directories (git-ignored)
 
| Directory | High-level purpose |
|-----------|--------------------|
| `playwright-report/` | Playwright's default HTML report (view with `npm run report`). |
| `allure-results/` | Raw Allure result JSON produced during the test run. |
| `allure-report/` | Rendered Allure HTML report (generated via `npm run allure:generate`). |
| `test-results/` | Playwright's internal artifacts: traces, videos, screenshots. |
 
---
 
## Key Design Patterns (why the structure looks this way)
 
1. **Page Object Model** — UI interactions live in `src/pages/`; specs stay readable and locator changes are isolated.
2. **Centralized configuration** — `src/config/env.ts` is the only place URLs/credentials/proxy are defined.
3. **Independent tests** — each test provisions its own data and runs in isolation, safe for parallel execution.
4. **Native dialog handling** — `BasePage.captureDialog()` registers handlers before the triggering action.
5. **Robust assertions** — no arbitrary waits; web-first assertions and `expect.poll`; cart totals validated against live prices.
6. **Typed API client** — `BookerClient` gives tests strongly-typed `Booking` objects.
7. **Fixture injection** — custom `test` exports provide ready-to-use page objects and API clients with zero boilerplate.
 
STORE
 