# Complete Build Guide — DemoBlaze + Restful-Booker Automation Framework
 
A full, step-by-step guide for a **new QA engineer on a fresh laptop** to build this
Playwright + TypeScript framework from scratch. Every file is shown with its **complete code**
and a short note on **why it exists**. Follow the steps in order — each step keeps the project runnable.
 
> There is no video; this document is the single source. Copy each file exactly as shown.
 
---
 
## Table of contents
1. Prerequisites
2. Initialize the project & install dependencies
3. Folder structure
4. Configuration files
5. Central environment config
6. UI layer — Page Object Model
7. UI fixtures
8. UI test data
9. UI tests
10. API client
11. API fixtures & data
12. API tests
13. Running the tests
14. Reporting (Playwright HTML + Allure with branding)
15. CI pipeline
16. Git — small logical commits
17. Running in another environment
18. Troubleshooting
 
---
 
## 1. Prerequisites
 
Install on the laptop:
- **Node.js 18+** — https://nodejs.org (check `node -v`)
- **Git** — https://git-scm.com (check `git --version`)
- **Java 8+** — only needed to view the Allure report (`java -version`)
- **VS Code** (recommended)
 
---
 
## 2. Initialize the project & install dependencies
 
```powershell
mkdir demoblaze-qa-assessment
cd demoblaze-qa-assessment
npm init -y
npm install -D @playwright/test @types/node typescript dotenv
npm install -D allure-playwright@2 allure-commandline
npx playwright install            # downloads Chromium, Firefox, WebKit
```
 
**Why:** `@playwright/test` is the runner; `typescript`/`@types/node` for TS; `dotenv` for env files;
`allure-playwright` + `allure-commandline` for the Allure report (v2 line, matched versions).
 
---
 
## 3. Folder structure
 
```powershell
mkdir src\pages, src\api, src\data, src\fixtures, src\config, tests\api, docs, assets, scripts, .github\workflows
```
 
```
demoblaze-qa-assessment/
├─ package.json
├─ tsconfig.json
├─ playwright.config.ts
├─ .gitignore
├─ .env.example
├─ assets/            # watermark/logo for the Allure report
├─ scripts/           # Allure branding script
├─ docs/              # this guide + test plan
├─ src/
│  ├─ config/env.ts          # single source of configuration
│  ├─ pages/                 # UI Page Objects
│  ├─ api/booker-client.ts   # typed API client
│  ├─ data/                  # test-data factories
│  └─ fixtures/              # custom fixtures (UI + API)
└─ tests/
   ├─ *.spec.ts              # UI tests
   └─ api/*.spec.ts          # API tests
```
 
---
 
## 4. Configuration files
 
### `package.json`
**Why:** scripts + dependencies so another engineer runs everything with named commands.
```json
{
  "name": "demoblaze-qa-assessment",
  "version": "1.0.0",
  "description": "Playwright + TypeScript E2E automation for the DemoBlaze product store (QA technical assessment).",
  "license": "MIT",
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:ui": "playwright test --ui",
    "test:chromium": "playwright test --project=chromium",
    "test:api": "playwright test --project=api",
    "test:smoke": "playwright test --grep @smoke",
    "report": "playwright show-report",
    "allure:generate": "allure generate allure-results --clean -o allure-report && node scripts/brand-allure.mjs",
    "allure:open": "allure open allure-report",
    "report:allure": "npm run allure:generate && npm run allure:open",
    "codegen": "playwright codegen https://www.demoblaze.com/"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@types/node": "^20.14.0",
    "allure-commandline": "^2.46.1",
    "allure-playwright": "^2.15.1",
    "dotenv": "^16.4.5",
    "typescript": "^5.6.0"
  }
}
```
 
### `tsconfig.json`
**Why:** strict TypeScript + DOM lib (page objects reference DOM types).
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": ["node"]
  },
  "include": ["src", "tests", "playwright.config.ts"]
}
```
 
### `playwright.config.ts`
**Why:** the runner config — **`retries: 3`**, three reporters (list + Playwright HTML + Allure),
full capture (trace/video/screenshot), and a browser-less `api` project separated from the UI projects.
```ts
import { defineConfig, devices } from '@playwright/test';
import { config } from './src/config/env';
 
