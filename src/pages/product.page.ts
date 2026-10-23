import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

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

  async addToCart(): Promise<string> {
    const dialogMessage = this.captureDialog();
    await this.addToCartButton.click();
    return dialogMessage;
  }

  async priceValue(): Promise<number> {
    const raw = (await this.price.textContent()) ?? '';
    const digits = raw.replace(/[^0-9.]/g, '');
    return Number(digits);
  }
}
