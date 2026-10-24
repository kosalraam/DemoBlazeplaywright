import { test, expect } from '../src/fixtures/test-options';
import { PRODUCTS, VALID_ORDER } from '../src/data/products';

test.describe('Checkout', () => {
  test('TC01-Edge case testcase: A shopper can complete an end-to-end purchase @smoke', async ({
    home, product, cart, nav
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

    const chargedAmount = Number(confirmation.match(/Amount:\s*(\d+)/)?.[1]);
    expect(chargedAmount).toBe(cartTotal);
  });

  test('TC02-Purchase is blocked when name and card are empty Negative tescase', async ({ home, product, cart, nav }) => {
    await home.goto();
    await home.filterByCategory(PRODUCTS.monitor.category);
    await home.openProduct(PRODUCTS.monitor.name);
    await product.addToCart();

    await nav.openCart();
    await expect.poll(async () => cart.itemCount()).toBe(1);
    
    await cart.placeOrder();
    const alert = await cart.submitOrderExpectingValidation({ country: 'UK', city: 'London' });
    expect(alert).toContain('Please fill out Name and Creditcard');
  });
});