export default defineConfig({
  testDir: './tests',
  // Each test is independent, so they can run in parallel safely.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retry failed tests up to 3 times before reporting failure (absorbs the shared
  // demo backend's transient flakiness).
  retries: 3,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright', {
      resultsDir: 'allure-results',
      environmentInfo: {
        Framework: 'Playwright',
        Language: 'TypeScript',
        OS: process.platform,
        Node: process.version,
      },
    }],
  ],
  use: {
    baseURL: config.webBaseURL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    // Capture a trace (per-step screenshots/snapshots), a video, and a screenshot
    // for every test so the HTML report shows full step-by-step evidence.
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },
  projects: [
    // API tests run once, without a browser.
    { name: 'api', testMatch: /tests[\/]api[\/].*\.spec\.ts$/ },
    // UI projects exclude the API tests so they are not run per browser.
    {
      name: 'chromium',
      testIgnore: /tests[\/]api[\/]/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: /tests[\/]api[\/]/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testIgnore: /tests[\/]api[\/]/,
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```
 
### `.gitignore`
**Why:** never commit dependencies, outputs, or secrets.
```
# Dependencies
node_modules/
 
# Playwright outputs
test-results/
playwright-report/
blob-report/
playwright/.cache/
 
# Allure outputs
allure-results/
allure-report/
 
# Secrets & local env (never commit these)
.env
.env.local
*.local
 
# OS / editor
.DS_Store
Thumbs.db
.idea/
*.log
```
 
### `.env.example`
**Why:** documents every variable; copy to `.env` (git-ignored) locally.
```
# Copy this file to ".env" and adjust as needed. The ".env" file is git-ignored.
# Do NOT commit real credentials, tokens, or secrets.
 
# Base URL under test (defaults to the public DemoBlaze site when unset).
BASE_URL=https://www.demoblaze.com
 
# Optional: reuse a pre-existing DemoBlaze account instead of registering a fresh
# user at runtime. Leave blank to let the auth tests create their own throwaway user.
DEMOBLAZE_USERNAME=
DEMOBLAZE_PASSWORD=
 
# Restful-Booker API (Part 3). Credentials below are the public demo values and
# are not secrets; override if you point at a different instance.
API_BASE_URL=https://restful-booker.herokuapp.com
API_USERNAME=admin
API_PASSWORD=password123
```
 
---
 
## 5. Central environment config
 
### `src/config/env.ts`
**Why:** one place resolves all URLs/credentials/proxy from env with safe defaults; tests never read `process.env` directly.
```ts
import * as dotenv from 'dotenv';
 
// Load variables from a local .env file (git-ignored). A real .env is never committed.
dotenv.config();
 
interface Credentials {
  username: string;
  password: string;
}
 
/**
 * Single source of truth for environment configuration. Every URL, credential,
 * and proxy setting is resolved here from environment variables with safe public
 * defaults, so the suite runs out of the box and can be pointed at any
 * environment without code changes.
 */
export const config = {
  /** DemoBlaze web app under test. */
  webBaseURL: process.env.BASE_URL ?? 'https://www.demoblaze.com',
 
  /** Restful-Booker API under test. */
  apiBaseURL: process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com',
 
  /** Admin credentials for API write operations (public demo values by default). */
  apiCredentials: {
    username: process.env.API_USERNAME ?? 'admin',
    password: process.env.API_PASSWORD ?? 'password123',
  } as Credentials,
 
  /** Optional reusable DemoBlaze account; when absent, UI auth tests self-register. */
  demoblazeCredentials:
    process.env.DEMOBLAZE_USERNAME && process.env.DEMOBLAZE_PASSWORD
      ? ({
          username: process.env.DEMOBLAZE_USERNAME,
          password: process.env.DEMOBLAZE_PASSWORD,
        } as Credentials)
      : null,
 
  /** Corporate proxy, honoured by the API request context when set. */
  proxy: process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY,
};
```
 
---
 
## 6. UI layer — Page Object Model
 
### `src/pages/base.page.ts`
**Why:** shared base; `captureDialog()` centralizes handling of DemoBlaze's native `alert()` dialogs. **Register it before the triggering click.**
```ts
import { Page } from '@playwright/test';
 
/**
 * Shared behaviour for all page objects.
 */
export abstract class BasePage {
  protected readonly page: Page;
 
  constructor(page: Page) {
    this.page = page;
  }
 
  /**
   * DemoBlaze uses native browser dialogs (alert) for several flows
   * (add-to-cart, sign-up result, login errors, order validation).
   * Register this BEFORE the action that triggers the dialog, then await the
   * returned promise to read the message. The dialog is always accepted.
   */
  protected captureDialog(): Promise<string> {
    return new Promise<string>((resolve) => {
      this.page.once('dialog', async (dialog) => {
        const message = dialog.message();
        await dialog.accept();
        resolve(message);
      });
    });
  }
}
```
 
### `src/pages/navbar.component.ts`
**Why:** the shared top navigation — a reusable component, not a full page.
```ts
import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
 
/**
 * The top navigation bar, present on every page.
 */
export class NavBar extends BasePage {
  readonly cartLink: Locator;
  readonly loginLink: Locator;
  readonly signUpLink: Locator;
  readonly logoutLink: Locator;
  readonly loggedInUser: Locator;
 
  constructor(page: Page) {
    super(page);
    this.cartLink = page.locator('#cartur');
    this.loginLink = page.locator('#login2');
    this.signUpLink = page.locator('#signin2');
    this.logoutLink = page.locator('#logout2');
    this.loggedInUser = page.locator('#nameofuser');
  }
 
  async openLogin(): Promise<void> {
    await this.loginLink.click();
  }
 
  async openSignUp(): Promise<void> {
    await this.signUpLink.click();
  }
 
  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
 
  async logout(): Promise<void> {
    await this.logoutLink.click();
  }
}
```
 
### `src/pages/auth.modal.ts`
**Why:** login/sign-up Bootstrap modals. `login()` uses `Promise.race` to detect success (nav user appears) vs failure (native alert). `waitForModalsClosed()` prevents the backdrop-overlap flake.
```ts
import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { NavBar } from './navbar.component';
 
/**
 * Login and Sign-up are Bootstrap modals triggered from the nav bar.
 * Success closes the modal; failure raises a native alert.
 */
export class AuthModal extends BasePage {
  private readonly nav: NavBar;
 
  private readonly signupModal: Locator;
  private readonly signupUsername: Locator;
  private readonly signupPassword: Locator;
  private readonly signupSubmit: Locator;
 
  private readonly loginModal: Locator;
  private readonly loginUsername: Locator;
  private readonly loginPassword: Locator;
  private readonly loginSubmit: Locator;
 
  constructor(page: Page) {
    super(page);
    this.nav = new NavBar(page);
 
    this.signupModal = page.locator('#signInModal');
    this.signupUsername = this.signupModal.locator('#sign-username');
    this.signupPassword = this.signupModal.locator('#sign-password');
    this.signupSubmit = this.signupModal.getByRole('button', { name: 'Sign up' });
 
    this.loginModal = page.locator('#logInModal');
    this.loginUsername = this.loginModal.locator('#loginusername');
    this.loginPassword = this.loginModal.locator('#loginpassword');
    this.loginSubmit = this.loginModal.getByRole('button', { name: 'Log in' });
  }
 
  /** Registers a user. Returns the alert text (e.g. "Sign up successful."). */
  async signUp(username: string, password: string): Promise<string> {
    await this.waitForModalsClosed();
    await this.nav.openSignUp();
    await expect(this.signupModal).toBeVisible();
    await this.signupUsername.fill(username);
    await this.signupPassword.fill(password);
 
    const dialogMessage = this.captureDialog();
    await this.signupSubmit.click();
    const message = await dialogMessage;
 
    await this.signupModal.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => undefined);
    await this.waitForModalsClosed();
    return message;
  }
 
  /**
   * Attempts a login. Resolves to `null` on success (nav shows the user),
   * or the alert text on failure (e.g. "Wrong password.").
   */
  async login(username: string, password: string): Promise<string | null> {
    await this.waitForModalsClosed();
    await this.nav.openLogin();
    await expect(this.loginModal).toBeVisible();
    await this.loginUsername.fill(username);
    await this.loginPassword.fill(password);
 
    const dialogMessage = this.captureDialog();
    await this.loginSubmit.click();
 
    return Promise.race<string | null>([
      this.nav.loggedInUser
        .waitFor({ state: 'visible', timeout: 10_000 })
        .then(() => null)
        .catch(() => null),
      dialogMessage,
    ]);
  }
 
  /** Bootstrap leaves a backdrop element after closing; wait for it to detach before re-opening a modal. */
  private async waitForModalsClosed(): Promise<void> {
    await this.page
      .locator('.modal-backdrop')
      .waitFor({ state: 'detached', timeout: 5_000 })
      .catch(() => undefined);
  }
}
```
 
### `src/pages/home.page.ts`
**Why:** catalogue; `filterByCategory` uses `expect.poll` (no fixed waits) for the async reload.
```ts
import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
 
export type Category = 'Phones' | 'Laptops' | 'Monitors';
 
/**
 * The product catalogue (home page).
 */
export class HomePage extends BasePage {
  private readonly productLinks: Locator;
  private readonly nextButton: Locator;
 
  constructor(page: Page) {
    super(page);
    // Product titles are anchors with the `hrefch` class inside each card.
    this.productLinks = page.locator('a.hrefch');
    this.nextButton = page.getByRole('link', { name: 'Next' });
  }
 
  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.productLinks.first()).toBeVisible();
  }
 
  async filterByCategory(category: Category): Promise<void> {
    await this.page.getByRole('link', { name: category, exact: true }).click();
    await expect
      .poll(async () => this.productLinks.count(), { timeout: 15_000 })
      .toBeGreaterThan(0);
  }
 
  async productTitles(): Promise<string[]> {
    return (await this.productLinks.allTextContents()).map((t) => t.trim());
  }
 
  async openProduct(name: string): Promise<void> {
    await this.productLinks.filter({ hasText: name }).first().click();
  }
 
  async hasNextPage(): Promise<boolean> {
    return this.nextButton.isVisible();
  }
}
```
 
### `src/pages/product.page.ts`
**Why:** product detail; `priceValue()` reads the live price so totals aren't hard-coded.
```ts
import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
 
