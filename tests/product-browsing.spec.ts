import { test, expect } from '../src/fixtures/test-options';
import { CATEGORIES, PRODUCTS } from '../src/data/products';

test.describe('Product browsing', () => {
  test('TC01-The home page lists products @smoke', async ({ home }) => {
    await home.goto();
    const titles = await home.productTitles();
    expect(titles.length).toBeGreaterThan(0);
  });

  for (const category of CATEGORIES) {
    test(`TC02-Filtering by ${category} shows at least one product`, async ({ home }) => {
      await home.goto();
      await home.filterByCategory(category);
      const titles = await home.productTitles();
      console.log(`titles.length: ${titles.length}`);
      expect(titles.length).toBeGreaterThan(0);
    });
  }

  test('TC03-A product detail page shows name, price and add-to-cart', async ({ home, product }) => {
    await home.goto();
    await home.openProduct(PRODUCTS.phone.name);
    await expect(product.name).toHaveText(PRODUCTS.phone.name);
    await expect(product.price).toContainText('$');
    await expect(product.addToCartButton).toBeVisible();
    expect(await product.priceValue()).toBeGreaterThan(0);
  });
});
