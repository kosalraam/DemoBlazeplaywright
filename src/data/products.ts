import type { Category } from '../pages/home.page';

export interface ProductRef {
  name: string;
  category: Category;
}

export const PRODUCTS = {
  phone: { name: 'Samsung galaxy s7', category: 'Phones' },
  laptop: { name: 'Sony vaio i7', category: 'Laptops' },
  monitor: { name: 'Apple monitor 24', category: 'Monitors' }
} satisfies Record<string, ProductRef>;

export const CATEGORIES: Category[] = ['Phones', 'Laptops', 'Monitors'];

export const VALID_ORDER = {
  name: 'Kosal Raam',
  country: 'United Kingdom',
  city: 'London',
  card: '801511488773586670',
  month: '12',
  year: '2027'
};