/**
 * A single product detail page (prod.html?idp_=...).
 */
export class ProductPage extends BasePage {
  readonly name: Locator;
  readonly price: Locator;
  readonly description: Locator;
  readonly addToCartButton: Locator;
 
  constructor(page: Page) {
    super(page);
    this.name = page.locator('.name');
    this.price = page.locator('.price-container');
    this.description = page.locator('#more-information');
    this.addToCartButton = page.getByRole('link', { name: 'Add to cart' });
  }
 
  /** Clicks "Add to cart" and returns the native alert text ("Product added."). */
  async addToCart(): Promise<string> {
    const dialogMessage = this.captureDialog();
    await this.addToCartButton.click();
    return dialogMessage;
  }
 
  /** Numeric price parsed from the "$360 *includes tax" label. */
  async priceValue(): Promise<number> {
    const raw = (await this.price.textContent()) ?? '';
    const digits = raw.replace(/[^0-9.]/g, '');
    return Number(digits);
  }
}
```
 
### `src/pages/cart.page.ts`
**Why:** cart + order modal. Note the two confirmation paths: success is a SweetAlert element; validation failure is a native alert.
```ts
import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
 
export interface OrderDetails {
  name?: string;
  country?: string;
  city?: string;
  card?: string;
  month?: string;
  year?: string;
}
 
