import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export type Category = 'Phones' | 'Laptops' | 'Monitors';

export class HomePage extends BasePage {
  private readonly productLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.productLinks = page.locator('a.hrefch');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.productLinks.first()).toBeVisible();
  }

  async filterByCategory(category: Category): Promise<void> {
    await this.page.getByRole('link', { name: category, exact: true }).click();
    await expect.poll(async () => this.productLinks.count(), { timeout: 15_000 })
      .toBeGreaterThan(0);
  }

  async productTitles(): Promise<string[]> {
    return (await this.productLinks.allTextContents()).map((title) => title.trim());
  }

  async openProduct(name: string): Promise<void> {
    const product = this.productLinks.filter({ hasText: name }).first();
    await expect(product).toBeVisible();
    await product.click();
  }
}
