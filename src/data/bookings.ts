import type { Booking } from '../api/booker-client';
import { config } from '../config/env';

export const ADMIN_CREDENTIALS = config.apiCredentials;

export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: 'John',
    lastname: 'Doe',
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2026-01-01', checkout: '2026-01-10' },
    additionalneeds: 'Breakfast',
    ...overrides
  };
}