/**
 * The shopping cart page (cart.html) and the "Place Order" modal.
 */
export class CartPage extends BasePage {
  private readonly rows: Locator;
  private readonly totalPrice: Locator;
  private readonly placeOrderButton: Locator;
 
  private readonly orderModal: Locator;
  private readonly nameInput: Locator;
  private readonly countryInput: Locator;
  private readonly cityInput: Locator;
  private readonly cardInput: Locator;
  private readonly monthInput: Locator;
  private readonly yearInput: Locator;
  private readonly purchaseButton: Locator;
  private readonly confirmation: Locator;
 
  constructor(page: Page) {
    super(page);
    this.rows = page.locator('#tbodyid tr');
    this.totalPrice = page.locator('#totalp');
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
 
    this.orderModal = page.locator('#orderModal');
    this.nameInput = this.orderModal.locator('#name');
    this.countryInput = this.orderModal.locator('#country');
    this.cityInput = this.orderModal.locator('#city');
    this.cardInput = this.orderModal.locator('#card');
    this.monthInput = this.orderModal.locator('#month');
    this.yearInput = this.orderModal.locator('#year');
    this.purchaseButton = this.orderModal.getByRole('button', { name: 'Purchase' });
    this.confirmation = page.locator('.sweet-alert');
  }
 
  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
  }
 
  async itemTitles(): Promise<string[]> {
    return (await this.rows.locator('td:nth-child(2)').allTextContents()).map((t) => t.trim());
  }
 
  async itemCount(): Promise<number> {
    return this.rows.count();
  }
 
  async total(): Promise<number> {
    await expect(this.totalPrice).not.toBeEmpty();
    return Number((await this.totalPrice.textContent())?.trim());
  }
 
  async deleteItem(title: string): Promise<void> {
    const row = this.rows.filter({ hasText: title }).first();
    await row.getByRole('link', { name: 'Delete' }).click();
    await expect(row).toBeHidden();
  }
 
  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
    await expect(this.orderModal).toBeVisible();
  }
 
  private async fillOrder(details: OrderDetails): Promise<void> {
    if (details.name !== undefined) await this.nameInput.fill(details.name);
    if (details.country !== undefined) await this.countryInput.fill(details.country);
    if (details.city !== undefined) await this.cityInput.fill(details.city);
    if (details.card !== undefined) await this.cardInput.fill(details.card);
    if (details.month !== undefined) await this.monthInput.fill(details.month);
    if (details.year !== undefined) await this.yearInput.fill(details.year);
  }
 
  /** Completes a valid purchase and returns the confirmation text. */
  async completePurchase(details: OrderDetails): Promise<string> {
    await this.fillOrder(details);
    await this.purchaseButton.click();
    await expect(this.confirmation).toBeVisible();
    return (await this.confirmation.textContent())?.trim() ?? '';
  }
 
  /** Submits an incomplete order and returns the validation alert text. */
  async submitOrderExpectingValidation(details: OrderDetails): Promise<string> {
    await this.fillOrder(details);
    const dialogMessage = this.captureDialog();
    await this.purchaseButton.click();
    return dialogMessage;
  }
}
```
 
---
 
## 7. UI fixtures
 
### `src/fixtures/test-options.ts`
**Why:** injects page objects into every test so specs stay declarative.
```ts
import { test as base } from '@playwright/test';
import { NavBar } from '../pages/navbar.component';
import { AuthModal } from '../pages/auth.modal';
import { HomePage } from '../pages/home.page';
import { ProductPage } from '../pages/product.page';
import { CartPage } from '../pages/cart.page';
 
interface Fixtures {
  nav: NavBar;
  auth: AuthModal;
  home: HomePage;
  product: ProductPage;
  cart: CartPage;
}
 
/**
 * Provides ready-to-use page objects to every test, keeping specs declarative
 * and free of boilerplate construction.
 */
export const test = base.extend<Fixtures>({
  nav: async ({ page }, use) => use(new NavBar(page)),
  auth: async ({ page }, use) => use(new AuthModal(page)),
  home: async ({ page }, use) => use(new HomePage(page)),
  product: async ({ page }, use) => use(new ProductPage(page)),
  cart: async ({ page }, use) => use(new CartPage(page)),
});
 
export { expect } from '@playwright/test';
```
 
---
 
## 8. UI test data
 
### `src/data/users.ts`
**Why:** generates unique throwaway accounts → tests stay independent, no secrets.
```ts
import { config } from '../config/env';
 
export interface Credentials {
  username: string;
  password: string;
}
 
/**
 * Generates a unique throwaway account so that auth tests stay independent and
 * repeatable without committing any real credentials.
 */
export function generateUser(prefix = 'qa'): Credentials {
  const unique = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10_000)}`;
  const password = `Pw!${Math.random().toString(36).slice(2, 10)}`;
  return { username: unique, password };
}
 
/** Optional reusable account sourced from central config (never hard-coded). */
export function credentialsFromEnv(): Credentials | null {
  return config.demoblazeCredentials;
}
```
 
