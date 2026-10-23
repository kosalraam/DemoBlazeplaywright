import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { NavBar } from './navbar.component';

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

  async signup(username: string, password: string): Promise<string> {
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

  /** Returns null on successful login, otherwise the native alert message. */
  async login(username: string, password: string): Promise<string | null> {
    await this.waitForModalsClosed();
    await this.nav.openLogin();
    await expect(this.loginModal).toBeVisible();
    await this.loginUsername.fill(username);
    await this.loginPassword.fill(password);

    const dialogMessage = this.captureDialog();
    await this.loginSubmit.click();

    return Promise.race<string | null>([
      this.nav.loggedInUser.waitFor({ state: 'visible', timeout: 10_000 })
        .then(() => null)
        .catch(() => null),
      dialogMessage
    ]);
  }

  private async waitForModalsClosed(): Promise<void> {
    await this.page.locator('.modal-backdrop')
      .waitFor({ state: 'detached', timeout: 5_000 })
      .catch(() => undefined);
  }
}
