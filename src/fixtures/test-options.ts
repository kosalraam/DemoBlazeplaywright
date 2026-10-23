import { test as base, expect } from '@playwright/test';
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

export const test = base.extend<Fixtures>({
  nav: async ({ page }, use) => use(new NavBar(page)),
  auth: async ({ page }, use) => use(new AuthModal(page)),
  home: async ({ page }, use) => use(new HomePage(page)),
  product: async ({ page }, use) => use(new ProductPage(page)),
  cart: async ({ page }, use) => use(new CartPage(page))
});

export { expect };