### `src/data/products.ts`
**Why:** product names/categories for navigation; prices read live, not asserted as constants.
```ts
import type { Category } from '../pages/home.page';
 
export interface ProductRef {
  name: string;
  category: Category;
}
 
/**
 * Well-known catalogue items used for navigation. Prices are intentionally NOT
 * hard-coded in assertions: tests read the live price from the product page and
 * compute expected totals dynamically, so the suite stays robust if the store
 * adjusts pricing.
 */
export const PRODUCTS = {
  phone: { name: 'Samsung galaxy s6', category: 'Phones' },
  laptop: { name: 'Sony vaio i5', category: 'Laptops' },
  monitor: { name: 'Apple monitor 24', category: 'Monitors' },
} satisfies Record<string, ProductRef>;
 
export const CATEGORIES: Category[] = ['Phones', 'Laptops', 'Monitors'];
 
export const VALID_ORDER = {
  name: 'Jane Doe',
  country: 'United Kingdom',
  city: 'London',
  card: '4111111111111111',
  month: '12',
  year: '2027',
};
```
 
---
 
## 9. UI tests
 
### `tests/auth.spec.ts`
```ts
import { test, expect } from '../src/fixtures/test-options';
import { generateUser } from '../src/data/users';
 
test.describe('Authentication', () => {
  test('a new user can sign up successfully @smoke', async ({ home, auth }) => {
    await home.goto();
    const user = generateUser();
 
    const message = await auth.signUp(user.username, user.password);
 
    expect(message).toContain('Sign up successful');
  });
 
  test('a registered user can log in @smoke', async ({ home, auth, nav }) => {
    await home.goto();
    const user = generateUser();
    await auth.signUp(user.username, user.password);
 
    const error = await auth.login(user.username, user.password);
 
    expect(error).toBeNull();
    await expect(nav.loggedInUser).toHaveText(`Welcome ${user.username}`);
    await expect(nav.logoutLink).toBeVisible();
  });
 
  test('login is rejected with a wrong password', async ({ home, auth }) => {
    await home.goto();
    const user = generateUser();
    await auth.signUp(user.username, user.password);
 
    const error = await auth.login(user.username, 'definitely-wrong-password');
 
    expect(error).toBe('Wrong password.');
  });
 
  test('login is rejected for a non-existent user', async ({ home, auth }) => {
    await home.goto();
 
    const error = await auth.login(`ghost_${Date.now()}`, 'irrelevant');
 
    expect(error).toContain('User does not exist');
  });
 
  test('signing up with an existing username is rejected', async ({ home, auth }) => {
    await home.goto();
    const user = generateUser();
    await auth.signUp(user.username, user.password);
 
    const second = await auth.signUp(user.username, user.password);
 
    expect(second).toContain('already exist');
  });
});
```
 
### `tests/product-browsing.spec.ts`
```ts
import { test, expect } from '../src/fixtures/test-options';
import { CATEGORIES, PRODUCTS } from '../src/data/products';
 
test.describe('Product browsing', () => {
  test('the home page lists products @smoke', async ({ home }) => {
    await home.goto();
 
    const titles = await home.productTitles();
 
    expect(titles.length).toBeGreaterThan(0);
  });
 
  for (const category of CATEGORIES) {
    test(`filtering by ${category} shows at least one product`, async ({ home }) => {
      await home.goto();
 
      await home.filterByCategory(category);
 
      const titles = await home.productTitles();
      expect(titles.length).toBeGreaterThan(0);
    });
  }
 
  test('a product detail page shows name, price and add-to-cart', async ({ home, product }) => {
    await home.goto();
 
    await home.openProduct(PRODUCTS.phone.name);
 
    await expect(product.name).toHaveText(PRODUCTS.phone.name);
    await expect(product.price).toContainText('$');
    await expect(product.addToCartButton).toBeVisible();
    expect(await product.priceValue()).toBeGreaterThan(0);
  });
});
```
 
### `tests/cart.spec.ts`
```ts
import { test, expect } from '../src/fixtures/test-options';
import { PRODUCTS } from '../src/data/products';
 
test.describe('Shopping cart', () => {
  test('a product can be added to the cart @smoke', async ({ home, product, cart, nav }) => {
    await home.goto();
    await home.openProduct(PRODUCTS.phone.name);
 
    const message = await product.addToCart();
    expect(message).toContain('Product added');
 
    await nav.openCart();
    await expect.poll(async () => cart.itemTitles()).toContain(PRODUCTS.phone.name);
  });
 
  test('the cart total equals the sum of item prices', async ({ home, product, cart, nav }) => {
    await home.goto();
    await home.openProduct(PRODUCTS.phone.name);
    await product.addToCart();
    const phonePrice = await product.priceValue();
 
    await home.goto();
    await home.openProduct(PRODUCTS.laptop.name);
    await product.addToCart();
    const laptopPrice = await product.priceValue();
 
    await nav.openCart();
    await expect.poll(async () => cart.itemCount()).toBe(2);
    expect(await cart.total()).toBe(phonePrice + laptopPrice);
  });
 
  test('a product can be removed from the cart', async ({ home, product, cart, nav }) => {
    await home.goto();
    await home.openProduct(PRODUCTS.phone.name);
    await product.addToCart();
    await home.goto();
    await home.openProduct(PRODUCTS.laptop.name);
    await product.addToCart();
 
    await nav.openCart();
    await expect.poll(async () => cart.itemCount()).toBe(2);
 
    await cart.deleteItem(PRODUCTS.phone.name);
 
    await expect.poll(async () => cart.itemTitles()).toEqual([PRODUCTS.laptop.name]);
  });
});
```
 
