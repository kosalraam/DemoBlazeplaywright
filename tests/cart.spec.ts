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
