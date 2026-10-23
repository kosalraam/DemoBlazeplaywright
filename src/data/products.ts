import type { Category } from '../pages/home.page';

export interface ProductRef {
  name: string;
  category: Category;
}

export const PRODUCTS = {
  phone: { name: 'Samsung galaxy s6', category: 'Phones' },
  laptop: { name: 'Sony vaio i5', category: 'Laptops' },
  monitor: { name: 'Apple monitor 24', category: 'Monitors' }
} satisfies Record<string, ProductRef>;

export const CATEGORIES: Category[] = ['Phones', 'Laptops', 'Monitors'];

export const VALID_ORDER = {
  name: 'Jane Doe',
  country: 'United Kingdom',
  city: 'London',
  card: '4111111111111111',
  month: '12',
  year: '2027'
};