### `tests/checkout.spec.ts`
Note: filter to the category first because the monitor isn't on the first catalogue page; and we assert **Amount == cart total**.
```ts
import { test, expect } from '../src/fixtures/test-options';
import { PRODUCTS, VALID_ORDER } from '../src/data/products';
 
test.describe('Checkout', () => {
  test('a shopper can complete an end-to-end purchase @smoke', async ({
    home,
    product,
    cart,
    nav,
  }) => {
    await home.goto();
    await home.filterByCategory(PRODUCTS.monitor.category);
    await home.openProduct(PRODUCTS.monitor.name);
    await product.addToCart();
 
    await nav.openCart();
    await expect.poll(async () => cart.itemCount()).toBe(1);
    const cartTotal = await cart.total();
    await cart.placeOrder();
 
    const confirmation = await cart.completePurchase(VALID_ORDER);
 
    expect(confirmation).toContain('Thank you for your purchase');
    expect(confirmation).toMatch(/Amount:\s*\d+/);
    // The amount charged must match the cart total.
    const chargedAmount = Number(confirmation.match(/Amount:\s*(\d+)/)?.[1]);
    expect(chargedAmount).toBe(cartTotal);
  });
 
  test('purchase is blocked when name and card are empty', async ({ home, product, cart, nav }) => {
    await home.goto();
    await home.filterByCategory(PRODUCTS.monitor.category);
    await home.openProduct(PRODUCTS.monitor.name);
    await product.addToCart();
 
    await nav.openCart();
    await cart.placeOrder();
 
    const alert = await cart.submitOrderExpectingValidation({ country: 'UK', city: 'London' });
 
    expect(alert).toContain('Please fill out Name and Creditcard');
  });
});
```
 
---
 
## 10. API client
 
### `src/api/booker-client.ts`
**Why:** typed wrapper returning raw `APIResponse`. Write ops send the token as a `Cookie`.
```ts
import { APIRequestContext, APIResponse } from '@playwright/test';
 
export interface BookingDates {
  checkin: string;
  checkout: string;
}
 
export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}
 
export interface CreateBookingResponse {
  bookingid: number;
  booking: Booking;
}
 
/**
 * Thin, typed wrapper around the Restful-Booker API. Returns raw APIResponse so
 * tests can assert on status codes as well as bodies.
 *
 * Auth model: write operations (PUT/PATCH/DELETE) require the token as a cookie.
 */
export class BookerClient {
  constructor(private readonly request: APIRequestContext) {}
 
  /** Health endpoint — returns HTTP 201 when the service is up. */
  async healthCheck(): Promise<number> {
    const response = await this.request.get('/ping');
    return response.status();
  }
 
  async authenticate(username: string, password: string): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }
 
  /** Convenience helper that returns just the token string. */
  async getToken(username: string, password: string): Promise<string> {
    const response = await this.authenticate(username, password);
    const body = await response.json();
    return body.token;
  }
 
  async createBooking(booking: Booking): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }
 
  async getBooking(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }
 
  async listBookingIds(): Promise<APIResponse> {
    return this.request.get('/booking');
  }
 
  async updateBooking(id: number, booking: Booking, token: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: { Cookie: `token=${token}` },
    });
  }
 
  async partiallyUpdateBooking(
    id: number,
    partial: Partial<Booking>,
    token: string,
  ): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, {
      data: partial,
      headers: { Cookie: `token=${token}` },
    });
  }
 
  async deleteBooking(id: number, token: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, {
      headers: { Cookie: `token=${token}` },
    });
  }
}
```
 
---
 
## 11. API fixtures & data
 
### `src/fixtures/api-fixtures.ts`
**Why:** builds the API request context (with proxy support) and provides `api` + `apiToken`.
```ts
import { test as base, request as playwrightRequest } from '@playwright/test';
import { BookerClient } from '../api/booker-client';
import { config } from '../config/env';
 
interface ApiFixtures {
  api: BookerClient;
  /** A valid admin token, provisioned once per test that needs write access. */
  apiToken: string;
}
 
export const test = base.extend<ApiFixtures>({
  api: async ({}, use) => {
    const context = await playwrightRequest.newContext({
      baseURL: config.apiBaseURL,
      // Honour a corporate proxy when present; a no-op on networks with direct access.
      ...(config.proxy ? { proxy: { server: config.proxy } } : {}),
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    await use(new BookerClient(context));
    await context.dispose();
  },
 
  apiToken: async ({ api }, use) => {
    const token = await api.getToken(config.apiCredentials.username, config.apiCredentials.password);
    await use(token);
  },
});
 
export { expect } from '@playwright/test';
```
 
### `src/data/bookings.ts`
**Why:** booking factory + admin credentials from config.
```ts
import type { Booking } from '../api/booker-client';
import { config } from '../config/env';
 
/** Public demo credentials for Restful-Booker (resolved from central config; not secrets). */
export const ADMIN_CREDENTIALS = config.apiCredentials;
 
/** Builds a valid booking payload; override any field for targeted scenarios. */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: 'John',
    lastname: 'Doe',
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2025-01-01', checkout: '2025-01-10' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
```
 
---
 
