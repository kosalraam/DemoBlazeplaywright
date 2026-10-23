import { type Locator, type Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export interface OrderDetails {
  name?: string;
  country?: string;
  city?: string;
  card?: string;
  month?: string;
  year?: string;
}

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
    return (await this.rows.locator('td:nth-child(2)').allTextContents())
      .map((title) => title.trim());
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

  async completePurchase(details: OrderDetails): Promise<string> {
    await this.fillOrder(details);
    await this.purchaseButton.click();
    await expect(this.confirmation).toBeVisible();
    return (await this.confirmation.textContent())?.trim() ?? '';
  }

  async submitOrderExpectingValidation(details: OrderDetails): Promise<string> {
    await this.fillOrder(details);
    const dialogMessage = this.captureDialog();
    await this.purchaseButton.click();
    return dialogMessage;
  }
}
