import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

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