## 12. API tests
 
### `tests/api/auth.spec.ts`
```ts
import { test, expect } from '../../src/fixtures/api-fixtures';
import { ADMIN_CREDENTIALS } from '../../src/data/bookings';
 
test.describe('API · Authentication', () => {
  test('the service health endpoint is up', async ({ api }) => {
    expect(await api.healthCheck()).toBe(201);
  });
 
  test('valid credentials return a token', async ({ api }) => {
    const response = await api.authenticate(
      ADMIN_CREDENTIALS.username,
      ADMIN_CREDENTIALS.password,
    );
 
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(0);
  });
 
  test('invalid credentials are rejected with no token', async ({ api }) => {
    const response = await api.authenticate('admin', 'wrong-password');
 
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.reason).toBe('Bad credentials');
    expect(body.token).toBeUndefined();
  });
});
```
 
### `tests/api/booking-crud.spec.ts` (includes the request-chaining test)
```ts
import { test, expect } from '../../src/fixtures/api-fixtures';
import { buildBooking } from '../../src/data/bookings';
import type { CreateBookingResponse } from '../../src/api/booker-client';
 
test.describe('API · Booking CRUD', () => {
  test('a booking can be created and echoed back', async ({ api }) => {
    const payload = buildBooking();
 
    const response = await api.createBooking(payload);
 
    expect(response.status()).toBe(200);
    const body = (await response.json()) as CreateBookingResponse;
    expect(body.bookingid).toBeGreaterThan(0);
    expect(body.booking).toMatchObject(payload);
  });
 
  test('the booking list returns an array of ids', async ({ api }) => {
    const response = await api.listBookingIds();
 
    expect(response.status()).toBe(200);
    const ids = await response.json();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids[0]).toHaveProperty('bookingid');
  });
 
  test('a partial update changes only the provided fields', async ({ api, apiToken }) => {
    const created = await api.createBooking(buildBooking());
    const { bookingid } = (await created.json()) as CreateBookingResponse;
 
    const response = await api.partiallyUpdateBooking(bookingid, { firstname: 'Patched' }, apiToken);
 
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstname).toBe('Patched');
    expect(body.lastname).toBe('Doe');
 
    await api.deleteBooking(bookingid, apiToken);
  });
 
  test('full lifecycle: authenticate → create → retrieve → validate → update → validate → delete → verify', async ({
    api,
    apiToken,
  }) => {
    // Create
    const payload = buildBooking();
    const createResponse = await api.createBooking(payload);
    expect(createResponse.status()).toBe(200);
    const { bookingid } = (await createResponse.json()) as CreateBookingResponse;
    expect(bookingid).toBeGreaterThan(0);
 
    // Retrieve + validate it matches what we created
    const getResponse = await api.getBooking(bookingid);
    expect(getResponse.status()).toBe(200);
    expect(await getResponse.json()).toMatchObject(payload);
 
    // Update (full replace, requires auth)
    const updatedPayload = buildBooking({ firstname: 'Jane', lastname: 'Smith', totalprice: 999 });
    const updateResponse = await api.updateBooking(bookingid, updatedPayload, apiToken);
    expect(updateResponse.status()).toBe(200);
    expect(await updateResponse.json()).toMatchObject(updatedPayload);
 
    // Validate the update persisted
    const afterUpdate = await api.getBooking(bookingid);
    expect(await afterUpdate.json()).toMatchObject({
      firstname: 'Jane',
      lastname: 'Smith',
      totalprice: 999,
    });
 
    // Delete (returns 201 Created on success)
    const deleteResponse = await api.deleteBooking(bookingid, apiToken);
    expect(deleteResponse.status()).toBe(201);
 
    // Verify it is gone
    const afterDelete = await api.getBooking(bookingid);
    expect(afterDelete.status()).toBe(404);
  });
});
```
 
### `tests/api/booking-negative.spec.ts`
```ts
import { test, expect } from '../../src/fixtures/api-fixtures';
import { buildBooking } from '../../src/data/bookings';
import type { Booking, CreateBookingResponse } from '../../src/api/booker-client';
 
test.describe('API · Booking negative scenarios', () => {
  test('retrieving a non-existent booking returns 404', async ({ api }) => {
    const response = await api.getBooking(99_999_999);
 
    expect(response.status()).toBe(404);
  });
 
  test('updating without a token is forbidden', async ({ api }) => {
    const created = await api.createBooking(buildBooking());
    const { bookingid } = (await created.json()) as CreateBookingResponse;
 
    const response = await api.updateBooking(bookingid, buildBooking({ firstname: 'NoAuth' }), '');
 
    expect(response.status()).toBe(403);
  });
 
  test('deleting without a token is forbidden', async ({ api }) => {
    const created = await api.createBooking(buildBooking());
    const { bookingid } = (await created.json()) as CreateBookingResponse;
 
    const response = await api.deleteBooking(bookingid, '');
 
    expect(response.status()).toBe(403);
  });
 
  test('creating a booking with an invalid payload is rejected', async ({ api }) => {
    // Missing required fields — the API must not create a booking.
    const response = await api.createBooking({ firstname: 'OnlyName' } as unknown as Booking);
 
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.ok()).toBe(false);
  });
});
```
 
---
 
## 13. Running the tests
 
```powershell
npx playwright test --project=api          # API tests (no browser)
npx playwright test --project=chromium     # UI on Chromium
npx playwright test --project=chromium --project=firefox --project=webkit   # all 3 browsers
npm test                                   # everything
npm run test:smoke                         # only @smoke
npm run test:headed                        # headed (visible browser)
```
 
---
 
## 14. Reporting
 
Two reports are produced on every run.
 
### Playwright HTML report
```powershell
npm test
npm run report        # opens playwright-report (has video + trace + screenshots)
```
 
### Allure report (colorful + SAP watermark)
 
**`assets/watermark.svg`** — light-grey background watermark:
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="380" viewBox="0 0 1200 380">
  <text x="600" y="180" font-family="Segoe UI, Arial, sans-serif" font-size="150" font-weight="800" fill="#c8ccd2" text-anchor="middle">SAP</text>
  <text x="600" y="290" font-family="Segoe UI, Arial, sans-serif" font-size="66" font-weight="600" letter-spacing="16" fill="#d4d8de" text-anchor="middle">QA AUTOMATION</text>
</svg>
```
 
**`scripts/brand-allure.mjs`** — injects the watermark into the generated report:
```js
// Injects a light-grey SAP-Client watermark that fits the report width as a
// non-interactive full-page background overlay. Re-run after each generate.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
 
const indexHtml = resolve('allure-report', 'index.html');
const watermarkPath = resolve('assets', 'watermark.svg');
 
if (!existsSync(indexHtml)) {
  console.error('allure-report/index.html not found — run "allure generate" first.');
  process.exit(1);
}
 
const dataUri = `data:image/svg+xml;base64,${readFileSync(watermarkPath).toString('base64')}`;
let html = readFileSync(indexHtml, 'utf8');
 
const style = `<style id="sap-client-branding">
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 2147483000;
    pointer-events: none;
    background-image: url("${dataUri}");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 92% auto;
    opacity: 0.5;
  }
</style>`;
 
if (html.includes('id="sap-client-branding"')) {
  console.log('Branding already present in allure-report/index.html.');
} else {
  html = html.replace('</head>', `${style}\n</head>`);
  writeFileSync(indexHtml, html);
  console.log('Branded allure-report/index.html with the light-grey SAP-Client watermark.');
}
```
 
Generate and view:
```powershell
npm test                 # produces allure-results
npm run allure:generate  # builds allure-report + injects branding
npm run allure:open      # serves it (needs Java)
# shortcut:
npm run report:allure
```
 
---
 
## 15. CI pipeline
 
### `.github/workflows/playwright.yml`
```yaml
name: Playwright Tests
 
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
 
jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
 
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
 
      - name: Install dependencies
        run: npm ci
 
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
 
      - name: Run tests
        run: npm test
 
      - name: Upload HTML report
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```
 
---
 
## 16. Git — small logical commits
 
```powershell
git init
git add .gitignore .env.example package.json package-lock.json tsconfig.json playwright.config.ts
git commit -m "chore: scaffold Playwright + TypeScript project"
git add src/config; git commit -m "feat: add central environment config"
git add src/pages; git commit -m "feat: add Page Object Model"
git add src/data src/fixtures/test-options.ts; git commit -m "feat: add UI test data and fixtures"
git add tests/auth.spec.ts tests/product-browsing.spec.ts tests/cart.spec.ts tests/checkout.spec.ts
git commit -m "test: UI scenarios"
git add src/api src/data/bookings.ts src/fixtures/api-fixtures.ts; git commit -m "feat: add Restful-Booker API client and fixtures"
git add tests/api; git commit -m "test: API automation and chaining"
git add assets scripts; git commit -m "chore: add Allure branding"
git add .github docs; git commit -m "docs: guide and CI"
```
 
---
 
## 17. Running in another environment
 
```powershell
# option A: a local .env file
Copy-Item .env.example .env   # then edit BASE_URL / API_BASE_URL / credentials
 
# option B: per-run variables (PowerShell)
$env:BASE_URL="https://staging.example.com"; $env:API_BASE_URL="https://api.staging.example.com"; npm test
```
 
Behind a corporate proxy, set `HTTPS_PROXY` / `HTTP_PROXY` — the API context honours it automatically.
 
---
 
## 18. Troubleshooting
 
| Problem | Cause / Fix |
|---|---|
| `getaddrinfo ENOTFOUND restful-booker.herokuapp.com` | Behind a proxy. Set `HTTPS_PROXY`/`HTTP_PROXY`; the API fixture injects it. |
| WebKit test occasionally fails first try | WebKit timing; `retries: 3` recovers it. Verify with `--project=webkit`. |
| "Apple monitor 24" not found | It's not on the first catalogue page — filter the category first (checkout spec does this). |
| Allure report won't open | Java not installed; install JDK 8+ and retry `npm run allure:open`. |
| Browsers missing | Run `npx playwright install` (or `npx playwright install firefox webkit`). |
 
---
 
### Build order recap
Scaffold → config/env → base + one page → fixtures → one test (run it) → remaining pages/tests → API client → API fixtures/tests → reporting → CI → commit. Each step stays runnable so you can verify as you go.
 
Node.js — Run JavaScript Everywhere
Node.js® is a free, open-source, cross-platform JavaScript runtime environment that lets developers create servers, web apps, command line tools and scripts.
 